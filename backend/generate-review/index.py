"""
Генерирует реалистичные отзывы для сайта клиента с помощью OpenAI GPT.
При недоступности GPT использует шаблонную генерацию.
Сохраняет отзывы в БД, возвращает список сгенерированных отзывов.
После генерации отправляет ежедневный отчёт в уведомления клиента.
"""
import json
import os
import random
import psycopg2
import urllib.request
from datetime import date


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
    "Роман С.", "Валентина К.", "Артём Б.", "Людмила Н.", "Кирилл П.",
]

REVIEW_TEMPLATES = [
    ("Отличный сервис! Всё прошло быстро и без проблем. Буду обращаться ещё.", 5),
    ("Очень доволен качеством работы. Рекомендую всем знакомым.", 5),
    ("Пользуюсь уже не первый раз — каждый раз на высоте. Спасибо!", 5),
    ("Заказал, всё пришло вовремя. Качество соответствует описанию. Доволен.", 5),
    ("Приятно удивлён скоростью обработки заявки. Всё чётко и профессионально.", 5),
    ("Хороший сервис, вежливые менеджеры. Проблем не возникло.", 5),
    ("Обратился по рекомендации друга — не пожалел. Качество отличное!", 5),
    ("Всё понравилось: и сайт удобный, и работа оперативная. Ставлю 5 звёзд.", 5),
    ("Быстро, качественно, без лишних вопросов. Именно то, что нужно.", 5),
    ("Сервис на уровне. Буду советовать коллегам и друзьям.", 5),
    ("Очень удобный сайт, всё интуитивно понятно. Заказ оформил за пару минут.", 5),
    ("Давно искал надёжного исполнителя — нашёл. Всё сделали в срок.", 5),
    ("Первый раз воспользовался — остался очень доволен. Вернусь снова.", 5),
    ("Хорошее соотношение цены и качества. Работой полностью доволен.", 4),
    ("В целом всё хорошо, небольшие задержки с ответом, но результат отличный.", 4),
    ("Неплохой сервис. Есть куда расти, но в целом справляются хорошо.", 4),
    ("Работой доволен, всё выполнено качественно. Спасибо команде!", 5),
    ("Рекомендую! Всё прозрачно, честно и в срок. Приятно работать.", 5),
    ("Сотрудничаем уже несколько месяцев — всегда всё на высоком уровне.", 5),
    ("Обращался дважды — оба раза остался доволен. Стабильное качество.", 5),
]


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def send_daily_report(cur, user_id: int, site_url: str, count_today: int, total: int):
    today = date.today().strftime("%d.%m.%Y")
    title = f"Отчёт за {today} — {site_url}"
    message = (
        f"За сегодня опубликовано новых отзывов: {count_today}\n"
        f"Всего отзывов на сайте: {total}\n"
        f"Сайт: {site_url}"
    )
    cur.execute(
        "INSERT INTO notifications (user_id, title, message) VALUES (%s, %s, %s)",
        (user_id, title, message)
    )


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


def generate_review_templates(count: int) -> list:
    selected = random.sample(REVIEW_TEMPLATES, min(count, len(REVIEW_TEMPLATES)))
    if count > len(REVIEW_TEMPLATES):
        selected += random.choices(REVIEW_TEMPLATES, k=count - len(REVIEW_TEMPLATES))
    return [{"rating": rating, "text": text} for text, rating in selected[:count]]


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod")
    params = event.get("queryStringParameters") or {}

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

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        project_id = body.get("project_id")
        site_url = body.get("site_url", "")
        count = min(int(body.get("count", 5)), 20)
        user_id = body.get("user_id")

        if not project_id or not site_url:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нужны project_id и site_url"})}

        try:
            gpt_reviews = generate_review_gpt(site_url, count)
        except Exception:
            gpt_reviews = generate_review_templates(count)

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

        # Считаем общее кол-во отзывов и отправляем отчёт
        if user_id and saved:
            cur.execute("SELECT COUNT(*) FROM reviews WHERE project_id = %s", (project_id,))
            total = cur.fetchone()[0]
            send_daily_report(cur, user_id, site_url, len(saved), total)

        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"generated": saved, "count": len(saved)}, ensure_ascii=False)}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
