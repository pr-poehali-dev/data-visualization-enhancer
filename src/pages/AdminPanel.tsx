import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Check, X, RefreshCw, Trash2 } from "lucide-react";
import Icon from "@/components/ui/icon";
import { getProjects, updateProject, deleteProject } from "@/lib/api";

interface Project {
  id: number;
  site_url: string;
  reviews_per_day: number;
  status: string;
  created_at: string;
  phone: string;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editRpd, setEditRpd] = useState("");

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("rb_admin");
    if (!isAdmin) { navigate("/"); return; }
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const data = await getProjects();
    setLoading(false);
    if (Array.isArray(data)) setProjects(data);
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
            <button onClick={loadProjects} className="p-2 text-muted-foreground hover:text-white transition-colors">
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
        <div className="mb-8">
          <h1 className="text-3xl font-display font-black mb-2">Заявки клиентов</h1>
          <p className="text-muted-foreground">Управляйте проектами и статусами</p>
        </div>

        {/* Filters */}
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
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">
                {counts[f.key as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-accent/20 rounded-2xl text-muted-foreground">
            Заявок нет
          </div>
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
                            type="number"
                            min="1"
                            value={editRpd}
                            onChange={e => setEditRpd(e.target.value)}
                            className="w-20 px-2 py-1 rounded-lg bg-background border border-accent/30 text-white text-sm outline-none"
                          />
                          <span className="text-xs">отз/сутки</span>
                          <button onClick={() => handleEditSave(p.id)} className="text-green-400 hover:text-green-300">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditId(null)} className="text-red-400 hover:text-red-300">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditId(p.id); setEditRpd(String(p.reviews_per_day)); }}
                          className="hover:text-white transition-colors"
                        >
                          ✏️ {p.reviews_per_day} отз/сутки
                        </button>
                      )}
                      <span>·</span>
                      <span>{new Date(p.created_at).toLocaleDateString("ru")}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {p.status !== "active" && (
                      <button
                        onClick={() => setStatus(p.id, "active")}
                        title="Подтвердить"
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-400/10 border border-green-400/20 text-green-400 rounded-xl text-xs hover:bg-green-400/20 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Подтвердить
                      </button>
                    )}
                    {p.status !== "rejected" && p.status !== "deleted" && (
                      <button
                        onClick={() => setStatus(p.id, "rejected")}
                        title="Отклонить"
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-400/10 border border-red-400/20 text-red-400 rounded-xl text-xs hover:bg-red-400/20 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        Отклонить
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(p.id)}
                      title="Удалить"
                      className="p-2 bg-gray-400/10 border border-gray-400/20 text-gray-400 rounded-xl hover:bg-gray-400/20 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
