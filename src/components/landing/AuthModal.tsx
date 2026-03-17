import { X } from "lucide-react";

interface AuthModalProps {
  show: boolean;
  tab: "login" | "register";
  form: { phone: string; password: string };
  error: string;
  loading: boolean;
  onClose: () => void;
  onTabChange: (tab: "login" | "register") => void;
  onFormChange: (form: { phone: string; password: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AuthModal({
  show, tab, form, error, loading,
  onClose, onTabChange, onFormChange, onSubmit,
}: AuthModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-accent/20 rounded-3xl p-8 w-full max-w-md shadow-2xl shadow-accent/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex gap-1 bg-background/50 rounded-xl p-1 mb-6">
          <button
            onClick={() => onTabChange("register")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === "register" ? "bg-accent text-black" : "text-muted-foreground hover:text-white"}`}
          >
            Регистрация
          </button>
          <button
            onClick={() => onTabChange("login")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === "login" ? "bg-accent text-black" : "text-muted-foreground hover:text-white"}`}
          >
            Войти
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block text-white/80">Номер телефона</label>
            <input
              required
              type="text"
              placeholder="+7 999 000 00 00"
              value={form.phone}
              onChange={e => onFormChange({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-background border border-accent/20 focus:border-accent/60 outline-none text-white placeholder:text-muted-foreground transition-colors text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block text-white/80">Пароль</label>
            <input
              required
              type="password"
              placeholder={tab === "register" ? "Придумайте пароль" : "Введите пароль"}
              value={form.password}
              onChange={e => onFormChange({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-background border border-accent/20 focus:border-accent/60 outline-none text-white placeholder:text-muted-foreground transition-colors text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-accent to-accent/80 text-black rounded-xl font-semibold hover:shadow-xl hover:shadow-accent/30 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? "Загрузка..." : tab === "register" ? "Создать аккаунт" : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
