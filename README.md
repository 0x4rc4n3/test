# Multi-project repository

This repository contains two separate applications:

- **Zest Suites** — a static, multi-page hotel demo website in `zest-suites/`.
- **Apex-PQ** — the existing Flask/post-quantum identity project in `apex-pq/`.

## Zest Suites on Vercel

Import this repository into Vercel and set **Root Directory** to `zest-suites`. The website is plain HTML, CSS and JavaScript, so it needs no package installation or build command; Vercel can serve the folder as static output. The home page is `index.html`.

The room catalog contains eight distinct listings with locally bundled room photos. The other pages cover booking, login/registration, services, feedback and saved bookings. The booking and demo account data are stored in the browser's local storage.

To serve the site locally from the repository root:

```bash
python3 -m http.server 8081 --directory zest-suites
```

Then open `http://127.0.0.1:8081`.

## Run both projects with Docker Compose

The root `docker-compose.yml` keeps Apex-PQ on port `8080` and serves the static Zest Suites folder through Nginx on port `8081`:

```bash
docker compose up --build
```

For just the website:

```bash
docker compose up --build zest-suites
```

Stop containers with `docker compose down`.

## Apex-PQ

Apex-PQ remains in its original `apex-pq/` folder and is not part of the Vercel static website project. Its application, database files, wallet extension and Docker setup are unchanged by the Zest Suites refresh.

Run its native launcher from the repository root with:

```bash
cd apex-pq
APEX_DEMO_MODE=1 bash run.sh native
```

The application is configured to use port `8080`. See [`apex-pq/README.md`](apex-pq/README.md) for project-specific notes.
