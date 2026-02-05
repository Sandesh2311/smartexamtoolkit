# SmartExam Toolkit - Backend (Flask)

Quick setup and usage for the Flask backend that provides:
- User registration/login (simple)
- OpenAI integration (via `OPENAI_API_KEY`) ✅
- Razorpay order creation and verification ✅
- SQLite (default) via SQLAlchemy

---

## Setup

1. Create a Python virtual environment and activate it.

2. Install dependencies:

   pip install -r backend/requirements.txt

3. Copy `.env.example` to `.env` and fill in keys:

   - `OPENAI_API_KEY` (your OpenAI key)
   - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (Razorpay test keys)
   - Set `SECRET_KEY` (production only)

4. Initialize the database:

   python backend/init_db.py

5. Run the app (development):

   set FLASK_APP=backend.app   (Windows PowerShell: $env:FLASK_APP = "backend.app")
   flask run

The API will be served under `http://127.0.0.1:5000/api/`.

---

## Example endpoints

- Register: POST `/api/register` JSON {"email":"a@b.com","password":"secret"}
- Login: POST `/api/login` JSON {"email":"a@b.com","password":"secret"}
- OpenAI generate: POST `/api/openai/generate` JSON {"prompt":"Write a short summary of X"}
- Create Razorpay order: POST `/api/payments/create` JSON {"amount": 100.0}
- Verify payment: POST `/api/payments/verify` JSON with Razorpay fields

---

## Notes
- Keys are read from environment variables (do NOT commit real keys).
- JWT authentication is included. Endpoints that create orders require a JWT access token (returned at registration/login). Store the token securely on the client (e.g. localStorage or secure cookie) and send in an `Authorization: Bearer <token>` header.
- A Razorpay webhook endpoint is available at `POST /api/payments/webhook`. Configure your Razorpay dashboard to point to this URL and set the webhook secret (`RAZORPAY_WEBHOOK_SECRET`) in your `.env`. The server verifies webhook signatures before processing events.
- This is a minimal starting point; improve auth (refresh tokens, secure cookies), add role checks, expand webhook handling, and add tests as needed.

