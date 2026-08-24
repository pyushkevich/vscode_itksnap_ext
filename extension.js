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

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('itksnap.open', async (uri) => {
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
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
