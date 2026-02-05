import os
import hmac
import hashlib
import razorpay
from backend.config import Config


def get_client():
    key_id = Config.RAZORPAY_KEY_ID
    key_secret = Config.RAZORPAY_KEY_SECRET
    if not key_id or not key_secret:
        raise RuntimeError('Razorpay keys not configured')
    return razorpay.Client(auth=(key_id, key_secret))


def create_razorpay_order(amount, currency='INR', receipt=None):
    """Create a Razorpay order.

    amount: numeric (rupees). Razorpay expects paise (integer), we'll convert.
    Returns the order object from Razorpay.
    """
    amount_paise = int(float(amount) * 100)
    client = get_client()
    data = {'amount': amount_paise, 'currency': currency, 'receipt': receipt or f'rec_{os.urandom(6).hex()}'}
    order = client.order.create(data=data)
    return order


def verify_razorpay_signature(order_id, payment_id, signature):
    """Verify the payment signature using HMAC SHA256."""
    key_secret = Config.RAZORPAY_KEY_SECRET
    if not key_secret:
        raise RuntimeError('Razorpay secret missing')
    msg = f"{order_id}|{payment_id}".encode()
    generated = hmac.new(key_secret.encode(), msg, hashlib.sha256).hexdigest()
    return hmac.compare_digest(generated, signature)


def verify_webhook_signature(signature, body_bytes):
    """Verify a Razorpay webhook payload using the webhook secret and raw body bytes."""
    secret = Config.RAZORPAY_WEBHOOK_SECRET
    if not secret:
        raise RuntimeError('Razorpay webhook secret not configured')
    generated = hmac.new(secret.encode(), body_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(generated, signature)
