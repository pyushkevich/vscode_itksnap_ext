const vscode = require('vscode');

/**
 * When VS Code connects via Remote SSH using direct host details (rather than
 * an ~/.ssh/config alias), the URI authority is "ssh-remote+<hex>" where the
 * hex decodes to a JSON object like {"hostName":"localhost","user":"testuser","port":2222}.
 * Convert that into the user@host:port form that ITK-SNAP's URL handler expects.
 * For plain SSH config aliases ("ssh-remote+myserver"), pass through unchanged.
 */
function resolveRemoteAuthority(rawAuthority) {
  const host = rawAuthority.replace(/^ssh-remote\+/, '');
  try {
    const json = Buffer.from(host, 'hex').toString('utf8');
    const info = JSON.parse(json);
    if (!info.hostName) return host;
    const userAt   = info.user ? `${info.user}@` : '';
    const colonPort = (info.port && info.port !== 22) ? `:${info.port}` : '';
    return `${userAt}${info.hostName}${colonPort}`;
  } catch {
    return host; // plain SSH config alias — use as-is
  }
}

async function openInItkSnap(uri) {
  let target;
  if (uri.scheme === 'vscode-remote') {
    const connection = resolveRemoteAuthority(uri.authority);
    target = vscode.Uri.parse(`itksnap-sftp://${connection}${uri.path}`);
  } else {
    // Local file — use the plain file URI; macOS opens it via
    // the .itksnap / .nii file association
    target = uri;
  }
  await vscode.env.openExternal(target);
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * Read-only custom editor shown when a .nii / .nii.gz file is opened in the
 * editor area. Does not read or parse the image bytes (files can be large) —
 * it just shows the filename and a button to hand the file off to ITK-SNAP.
 */
class ItkSnapImageEditorProvider {
  constructor(context) {
    this.context = context;
  }

  async openCustomDocument(uri) {
    return { uri, dispose: () => {} };
  }

  async resolveCustomEditor(document, webviewPanel) {
    webviewPanel.webview.options = { enableScripts: true };
    webviewPanel.webview.html = this.getHtml(webviewPanel.webview, document.uri);

    webviewPanel.webview.onDidReceiveMessage((message) => {
      if (message.type === 'open') {
        openInItkSnap(document.uri);
      }
    });
  }

  getHtml(webview, uri) {
    const filename = uri.path.split('/').pop();
    const nonce = getNonce();
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    margin: 0;
    font-family: var(--vscode-font-family);
    color: var(--vscode-editor-foreground);
    background-color: var(--vscode-editor-background);
    text-align: center;
  }
  .filename {
    font-size: 1.1em;
    margin-bottom: 1.5em;
    word-break: break-all;
    padding: 0 2em;
  }
  button {
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    color: var(--vscode-button-foreground);
    background-color: var(--vscode-button-background);
    border: none;
    padding: 8px 20px;
    border-radius: 2px;
    cursor: pointer;
  }
  button:hover {
    background-color: var(--vscode-button-hoverBackground);
  }
</style>
</head>
<body>
  <div class="filename">${filename}</div>
  <button id="openBtn">Open in ITK-SNAP</button>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.getElementById('openBtn').addEventListener('click', () => {
      vscode.postMessage({ type: 'open' });
    });
  </script>
</body>
</html>`;
  }
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('itksnap.open', async (uri) => {
      await openInItkSnap(uri);
    })
  );

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      'itksnap.imagePreview',
      new ItkSnapImageEditorProvider(context),
      {
        webviewOptions: { retainContextWhenHidden: false },
        supportsMultipleEditorsPerDocument: false
      }
    )
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
