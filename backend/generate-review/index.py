"""
Генерирует реалистичные отзывы для сайта клиента с помощью OpenAI GPT.
Сохраняет отзывы в БД, возвращает список сгенерированных отзывов.
"""
import json
import os
import random
import psycopg2
import urllib.request


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}

RUSSIAN_NAMES = [
    "Александр К.", "Мария С.", "Дмитрий В.", "Елена П.", "Сергей Н.",
    "Ольга М.", "Андрей Т.", "Наталья Б.", "Иван Ж.", "Татьяна Р.",
    "Михаил Ф.", "Анна Г.", "Алексей Д.", "Юлия З.", "Владимир Л.",
    "Светлана Е.", "Николай О.", "Ирина Х.", "Павел У.", "Екатерина А.",
]


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def generate_review_gpt(site_url: str, count: int) -> list:
    api_key = os.environ.get("OPENAI_API_KEY", "")
    prompt = f"""Ты пишешь реалистичные отзывы покупателей/клиентов для сайта {site_url}.
Сгенерируй {count} разных отзывов на русском языке. Отзывы должны быть:
- Естественными, как будто написаны живыми людьми
- Разной длины (1-4 предложения)
- Разного стиля (официальный, разговорный, эмоциональный)
- Позитивными (4-5 звёзд)
- Конкретными, упоминать удобство сайта, быструю доставку, хороший сервис, качество и т.д.

Верни JSON массив объектов: [{{"rating": 5, "text": "текст отзыва"}}]
Только JSON, никакого другого текста."""

    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.9,
        "max_tokens": 2000,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=25) as resp:
        data = json.loads(resp.read().decode())

    content = data["choices"][0]["message"]["content"].strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    return json.loads(content.strip())


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod")
    params = event.get("queryStringParameters") or {}

    # GET — получить все отзывы проекта
    if method == "GET":
        project_id = params.get("project_id")
        conn = get_conn()
        cur = conn.cursor()
        if project_id:
            cur.execute(
                "SELECT id, author_name, rating, text, created_at FROM reviews WHERE project_id = %s ORDER BY created_at DESC",
                (project_id,)
            )
        else:
            cur.execute(
                "SELECT r.id, r.author_name, r.rating, r.text, r.created_at, r.project_id, p.site_url FROM reviews r JOIN projects p ON p.id = r.project_id ORDER BY r.created_at DESC LIMIT 100"
            )
        rows = cur.fetchall()
        conn.close()
        if project_id:
            result = [{"id": r[0], "author_name": r[1], "rating": r[2], "text": r[3], "created_at": str(r[4])} for r in rows]
        else:
            result = [{"id": r[0], "author_name": r[1], "rating": r[2], "text": r[3], "created_at": str(r[4]), "project_id": r[5], "site_url": r[6]} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(result, ensure_ascii=False)}

    # POST — сгенерировать отзывы
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        project_id = body.get("project_id")
        site_url = body.get("site_url", "")
        count = min(int(body.get("count", 5)), 20)

        if not project_id or not site_url:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нужны project_id и site_url"})}

        gpt_reviews = generate_review_gpt(site_url, count)

        conn = get_conn()
        cur = conn.cursor()
        saved = []
        for rev in gpt_reviews:
            name = random.choice(RUSSIAN_NAMES)
            rating = rev.get("rating", 5)
            text = rev.get("text", "")
            if not text:
                continue
            cur.execute(
                "INSERT INTO reviews (project_id, author_name, rating, text) VALUES (%s, %s, %s, %s) RETURNING id, created_at",
                (project_id, name, rating, text)
            )
            row = cur.fetchone()
            saved.append({"id": row[0], "author_name": name, "rating": rating, "text": text, "created_at": str(row[1])})
        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"generated": saved, "count": len(saved)}, ensure_ascii=False)}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
