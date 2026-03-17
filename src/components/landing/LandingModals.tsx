import { X, Lock, MessageCircle, CheckCircle } from "lucide-react";

interface AdminLoginModalProps {
  show: boolean;
  form: { login: string; password: string };
  error: boolean;
  onClose: () => void;
  onFormChange: (form: { login: string; password: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

interface ContactModalProps {
  show: boolean;
  form: { name: string; site: string; phone: string };
  onClose: () => void;
  onFormChange: (form: { name: string; site: string; phone: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

interface SuccessToastProps {
  show: boolean;
}

export function AdminLoginModal({ show, form, error, onClose, onFormChange, onSubmit }: AdminLoginModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-accent/20 rounded-3xl p-8 w-full max-w-sm shadow-2xl shadow-accent/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-xl font-display font-bold">Вход в админ-панель</h3>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block text-white/80">Логин</label>
            <input
              required
              type="text"
              placeholder="Логин"
              value={form.login}
              onChange={e => onFormChange({ ...form, login: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-background border border-accent/20 focus:border-accent/60 outline-none text-white placeholder:text-muted-foreground transition-colors text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block text-white/80">Пароль</label>
            <input
              required
              type="password"
              placeholder="Пароль"
              value={form.password}
              onChange={e => onFormChange({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-background border border-accent/20 focus:border-accent/60 outline-none text-white placeholder:text-muted-foreground transition-colors text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-400">Неверный логин или пароль</p>}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-accent to-accent/80 text-black rounded-xl font-semibold hover:shadow-xl hover:shadow-accent/30 transition-all"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}

export function ContactModal({ show, form, onClose, onFormChange, onSubmit }: ContactModalProps) {
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
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-xl font-display font-bold">Связаться с менеджером</h3>
          </div>
          <p className="text-sm text-muted-foreground">Оставьте данные — менеджер свяжется с вами в течение 15 минут для обсуждения заказа и оплаты.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block text-white/80">Ваше имя</label>
            <input
              required
              type="text"
              placeholder="Иван Иванов"
              value={form.name}
              onChange={e => onFormChange({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-background border border-accent/20 focus:border-accent/60 outline-none text-white placeholder:text-muted-foreground transition-colors text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block text-white/80">Ссылка на сайт</label>
            <input
              required
              type="text"
              placeholder="https://yoursite.ru"
              value={form.site}
              onChange={e => onFormChange({ ...form, site: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-background border border-accent/20 focus:border-accent/60 outline-none text-white placeholder:text-muted-foreground transition-colors text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block text-white/80">Телефон или Telegram</label>
            <input
              required
              type="text"
              placeholder="+7 999 000 00 00"
              value={form.phone}
              onChange={e => onFormChange({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-background border border-accent/20 focus:border-accent/60 outline-none text-white placeholder:text-muted-foreground transition-colors text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-accent to-accent/80 text-black rounded-xl font-semibold hover:shadow-xl hover:shadow-accent/30 transition-all mt-2"
          >
            Отправить заявку
          </button>
        </form>
      </div>
    </div>
  );
}

export function SuccessToast({ show }: SuccessToastProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 bg-card border border-accent/30 rounded-2xl px-6 py-4 shadow-2xl shadow-accent/10 animate-fade-in">
      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
      <div>
        <div className="font-semibold text-sm">Заявка отправлена!</div>
        <div className="text-xs text-muted-foreground">Менеджер свяжется с вами в течение 15 минут</div>
      </div>
    </div>
  );
}
