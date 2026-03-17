"""
Регистрация и вход клиентов по номеру телефона и паролю.
Возвращает user_id и phone при успехе.
"""
import json
import os
import hashlib
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def handler(event: dict, context) -> dict:
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    body = json.loads(event.get("body") or "{}")
    action = body.get("action")
    phone = (body.get("phone") or "").strip()
    password = body.get("password") or ""

    if not phone or not password:
        return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Укажите телефон и пароль"})}

    conn = get_conn()
    cur = conn.cursor()

    if action == "register":
        cur.execute("SELECT id FROM users WHERE phone = %s", (phone,))
        if cur.fetchone():
            conn.close()
            return {"statusCode": 409, "headers": headers, "body": json.dumps({"error": "Этот номер уже зарегистрирован"})}
        pw_hash = hash_password(password)
        cur.execute("INSERT INTO users (phone, password_hash) VALUES (%s, %s) RETURNING id", (phone, pw_hash))
        user_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"user_id": user_id, "phone": phone})}

    elif action == "login":
        pw_hash = hash_password(password)
        cur.execute("SELECT id FROM users WHERE phone = %s AND password_hash = %s", (phone, pw_hash))
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"statusCode": 401, "headers": headers, "body": json.dumps({"error": "Неверный номер или пароль"})}
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"user_id": row[0], "phone": phone})}

    conn.close()
    return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Неизвестное действие"})}
