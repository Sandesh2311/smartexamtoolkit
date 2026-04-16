from flask import Blueprint, request, jsonify, current_app, abort
from backend import db
from backend.models import User, Payment
from backend.openai_client import generate_completion
from backend.payments import create_razorpay_order, verify_razorpay_signature, verify_webhook_signature
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import json

bp = Blueprint('api', __name__)

def _current_user():
    user_id = get_jwt_identity()
    if user_id is not None:
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            pass
    if user_id is None:
        return None
    return User.query.get(user_id)

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'email and password required'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'user exists'}), 400
    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({'message': 'registered', 'user_id': user.id, 'access_token': access_token})


@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'invalid credentials'}), 401
    access_token = create_access_token(identity=str(user.id))
    return jsonify({'message': 'ok', 'user_id': user.id, 'access_token': access_token})


@bp.route('/user/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    if user_id is not None:
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            pass
    user = User.query.get(user_id)
    if not user:
        abort(404)
    return jsonify({'user': {'id': user.id, 'email': user.email, 'created_at': user.created_at.isoformat()}})


@bp.route('/openai/generate', methods=['POST'])
def openai_generate():
    data = request.get_json() or {}
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': 'prompt required'}), 400
    try:
        resp = generate_completion(prompt)
        return jsonify({'result': resp})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'error': str(e)}), 500


@bp.route('/payments/create', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json() or {}
    amount = data.get('amount')
    currency = data.get('currency', 'INR')
    current_app.logger.info('Payments.create called: amount=%s currency=%s by user=%s', amount, currency, get_jwt_identity())
    if not amount:
        return jsonify({'error': 'amount required'}), 400
    try:
        order = create_razorpay_order(amount, currency)
        user_id = get_jwt_identity()
        if user_id is not None:
            try:
                user_id = int(user_id)
            except (TypeError, ValueError):
                pass
        payment = Payment(order_id=order['id'], amount=order['amount'], currency=order['currency'], status='created', user_id=user_id)
        db.session.add(payment)
        db.session.commit()
        return jsonify({'order': order})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'error': str(e)}), 500


@bp.route('/payments/verify', methods=['POST'])
def verify_payment():
    data = request.get_json() or {}
    order_id = data.get('razorpay_order_id')
    payment_id = data.get('razorpay_payment_id')
    signature = data.get('razorpay_signature')
    if verify_razorpay_signature(order_id, payment_id, signature):
        payment = Payment.query.filter_by(order_id=order_id).first()
        if payment:
            payment.payment_id = payment_id
            payment.signature = signature
            payment.status = 'paid'
            db.session.commit()
        return jsonify({'status': 'ok'})
    return jsonify({'status': 'failed'}), 400


@bp.route('/payments/webhook', methods=['POST'])
def razorpay_webhook():
    # Razorpay sends a signature in the header 'X-Razorpay-Signature'
    signature = request.headers.get('X-Razorpay-Signature') or request.headers.get('x-razorpay-signature')
    body = request.get_data()
    try:
        if not signature or not verify_webhook_signature(signature, body):
            current_app.logger.warning('Invalid webhook signature')
            return jsonify({'status': 'invalid signature'}), 400
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'status': 'error'}), 500

    payload = request.get_json() or {}
    # Handle common events like payment.captured
    event = payload.get('event')
    try:
        if event == 'payment.captured':
            payment_entity = payload.get('payload', {}).get('payment', {}).get('entity', {})
            order_id = payment_entity.get('order_id')
            payment_id = payment_entity.get('id')
            if order_id:
                payment = Payment.query.filter_by(order_id=order_id).first()
                if payment:
                    payment.payment_id = payment_id
                    payment.status = 'paid'
                    db.session.commit()
        # Add more event handling as needed
        return jsonify({'status': 'ok'})
    except Exception as e:
        current_app.logger.exception(e)
        return jsonify({'status': 'error'}), 500



@bp.route('/downloads/consume', methods=['POST'])
@jwt_required()
def consume_download():
    user = _current_user()
    if not user:
        abort(404)
    if user.is_premium:
        return jsonify({'allowed': True, 'remaining': None, 'is_premium': True})
    if (user.free_pdf_used or 0) >= 1:
        return jsonify({'allowed': False, 'remaining': 0, 'is_premium': False, 'error': 'free limit reached'}), 403
    user.free_pdf_used = (user.free_pdf_used or 0) + 1
    db.session.commit()
    return jsonify({'allowed': True, 'remaining': 0, 'is_premium': False})
@bp.route('/config', methods=['GET'])
def get_config():
    # Return only the public Razorpay key id for client-side checkout
    return jsonify({'razorpay_key_id': current_app.config.get('RAZORPAY_KEY_ID')})
