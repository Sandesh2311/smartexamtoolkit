# Deployment guide

## Frontend (Vercel)
- Root directory: `frontend/`
- This is a static site, so no build step is required unless you add a bundler later.
- In Vercel UI, create a new project and set the Root Directory to `frontend`.
- If you use the Vercel CLI:
  ```bash
  cd "c:\projects\smartexamtoolkit main\frontend"
  vercel
  vercel --prod
  ```

## Backend (Render)
- Create a new Web Service on Render connected to this repo.
- Root Directory: `backend`
- Build / Install command:
  ```bash
  pip install -r requirements.txt
  ```
- Start command: `gunicorn backend.app:app --bind 0.0.0.0:$PORT`
- Set Render environment variables from your `.env` file:
  - `OPENAI_API_KEY`
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `SECRET_KEY`
  - `RAZORPAY_WEBHOOK_SECRET` (if you use webhooks)
- After deploy, note the Render URL, for example:
  `https://your-backend.onrender.com`

## Frontend + backend connection
The frontend uses API calls to the backend at runtime.

### Recommended Vercel setup
1. Deploy the backend to Render.
2. Update `frontend/static/js/script.js` so production API requests go to your Render service:
   ```js
   const API_BASE = window.API_BASE
     || ((location.hostname === 'localhost' || location.hostname === '127.0.0.1')
         ? 'http://127.0.0.1:5000/api'
         : 'https://your-backend.onrender.com/api');
   ```
3. Deploy the frontend to Vercel.

### Optional Vercel rewrite
If you prefer keeping `API_BASE = '/api'` in production, add `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.onrender.com/api/:path*"
    }
  ]
}
```
Then deploy the frontend to Vercel.

## Local testing
- Frontend: serve `frontend/` with a static server:
  ```bash
  cd "c:\projects\smartexamtoolkit main\frontend"
  python -m http.server 8000
  ```
- Backend: from project root:
  ```bash
  python -m backend.app
  ```

---

Notes:
- The backend currently uses SQLite, which is fine for testing but not ideal for production persistence on Render.
- Use a separate managed database later if you need durable production storage.
