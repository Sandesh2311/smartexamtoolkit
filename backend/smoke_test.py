import requests

BASE = 'http://127.0.0.1:5000/api'

def register_and_create():
    r = requests.post(f'{BASE}/register', json={'email': 'smoketest+2@example.com', 'password': 'password123'})
    print('register', r.status_code, r.text)
    token = None
    try:
        token = r.json().get('access_token')
    except:
        pass
    headers = {'Authorization': f'Bearer {token}'} if token else {}
    r2 = requests.post(f'{BASE}/payments/create', json={'amount': 99}, headers=headers)
    print('create_order', r2.status_code, r2.text)

if __name__ == '__main__':
    register_and_create()
