# DocShit

DocShit converts documents on your computer. Nothing is uploaded.

It runs on Mac and Windows. One file, a batch of files, or a whole folder.

## Conversions

- Markdown, HTML, plain text, Word, and rich text, in either direction, plus PDF
- PDF to text, Markdown, HTML, Word, PNG, or JPEG
- Excel, ODS, CSV, TSV, and JSON, including PDF and HTML
- Tables in HTML or Markdown to CSV, Excel, or JSON
- PNG, JPEG, WebP, GIF, BMP, SVG, and icons, plus a PDF of an image
- Documents and spreadsheets to a PNG or JPEG

Word from a PDF keeps the words, not the original page layout. A PDF with more than 40 pages exports the first 40 as images. After a file is saved, DocShit can open your mail app with that file attached. You send the message yourself. DocShit does not keep an email password and does not send the message.

A GIF keeps the first frame.

## Download

Mac and Windows downloads are on the [releases page](https://github.com/joshkelman/DocShit/releases).

- Apple silicon (M1 or newer): `DocShit-0.1.0-arm64.dmg`
- Intel Mac: `DocShit-0.1.0.dmg`
- Windows: `DocShit.Setup.0.1.0.exe`

1. Download the disk image that matches the Mac and open it.
2. Drag DocShit to Applications.
3. macOS will say Apple could not verify DocShit, and it will not open. Open Terminal and run:

```bash
xattr -cr /Applications/DocShit.app
open /Applications/DocShit.app
```

That block is there because this copy is not notarized with Apple.

On Windows, run `DocShit.Setup.0.1.0.exe`. If Windows says it protected your PC, choose More info, then Run anyway. This copy is not signed with a Windows certificate. The installer is for 64-bit Windows.

## Install from source

From a Mac, this builds a disk image:

```bash
npm install
npm test
npm run dist:mac
```

The installer is `release/DocShit-0.1.0-arm64.dmg` or the Intel disk image next to it. Open it and drag DocShit to Applications.

From Windows:

```bash
npm install
npm test
npm run dist:win
```

Run the setup file in `release`.

`npm start` opens the app without making an installer.
