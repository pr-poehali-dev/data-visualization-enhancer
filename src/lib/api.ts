const URLS = {
  auth: "https://functions.poehali.dev/d7f277a6-09f8-4300-b057-36f53b303c79",
  projects: "https://functions.poehali.dev/e35a8c3b-39f4-47be-b9ff-5eee65f7abe8",
  reviews: "https://functions.poehali.dev/bd0ea93d-f2d8-4f8c-9e94-9161a4dd5244",
};

export async function authRequest(action: "register" | "login", phone: string, password: string) {
  try {
    const res = await fetch(URLS.auth, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, phone, password }),
    });
    return res.json();
  } catch {
    return { error: "Ошибка соединения. Попробуйте ещё раз." };
  }
}

export async function getProjects(user_id?: number) {
  const url = user_id ? `${URLS.projects}?user_id=${user_id}` : URLS.projects;
  const res = await fetch(url);
  return res.json();
}

export async function createProject(user_id: number, site_url: string, reviews_per_day: number) {
  const res = await fetch(URLS.projects, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, site_url, reviews_per_day }),
  });
  return res.json();
}

export async function updateProject(id: number, data: { status?: string; reviews_per_day?: number }) {
  const res = await fetch(URLS.projects, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  return res.json();
}

export async function deleteProject(id: number) {
  const res = await fetch(`${URLS.projects}?id=${id}`, { method: "DELETE" });
  return res.json();
}

export async function getReviews(project_id?: number) {
  const url = project_id ? `${URLS.reviews}?project_id=${project_id}` : URLS.reviews;
  const res = await fetch(url);
  return res.json();
}

export async function generateReviews(project_id: number, site_url: string, count: number, user_id?: number) {
  const res = await fetch(URLS.reviews, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id, site_url, count, user_id }),
  });
  return res.json();
}

export async function getNotifications(user_id: number) {
  const res = await fetch(`${URLS.projects}?resource=notifications&user_id=${user_id}`);
  return res.json();
}

export async function markNotificationRead(id: number) {
  const res = await fetch(URLS.projects, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "read", id }),
  });
  return res.json();
}

export async function markAllNotificationsRead(user_id: number) {
  const res = await fetch(URLS.projects, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "read_all", user_id }),
  });
  return res.json();
}