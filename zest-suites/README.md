# Zest Suites

Static multi-page hotel demo website. In Vercel, set **Root Directory** to `zest-suites`. No framework preset, install command or build command is required; `index.html` and the `.html` pages are served as static files.

Local preview from the repository root:

```bash
python3 -m http.server 8081 --directory zest-suites
```

Room photos are bundled in `assets/rooms/`; all eight catalog records use these local files.
