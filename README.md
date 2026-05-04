# ITK-SNAP Launcher — VS Code Extension

Adds an **"Open in ITK-SNAP"** context menu item to `.itksnap` workspace files
and NIfTI images (`.nii`, `.nii.gz`) in the VS Code Explorer.  Works for both
local files and files on **Remote SSH** servers.

## How it works

Right-clicking a supported file and choosing **Open in ITK-SNAP** constructs an
`itksnap-sftp://hostname/path` URL and hands it to the local machine via
`vscode.env.openExternal`.  macOS routes the `itksnap-sftp://` scheme to
ITK-SNAP, which strips the `itksnap-` prefix to obtain `sftp://hostname/path`
and loads the file over SSH.

For local files the plain `file://` URI is passed directly, opening via the
normal `.itksnap` / `.nii` file-type association.

## Prerequisites

- **macOS** with ITK-SNAP installed.  The `itksnap-sftp://` URL scheme is
  registered automatically the first time ITK-SNAP is launched.
- An SSH host alias in `~/.ssh/config` that matches the VS Code Remote SSH
  connection name.

## Installation

Install once on your local Mac — no installation needed on the remote server.

```bash
cd /path/to/vscode_ext
npx @vscode/vsce package --no-dependencies   # produces itksnap-launcher-x.x.x.vsix
code --install-extension itksnap-launcher-*.vsix
```

Or install directly from the VS Code Marketplace by searching for
**ITK-SNAP Launcher**.
