import Icon from "@/components/ui/icon";

interface LandingHeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function LandingHeader({ onLoginClick, onRegisterClick }: LandingHeaderProps) {
  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-2xl border-b border-accent/20 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon name="Star" size={20} className="text-accent" />
          <div className="font-display font-bold text-2xl tracking-tighter bg-gradient-to-r from-white via-accent to-accent/80 bg-clip-text text-transparent">
            ReviewBoost
          </div>
        </div>
        <nav className="hidden md:flex gap-10 text-sm font-medium">
          <a href="#features" className="text-muted-foreground hover:text-white transition-colors">Возможности</a>
          <a href="#how" className="text-muted-foreground hover:text-white transition-colors">Как это работает</a>
          <a href="#pricing" className="text-muted-foreground hover:text-white transition-colors">Тарифы</a>
        </nav>
        <div className="flex gap-3">
          <button
            onClick={onLoginClick}
            className="px-5 py-2.5 text-sm font-medium border border-accent/40 rounded-full hover:border-accent/70 hover:bg-accent/10 transition-all"
          >
            Войти
          </button>
        </div>
      </div>
    </header>
  );
}