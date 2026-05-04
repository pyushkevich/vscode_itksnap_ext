const vscode = require('vscode');

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('itksnap.open', async (uri) => {
      let target;
      if (uri.scheme === 'vscode-remote') {
        // When connected via Remote SSH, authority is e.g. "ssh-remote+myserver"
        // Extract the SSH host alias (matches your ~/.ssh/config entry)
        const host = uri.authority.replace(/^ssh-remote\+/, '');
        target = vscode.Uri.parse(`itksnap-sftp://${host}${uri.path}`);
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
