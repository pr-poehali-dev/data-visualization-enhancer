"""
CRUD для клиентских проектов (заявок на накрутку отзывов).
Также управление уведомлениями пользователей (?resource=notifications).
Клиент создаёт проект, менеджер видит все проекты и управляет ими.
"""
import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
    "Content-Type": "application/json",
}


def handle_notifications(method, params, body, cur, conn):
    if method == "GET":
        user_id = params.get("user_id")
        if not user_id:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нужен user_id"})}
        cur.execute(
            "SELECT id, title, message, is_read, created_at FROM notifications WHERE user_id = %s ORDER BY created_at DESC LIMIT 50",
            (user_id,)
        )
        rows = cur.fetchall()
        conn.close()
        result = [{"id": r[0], "title": r[1], "message": r[2], "is_read": r[3], "created_at": str(r[4])} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(result, ensure_ascii=False)}

    if method == "POST":
        action = body.get("action")
        if action == "read":
            cur.execute("UPDATE notifications SET is_read = TRUE WHERE id = %s", (body.get("id"),))
            conn.commit()
            conn.close()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}
        if action == "read_all":
            cur.execute("UPDATE notifications SET is_read = TRUE WHERE user_id = %s", (body.get("user_id"),))
            conn.commit()
            conn.close()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn.close()
    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Неизвестный запрос"})}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod")
    params = event.get("queryStringParameters") or {}
    body = json.loads(event.get("body") or "{}")

    conn = get_conn()
    cur = conn.cursor()

    if params.get("resource") == "notifications":
        return handle_notifications(method, params, body, cur, conn)

    # Создать проект (клиент)
    if method == "POST":
        user_id = body.get("user_id")
        site_url = (body.get("site_url") or "").strip()
        reviews_per_day = int(body.get("reviews_per_day") or 10)
        if not user_id or not site_url:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите user_id и сайт"})}
        cur.execute(
            "INSERT INTO projects (user_id, site_url, reviews_per_day, status) VALUES (%s, %s, %s, 'pending') RETURNING id, site_url, reviews_per_day, status, created_at",
            (user_id, site_url, reviews_per_day)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "id": row[0], "site_url": row[1], "reviews_per_day": row[2], "status": row[3], "created_at": str(row[4])
        })}

    # Получить проекты клиента или все (admin)
    if method == "GET":
        user_id = params.get("user_id")
        if user_id:
            cur.execute(
                "SELECT id, site_url, reviews_per_day, status, created_at FROM projects WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,)
            )
        else:
            cur.execute(
                "SELECT p.id, p.site_url, p.reviews_per_day, p.status, p.created_at, u.phone FROM projects p JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC"
            )
        rows = cur.fetchall()
        conn.close()
        if user_id:
            result = [{"id": r[0], "site_url": r[1], "reviews_per_day": r[2], "status": r[3], "created_at": str(r[4])} for r in rows]
        else:
            result = [{"id": r[0], "site_url": r[1], "reviews_per_day": r[2], "status": r[3], "created_at": str(r[4]), "phone": r[5]} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(result)}

    # Обновить статус (admin)
    if method == "PUT":
        project_id = body.get("id")
        status = body.get("status")
        reviews_per_day = body.get("reviews_per_day")
        if not project_id:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нет id"})}
        if status:
            cur.execute("UPDATE projects SET status = %s, updated_at = NOW() WHERE id = %s", (status, project_id))
        if reviews_per_day:
            cur.execute("UPDATE projects SET reviews_per_day = %s, updated_at = NOW() WHERE id = %s", (reviews_per_day, project_id))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    # Удалить проект (admin)
    if method == "DELETE":
        project_id = params.get("id")
        if not project_id:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нет id"})}
        cur.execute("UPDATE projects SET status = 'deleted' WHERE id = %s", (project_id,))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn.close()
    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
