# import os
# from pathlib import Path

# BASE_DIR = Path(__file__).resolve().parent


# class Config:
#     SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
#     SQLALCHEMY_DATABASE_URI = os.getenv(
#         "DATABASE_URL", f"sqlite:///{BASE_DIR / 'smart_exam.db'}"
#     )
#     SQLALCHEMY_TRACK_MODIFICATIONS = False

#     # External services
#     RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
#     RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
#     RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")
#     SAMBANOVA_API_KEY = os.getenv("SAMBANOVA_API_KEY")
import os
from pathlib import Path
from dotenv import load_dotenv
# add at top

load_dotenv()

class Config:
    ...
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


load_dotenv()  # 🔥 THIS WAS MISSING

BASE_DIR = Path(__file__).resolve().parent


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", f"sqlite:///{BASE_DIR / 'smart_exam.db'}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # External services
    RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
    RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")
    SAMBANOVA_API_KEY = os.getenv("SAMBANOVA_API_KEY")
