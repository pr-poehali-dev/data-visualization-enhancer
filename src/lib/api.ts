const URLS = {
  auth: "https://functions.poehali.dev/d7f277a6-09f8-4300-b057-36f53b303c79",
  projects: "https://functions.poehali.dev/e35a8c3b-39f4-47be-b9ff-5eee65f7abe8",
};

export async function authRequest(action: "register" | "login", phone: string, password: string) {
  const res = await fetch(URLS.auth, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, phone, password }),
  });
  return res.json();
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
