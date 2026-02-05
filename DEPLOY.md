# Deployment guide

## Frontend (Netlify)
- Publish directory: `frontend/` (select this in Netlify UI or set `publish = "frontend"` in settings).
- No build step required (static site). If you add a build step (e.g., a bundler), set the build command and publish folder accordingly.
- Example: drag & drop the `frontend/` folder in Netlify or connect your repo and set the publish directory to `frontend/`.

## Backend (Render)
- Create a new Web Service on Render connected to this repo.
- Start command: `gunicorn backend.app:app --bind 0.0.0.0:$PORT`
- Build / Install command: `pip install -r backend/requirements.txt`
- Make sure environment variables from `.env` are set in Render (DB uri, RAZORPAY keys, JWT secret, OPENAI keys, etc.).

## Local testing
- Frontend: serve `frontend/` with a static server (e.g., `python -m http.server 8000` inside `frontend/`).
- Backend: from project root: `python -m backend.app` (or use `gunicorn backend.app:app`).

---

If you want, I can: 
- Remove the old root-level frontend files (I currently left them unchanged), or
- Add `netlify.toml` or a Render `render.yaml` with example service configs.

Tell me which of these you'd like next. (I can do the removals or add config files.)