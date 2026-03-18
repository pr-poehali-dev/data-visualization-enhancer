import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, Globe, Star, Clock, CheckCircle, MessageSquare, Bell } from "lucide-react";
import Icon from "@/components/ui/icon";
import { getProjects, createProject, getReviews, getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/api";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Project {
  id: number;
  site_url: string;
  reviews_per_day: number;
  status: string;
  created_at: string;
  review_platform_url?: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "На рассмотрении", color: "text-yellow-400" },
  active: { label: "Активен", color: "text-green-400" },
  rejected: { label: "Отклонён", color: "text-red-400" },
  deleted: { label: "Удалён", color: "text-gray-400" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ user_id: number; phone: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviewCounts, setReviewCounts] = useState<Record<number, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ site_url: "", reviews_per_day: "10" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const projectsRef = useRef<Project[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("rb_user");
    if (!stored) { navigate("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    loadProjects(u.user_id);
    loadNotifications(u.user_id);
  }, []);

  const loadNotifications = async (user_id: number) => {
    const data = await getNotifications(user_id);
    if (Array.isArray(data)) setNotifications(data);
  };

  const handleReadAll = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.user_id);
    setNotifications(n => n.map(x => ({ ...x, is_read: true })));
  };

  const handleReadOne = async (id: number) => {
    await markNotificationRead(id);
    setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
  };

  useEffect(() => {
    projectsRef.current = projects;
    if (projects.length === 0) return;
    loadReviewCounts(projects);
    pollRef.current = setInterval(() => {
      loadReviewCounts(projectsRef.current);
    }, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [projects]);

  const loadProjects = async (user_id: number) => {
    const data = await getProjects(user_id);
    if (Array.isArray(data)) setProjects(data.filter((p: Project) => p.status !== "deleted"));
  };

  const loadReviewCounts = async (list: Project[]) => {
    const counts: Record<number, number> = {};
    await Promise.all(
      list.map(async (p) => {
        const data = await getReviews(p.id);
        counts[p.id] = Array.isArray(data) ? data.length : 0;
      })
    );
    setReviewCounts(counts);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");
    const result = await createProject(user.user_id, form.site_url, parseInt(form.reviews_per_day));
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setShowForm(false);
    setForm({ site_url: "", reviews_per_day: "10" });
    loadProjects(user.user_id);
  };

  const logout = () => {
    localStorage.removeItem("rb_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="border-b border-accent/10 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon name="Star" size={18} className="text-accent" />
            <span className="font-display font-bold text-xl bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">ReviewBoost</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.phone}</span>
            <button
              onClick={() => setShowNotifications(v => !v)}
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-accent/10 transition-colors"
            >
              <Bell className="w-5 h-5 text-muted-foreground hover:text-white transition-colors" />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-accent text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-display font-black mb-2">Личный кабинет</h1>
          <p className="text-muted-foreground">Управляйте накруткой отзывов для ваших сайтов</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Проектов", value: projects.length, icon: "Globe" },
            { label: "Активных", value: projects.filter(p => p.status === "active").length, icon: "CheckCircle" },
            { label: "На рассмотрении", value: projects.filter(p => p.status === "pending").length, icon: "Clock" },
            { label: "Всего отзывов", value: Object.values(reviewCounts).reduce((a, b) => a + b, 0), icon: "MessageSquare" },
          ].map((s, i) => (
            <div key={i} className="bg-card/50 border border-accent/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Icon name={s.icon} size={20} className="text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold">Мои проекты</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent to-accent/80 text-black rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-accent/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Добавить сайт
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="border border-dashed border-accent/20 rounded-2xl p-16 text-center">
            <Icon name="Globe" size={40} className="text-accent/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Ещё нет проектов</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-accent/10 border border-accent/30 rounded-full text-sm hover:bg-accent/20 transition-colors"
            >
              Добавить первый сайт
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map(p => {
              const count = reviewCounts[p.id] ?? null;
              const isActive = p.status === "active";
              return (
                <div key={p.id} className="bg-card/50 border border-accent/10 hover:border-accent/30 rounded-2xl p-6 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{p.site_url}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {p.reviews_per_day} отзывов / сутки · Тариф Базовый
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-medium flex-shrink-0 ${STATUS_LABEL[p.status]?.color || "text-gray-400"}`}>
                      {STATUS_LABEL[p.status]?.label || p.status}
                    </span>
                  </div>

                  {/* Live review counter */}
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-accent/60" />
                      <span className="text-sm text-muted-foreground">Отзывов на сайте:</span>
                      {count === null ? (
                        <span className="text-sm text-muted-foreground animate-pulse">...</span>
                      ) : (
                        <span className="text-sm font-bold text-white">{count}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {isActive && p.review_platform_url && (
                        <a
                          href={p.review_platform_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/30 text-accent rounded-xl text-xs font-medium hover:bg-accent/20 transition-all"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Написать отзыв на Яндексе
                        </a>
                      )}
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-muted-foreground/30"}`} />
                        <span className="text-xs text-muted-foreground">
                          {isActive ? "обновляется каждые 10 сек" : "обновление после активации"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Notifications panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowNotifications(false)}>
          <div
            className="relative h-full w-full max-w-sm bg-card border-l border-accent/10 shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-accent/10">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" />
                <span className="font-display font-bold text-lg">Уведомления</span>
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full font-medium">
                    {notifications.filter(n => !n.is_read).length} новых
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {notifications.some(n => !n.is_read) && (
                  <button onClick={handleReadAll} className="text-xs text-muted-foreground hover:text-white transition-colors">
                    Прочитать все
                  </button>
                )}
                <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-white transition-colors text-xl leading-none">×</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                  <Bell className="w-10 h-10 opacity-20" />
                  <p className="text-sm">Уведомлений пока нет</p>
                  <p className="text-xs opacity-60">Отчёты появятся после публикации отзывов</p>
                </div>
              ) : (
                <div className="divide-y divide-accent/5">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`px-6 py-4 cursor-pointer hover:bg-accent/5 transition-colors ${!n.is_read ? "bg-accent/5" : ""}`}
                      onClick={() => handleReadOne(n.id)}
                    >
                      <div className="flex items-start gap-3">
                        {!n.is_read && <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />}
                        <div className={!n.is_read ? "" : "pl-5"}>
                          <p className="text-sm font-medium text-white leading-snug">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line leading-relaxed">{n.message}</p>
                          <p className="text-[11px] text-muted-foreground/50 mt-2">
                            {new Date(n.created_at).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add project modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-card border border-accent/20 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-display font-bold mb-6">Новый проект</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-white/80">Ссылка на сайт</label>
                <input
                  required
                  type="text"
                  placeholder="https://yoursite.ru"
                  value={form.site_url}
                  onChange={e => setForm(f => ({ ...f, site_url: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-accent/20 focus:border-accent/60 outline-none text-white placeholder:text-muted-foreground text-sm transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-white/80">Отзывов в сутки</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="500"
                  value={form.reviews_per_day}
                  onChange={e => setForm(f => ({ ...f, reviews_per_day: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-accent/20 focus:border-accent/60 outline-none text-white text-sm transition-colors"
                />
              </div>
              <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 text-sm text-muted-foreground">
                Тариф: <span className="text-white font-medium">Базовый</span> · После отправки с вами свяжется менеджер для оплаты
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-accent/20 rounded-xl text-sm hover:bg-accent/5 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-accent to-accent/80 text-black rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Отправка..." : "Отправить заявку"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}