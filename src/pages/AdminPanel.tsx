import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Check, X, RefreshCw, Trash2, Sparkles, Star, ChevronDown, ChevronUp, Copy } from "lucide-react";
import Icon from "@/components/ui/icon";
import { getProjects, updateProject, deleteProject, generateReviews, getReviews } from "@/lib/api";

interface Project {
  id: number;
  site_url: string;
  reviews_per_day: number;
  status: string;
  created_at: string;
  phone: string;
}

interface Review {
  id: number;
  author_name: string;
  rating: number;
  text: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  active: "bg-green-400/10 text-green-400 border-green-400/20",
  rejected: "bg-red-400/10 text-red-400 border-red-400/20",
  deleted: "bg-gray-400/10 text-gray-400 border-gray-400/20",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "На рассмотрении",
  active: "Активен",
  rejected: "Отклонён",
  deleted: "Удалён",
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"projects" | "reviews">("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editRpd, setEditRpd] = useState("");

  // Reviews generator
  const [genProjectId, setGenProjectId] = useState<number | null>(null);
  const [genCount, setGenCount] = useState("5");
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState<Review[]>([]);
  const [showGenModal, setShowGenModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // All reviews
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("rb_admin");
    if (!isAdmin) { navigate("/"); return; }
    loadProjects();
  }, []);

  useEffect(() => {
    if (tab === "reviews") loadAllReviews();
  }, [tab]);

  const loadProjects = async () => {
    setLoading(true);
    const data = await getProjects();
    setLoading(false);
    if (Array.isArray(data)) setProjects(data);
  };

  const loadAllReviews = async () => {
    setReviewsLoading(true);
    const data = await getReviews();
    setReviewsLoading(false);
    if (Array.isArray(data)) setAllReviews(data);
  };

  const setStatus = async (id: number, status: string) => {
    await updateProject(id, { status });
    loadProjects();
  };

  const handleDelete = async (id: number) => {
    await deleteProject(id);
    loadProjects();
  };

  const handleEditSave = async (id: number) => {
    await updateProject(id, { reviews_per_day: parseInt(editRpd) });
    setEditId(null);
    loadProjects();
  };

  const openGenModal = (project: Project) => {
    setSelectedProject(project);
    setGenProjectId(project.id);
    setGenResult([]);
    setGenCount(String(project.reviews_per_day));
    setShowGenModal(true);
  };

  const handleGenerate = async () => {
    if (!genProjectId || !selectedProject) return;
    setGenLoading(true);
    const result = await generateReviews(genProjectId, selectedProject.site_url, parseInt(genCount));
    setGenLoading(false);
    if (result.generated) setGenResult(result.generated);
  };

  const copyReview = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filtered = filter === "all"
    ? projects.filter(p => p.status !== "deleted")
    : projects.filter(p => p.status === filter);

  const counts = {
    all: projects.filter(p => p.status !== "deleted").length,
    pending: projects.filter(p => p.status === "pending").length,
    active: projects.filter(p => p.status === "active").length,
    rejected: projects.filter(p => p.status === "rejected").length,
  };

  const logout = () => {
    sessionStorage.removeItem("rb_admin");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <header className="border-b border-accent/10 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icon name="Star" size={18} className="text-accent" />
            <span className="font-display font-bold text-xl">ReviewBoost</span>
            <span className="text-xs bg-accent/10 border border-accent/20 text-accent px-2 py-0.5 rounded-full">Админ</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { loadProjects(); if (tab === "reviews") loadAllReviews(); }} className="p-2 text-muted-foreground hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-1 bg-card/50 border border-accent/10 rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setTab("projects")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === "projects" ? "bg-accent text-black" : "text-muted-foreground hover:text-white"}`}
          >
            Заявки клиентов
          </button>
          <button
            onClick={() => setTab("reviews")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === "reviews" ? "bg-accent text-black" : "text-muted-foreground hover:text-white"}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Генератор отзывов
          </button>
        </div>

        {/* ---- TAB: PROJECTS ---- */}
        {tab === "projects" && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-display font-black mb-2">Заявки клиентов</h1>
              <p className="text-muted-foreground">Управляйте проектами, статусами и генерируйте отзывы</p>
            </div>

            <div className="flex gap-2 mb-8 flex-wrap">
              {[
                { key: "all", label: "Все" },
                { key: "pending", label: "На рассмотрении" },
                { key: "active", label: "Активные" },
                { key: "rejected", label: "Отклонённые" },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-2 rounded-full text-sm transition-all border ${
                    filter === f.key
                      ? "bg-accent text-black border-accent font-semibold"
                      : "border-accent/20 text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  {f.label} <span className="ml-1 text-xs opacity-70">{counts[f.key as keyof typeof counts]}</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20 text-muted-foreground">Загрузка...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-accent/20 rounded-2xl text-muted-foreground">Заявок нет</div>
            ) : (
              <div className="space-y-4">
                {filtered.map(p => (
                  <div key={p.id} className="bg-card/50 border border-accent/10 rounded-2xl p-6 hover:border-accent/20 transition-all">
                    <div className="flex items-start gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-semibold truncate">{p.site_url}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[p.status] || STATUS_STYLES.deleted}`}>
                            {STATUS_LABEL[p.status] || p.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span>📱 {p.phone}</span>
                          <span>·</span>
                          {editId === p.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number" min="1"
                                value={editRpd}
                                onChange={e => setEditRpd(e.target.value)}
                                className="w-20 px-2 py-1 rounded-lg bg-background border border-accent/30 text-white text-sm outline-none"
                              />
                              <span className="text-xs">отз/сутки</span>
                              <button onClick={() => handleEditSave(p.id)} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                              <button onClick={() => setEditId(null)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button onClick={() => { setEditId(p.id); setEditRpd(String(p.reviews_per_day)); }} className="hover:text-white transition-colors">
                              ✏️ {p.reviews_per_day} отз/сутки
                            </button>
                          )}
                          <span>·</span>
                          <span>{new Date(p.created_at).toLocaleDateString("ru")}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => openGenModal(p)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-accent/10 border border-accent/20 text-accent rounded-xl text-xs hover:bg-accent/20 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Написать отзыв
                        </button>
                        {p.status !== "active" && (
                          <button onClick={() => setStatus(p.id, "active")} className="flex items-center gap-1.5 px-3 py-2 bg-green-400/10 border border-green-400/20 text-green-400 rounded-xl text-xs hover:bg-green-400/20 transition-all">
                            <Check className="w-3.5 h-3.5" /> Подтвердить
                          </button>
                        )}
                        {p.status !== "rejected" && p.status !== "deleted" && (
                          <button onClick={() => setStatus(p.id, "rejected")} className="flex items-center gap-1.5 px-3 py-2 bg-red-400/10 border border-red-400/20 text-red-400 rounded-xl text-xs hover:bg-red-400/20 transition-all">
                            <X className="w-3.5 h-3.5" /> Отклонить
                          </button>
                        )}
                        <button onClick={() => handleDelete(p.id)} className="p-2 bg-gray-400/10 border border-gray-400/20 text-gray-400 rounded-xl hover:bg-gray-400/20 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ---- TAB: REVIEWS ---- */}
        {tab === "reviews" && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-display font-black mb-2">Генератор отзывов</h1>
              <p className="text-muted-foreground">Нажмите «Написать отзыв» на заявке или выберите проект ниже</p>
            </div>

            {reviewsLoading ? (
              <div className="text-center py-20 text-muted-foreground">Загрузка...</div>
            ) : allReviews.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-accent/20 rounded-2xl text-muted-foreground">
                <Sparkles className="w-10 h-10 text-accent/30 mx-auto mb-3" />
                <p>Пока нет сгенерированных отзывов.</p>
                <p className="text-sm mt-1">Перейдите на вкладку «Заявки» и нажмите «Написать отзыв»</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allReviews.map((r: Review & { site_url?: string }) => (
                  <div key={r.id} className="bg-card/50 border border-accent/10 rounded-2xl p-6 hover:border-accent/20 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-sm">{r.author_name}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                          {r.site_url && <span className="text-xs text-muted-foreground">· {r.site_url}</span>}
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed">{r.text}</p>
                        <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString("ru")}</p>
                      </div>
                      <button
                        onClick={() => copyReview(r.text, r.id)}
                        className="flex-shrink-0 p-2 rounded-xl border border-accent/20 text-muted-foreground hover:text-white hover:border-accent/40 transition-all"
                        title="Скопировать"
                      >
                        {copiedId === r.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Generate Modal */}
      {showGenModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { if (!genLoading) setShowGenModal(false); }} />
          <div className="relative bg-card border border-accent/20 rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowGenModal(false)}
              disabled={genLoading}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors disabled:opacity-30"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold">Генератор отзывов</h3>
                <p className="text-xs text-muted-foreground">{selectedProject.site_url}</p>
              </div>
            </div>

            <div className="flex items-end gap-4 mb-6">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1.5 block text-white/80">Количество отзывов</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={genCount}
                  onChange={e => setGenCount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-accent/20 focus:border-accent/60 outline-none text-white text-sm transition-colors"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={genLoading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-accent/80 text-black rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                {genLoading ? "Генерирую..." : "Написать отзывы"}
              </button>
            </div>

            {genLoading && (
              <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                ИИ пишет отзывы...
              </div>
            )}

            {genResult.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-green-400">✓ Сгенерировано {genResult.length} отзывов и сохранено в базе</p>
                </div>
                {genResult.map((r, i) => (
                  <div key={i} className="bg-background/50 border border-accent/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{r.author_name}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} className={`w-3 h-3 ${j < r.rating ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => copyReview(r.text, r.id)}
                        className="p-1.5 rounded-lg border border-accent/20 text-muted-foreground hover:text-white transition-all"
                      >
                        {copiedId === r.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}