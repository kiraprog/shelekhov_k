# shelekhov_k
# Portfolio — Shelekhov Kirill (GitHub Pages)

## Quick start
1) Create a new GitHub repo (public).
2) Add these files to the repo root:
- index.html
- styles.css
- app.js
- videos.json

3) Enable GitHub Pages:
- Settings → Pages
- Build and deployment → Deploy from a branch
- Branch: main / root
Save.

Your site will appear at: https://<username>.github.io/<repo>/

## How to add / remove videos
Edit `videos.json` only.

Each item:
- id: unique string
- title: shown on the card
- format: "vertical" or "horizontal"
- source:
  - youtube: { "type": "youtube", "id": "VIDEO_ID" }
  - gdrive: { "type": "gdrive", "id": "FILE_ID" }
- note: optional subtitle under the title
- thumbUrl: optional custom thumbnail

### Google Drive embed (important)
To make Drive videos work:
1) Share → Anyone with the link → Viewer.
2) Use the file ID from:
   https://drive.google.com/file/d/FILE_ID/view
3) Put it into videos.json as:
   { "type": "gdrive", "id": "FILE_ID" }

## Local preview
Run:
python3 -m http.server 8000
Open:
http://localhost:8000
