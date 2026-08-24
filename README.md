# ITK-SNAP Launcher — VS Code Extension

Adds an **"Open in ITK-SNAP"** context menu item to `.itksnap` workspace files
and medical image files in the VS Code Explorer, covering the formats
ITK-SNAP itself supports: NIfTI (`.nii`, `.nii.gz`, `.nia`, `.nia.gz`),
MetaImage (`.mha`, `.mhd`), NRRD (`.nrrd`, `.nhdr`), GIPL (`.gipl`,
`.gipl.gz`), MINC (`.mnc`), VoxBo CUB (`.cub`, `.cub.gz`), VTK Image
(`.vtk`, `.vti`), single DICOM images (`.dcm`), Siemens Vision (`.ima`), and
GE (`.ge4`, `.ge5`). Works for both local files and files on **Remote SSH**
servers.

** THIS EXTENSION REQUIRES ITK-SNAP 4.6 OR LATER **

## How it works

Right-clicking a supported file and choosing **Open in ITK-SNAP** constructs an
`itksnap-sftp://hostname/path` URL and hands it to the local machine via
`vscode.env.openExternal`.  macOS routes the `itksnap-sftp://` scheme to
ITK-SNAP, which strips the `itksnap-` prefix to obtain `sftp://hostname/path`
and loads the file over SSH.

For local files the plain `file://` URI is passed directly, opening via the
normal `.itksnap` / `.nii` file-type association.

`.itksnap` workspace files open in VS Code's normal XML text editor (they
are plain XML). An **Open in ITK-SNAP** button (external-link icon) appears
in the editor title bar whenever a `.itksnap` file is the active editor, so
you don't have to switch back to the Explorer to launch it.

Opening a supported medical image file directly in the editor area
(double-click, not right-click) shows a simple preview pane with the
filename and an **Open in ITK-SNAP** button, instead of VS Code's "file is
not displayed" binary placeholder. It does not read or parse the image
data.

> **Note:** If you have another medical-image-viewer extension installed,
> VS Code will prompt you once to pick a default editor for a given
> extension (e.g. `*.nii.gz`). You can change this choice later via
> **Reopen Editor With...** from the editor tab context menu, or by editing
> the `workbench.editorAssociations` setting.

Note that `.hdr`, `.img`, and `.raw` (Analyze / raw binary formats) are
intentionally left out of both the context menu and the editor preview,
since those extensions are also used outside of medical imaging.

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
