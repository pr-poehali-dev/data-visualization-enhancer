import { useEffect, useState } from "react";
import { ArrowRight, Star, Globe, Shield, TrendingUp, Users, MessageCircle, X, CheckCircle, Lock } from "lucide-react";
import Icon from "@/components/ui/icon";

const Index = () => {
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", site: "", phone: "" });
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminForm, setAdminForm] = useState({ login: "", password: "" });
  const [adminError, setAdminError] = useState(false);

  useEffect(() => {
    const observers: Record<string, IntersectionObserver> = {};
    const sectionIds = ["hero", "features", "how", "pricing", "cta"];
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;
      observers[id] = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [id]: true }));
            observers[id].unobserve(element);
          }
        },
        { threshold: 0.15 }
      );
      observers[id].observe(element);
    });
    return () => {
      Object.values(observers).forEach((observer) => observer.disconnect());
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminForm.login === "Yalta" && adminForm.password === "Yalta220577") {
      setShowAdminLogin(false);
      window.location.href = "/admin";
    } else {
      setAdminError(true);
      setTimeout(() => setAdminError(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <button className="px-5 py-2.5 text-sm font-medium border border-accent/40 rounded-full hover:border-accent/70 hover:bg-accent/10 transition-all">
              Войти
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-accent via-accent to-accent/80 text-black rounded-full hover:shadow-lg hover:shadow-accent/40 transition-all font-semibold"
            >
              Начать
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-32 px-6 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
          <img src="/images/black-hole-gif.gif" alt="background" className="w-auto h-3/4 object-contain" />
        </div>
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-1000 ${visibleSections["hero"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="mb-8 inline-block">
                <span className="text-xs font-medium tracking-widest text-accent/80 uppercase">
                  Управление репутацией в браузере
                </span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-display font-black leading-tight mb-8 tracking-tighter">
                <span className="bg-gradient-to-br from-white via-white to-accent/40 bg-clip-text text-transparent">
                  Больше отзывов.
                </span>
                <br />
                <span className="text-accent">Выше доверие.</span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-xl font-light">
                Автоматическая накрутка отзывов прямо в браузере на ваш домен. Зарегистрируйтесь, укажите сайт — мы сделаем всё остальное.
              </p>
              <div className="flex gap-4 mb-12 flex-col sm:flex-row">
                <button
                  onClick={() => setShowModal(true)}
                  className="group px-8 py-4 bg-gradient-to-r from-accent to-accent/90 text-black rounded-full hover:shadow-2xl hover:shadow-accent/50 transition-all font-semibold text-lg flex items-center gap-3 justify-center"
                >
                  Заказать накрутку
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </button>
                <button className="px-8 py-4 border border-accent/40 rounded-full hover:border-accent/70 hover:bg-accent/10 transition-all font-medium text-lg text-white">
                  Как это работает
                </button>
              </div>
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
                <div>
                  <div className="text-2xl font-bold text-accent mb-2">5 000+</div>
                  <p className="text-sm text-white/60">Довольных клиентов</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white mb-2">200 000+</div>
                  <p className="text-sm text-white/60">Отзывов размещено</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent mb-2">98%</div>
                  <p className="text-sm text-white/60">Положительный результат</p>
                </div>
              </div>
            </div>

            <div className={`relative h-96 lg:h-[550px] transition-all duration-1000 flex items-center justify-center ${visibleSections["hero"] ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-transparent to-transparent rounded-3xl blur-3xl animate-pulse" />
              <div className="relative z-10 bg-card/60 border border-accent/20 rounded-3xl p-8 backdrop-blur-sm w-full max-w-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Icon name="Globe" size={20} className="text-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">yoursite.ru</div>
                    <div className="text-xs text-muted-foreground">Домен подключён</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400">Активен</span>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {["Анализируем конкурентов...", "Генерируем отзывы...", "Публикуем в браузере..."].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Icon name="CheckCircle" size={16} className="text-accent flex-shrink-0" />
                      <span className="text-sm text-white/70">{step}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 mb-2">
                  {[1,2,3,4,5].map(s => (
                    <Icon key={s} name="Star" size={18} className="text-accent fill-accent" />
                  ))}
                </div>
                <div className="text-sm text-white/60 italic">"Отличный сервис, очень доволен!"</div>
                <div className="mt-4 w-full bg-accent/10 rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full w-3/4 animate-pulse" />
                </div>
                <div className="text-xs text-muted-foreground mt-1">Прогресс: 75 из 100 отзывов</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-20 transition-all duration-1000 ${visibleSections["features"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-medium tracking-widest text-accent/60 uppercase">Возможности</span>
            <h2 className="text-5xl lg:text-6xl font-display font-black tracking-tighter mt-4 mb-6">
              <span className="bg-gradient-to-r from-white via-white to-accent/40 bg-clip-text text-transparent">
                Почему выбирают нас
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "Globe", title: "Накрутка на ваш домен", desc: "Отзывы публикуются именно на ваш сайт — никакого фрода с чужими адресами" },
              { icon: "Star", title: "Реалистичные отзывы", desc: "Уникальные тексты, разные аккаунты и естественная активность в браузере" },
              { icon: "TrendingUp", title: "Быстрый результат", desc: "Первые отзывы появляются уже в течение 24 часов после оплаты" },
              { icon: "Shield", title: "Безопасно и анонимно", desc: "Ваши данные защищены. Алгоритмы не определяют накрутку" },
              { icon: "Users", title: "Живые аккаунты", desc: "Отзывы оставляют реальные профили с историей активности" },
              { icon: "MessageCircle", title: "Личный менеджер", desc: "После регистрации с вами свяжется менеджер для подбора тарифа" },
            ].map((item, i) => {
              const isVisible = visibleSections["features"];
              return (
                <div
                  key={i}
                  className={`group p-8 border border-accent/10 hover:border-accent/40 rounded-2xl bg-card/50 hover:bg-card/80 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                    <Icon name={item.icon} size={24} className="text-accent" />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-20 transition-all duration-1000 ${visibleSections["how"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-medium tracking-widest text-accent/60 uppercase">Процесс</span>
            <h2 className="text-5xl lg:text-6xl font-display font-black tracking-tighter mt-4">
              <span className="bg-gradient-to-r from-white via-white to-accent/40 bg-clip-text text-transparent">
                Четыре простых шага
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Регистрация", desc: "Создайте личный кабинет — это займёт меньше минуты" },
              { num: "02", title: "Укажите сайт", desc: "Вставьте ссылку на домен, на который нужны отзывы" },
              { num: "03", title: "Выбор тарифа", desc: "Менеджер свяжется с вами и подберёт оптимальный пакет" },
              { num: "04", title: "Результат", desc: "После оплаты запускаем накрутку — отзывы появляются в браузере" },
            ].map((step, i) => {
              const isVisible = visibleSections["how"];
              return (
                <div
                  key={i}
                  className={`relative transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className="group bg-accent/10 hover:bg-accent/20 border border-accent/20 hover:border-accent/40 rounded-2xl p-8 h-full flex flex-col justify-between transition-all backdrop-blur-sm cursor-pointer">
                    <div>
                      <div className="text-5xl font-display font-black text-accent mb-4 group-hover:scale-110 transition-transform">
                        {step.num}
                      </div>
                      <h3 className="font-display font-bold text-xl mb-2">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-accent/40 to-transparent" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-accent/5">
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-20 transition-all duration-1000 ${visibleSections["pricing"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-medium tracking-widest text-accent/60 uppercase">Тарифы</span>
            <h2 className="text-5xl lg:text-6xl font-display font-black tracking-tighter mt-4">
              <span className="bg-gradient-to-r from-white via-white to-accent/40 bg-clip-text text-transparent">
                Выберите пакет
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: "Старт",
                price: "от 2 900 ₽",
                features: ["50 отзывов на домен", "Срок — 7 дней", "Живые аккаунты", "Гарантия результата"],
                highlight: false,
              },
              {
                name: "Профи",
                price: "По запросу",
                features: ["Неограниченно отзывов", "Личный менеджер 24/7", "Приоритетный запуск", "Любые площадки"],
                highlight: true,
              },
            ].map((plan, i) => {
              const isVisible = visibleSections["pricing"];
              return (
                <div
                  key={i}
                  className={`group relative transition-all duration-700 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"} ${plan.highlight ? "md:scale-105" : ""}`}
                  style={{ transitionDelay: `${i * 200}ms` }}
                >
                  {plan.highlight && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent via-accent to-accent/60 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition" />
                  )}
                  <div className={`relative p-10 border rounded-2xl h-full flex flex-col justify-between backdrop-blur-sm transition-all ${plan.highlight ? "border-accent/40 bg-accent/10" : "border-accent/10 bg-card/50 hover:bg-card/80"}`}>
                    <div>
                      <h3 className="font-display font-bold text-2xl mb-2">{plan.name}</h3>
                      <p className="text-4xl font-black text-accent mb-8">{plan.price}</p>
                      <ul className="space-y-4 mb-10">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex gap-3 text-sm items-start">
                            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                            <span className="text-foreground/80">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => setShowModal(true)}
                      className={`w-full px-6 py-4 rounded-xl font-semibold transition-all ${plan.highlight ? "bg-gradient-to-r from-accent to-accent/80 text-black hover:shadow-xl hover:shadow-accent/40" : "border border-accent/20 hover:border-accent/40 hover:bg-accent/5"}`}
                    >
                      {plan.highlight ? "Связаться с менеджером" : "Заказать сейчас"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-32 px-6">
        <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${visibleSections["cta"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <h2 className="text-5xl lg:text-6xl font-display font-black tracking-tighter mb-6">
            <span className="bg-gradient-to-r from-white via-white to-accent/40 bg-clip-text text-transparent">
              Готовы поднять репутацию?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 font-light max-w-2xl mx-auto">
            Оставьте заявку — менеджер свяжется с вами в течение 15 минут и расскажет всё про сервис.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="group px-10 py-5 bg-gradient-to-r from-accent to-accent/90 text-black rounded-full hover:shadow-2xl hover:shadow-accent/40 transition-all font-bold text-lg flex items-center gap-3 mx-auto"
          >
            Получить консультацию
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-accent/10 py-12 px-6 bg-background/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <p>© 2025 ReviewBoost — Управление репутацией</p>
          <div className="flex gap-8 items-center">
            <a href="#" className="hover:text-white transition-colors">Конфиденциальность</a>
            <a href="#" className="hover:text-white transition-colors">Условия</a>
            <a href="#" className="hover:text-white transition-colors">Контакты</a>
            <button
              onClick={() => setShowAdminLogin(true)}
              className="flex items-center gap-1.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors text-xs"
            >
              <Lock className="w-3 h-3" />
              Админ
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAdminLogin(false)} />
          <div className="relative bg-card border border-accent/20 rounded-3xl p-8 w-full max-w-sm shadow-2xl shadow-accent/10">
            <button
              onClick={() => setShowAdminLogin(false)}
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
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-white/80">Логин</label>
                <input
                  required
                  type="text"
                  placeholder="Логин"
                  value={adminForm.login}
                  onChange={e => setAdminForm(f => ({ ...f, login: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-accent/20 focus:border-accent/60 outline-none text-white placeholder:text-muted-foreground transition-colors text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-white/80">Пароль</label>
                <input
                  required
                  type="password"
                  placeholder="Пароль"
                  value={adminForm.password}
                  onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-accent/20 focus:border-accent/60 outline-none text-white placeholder:text-muted-foreground transition-colors text-sm"
                />
              </div>
              {adminError && (
                <p className="text-sm text-red-400">Неверный логин или пароль</p>
              )}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-accent to-accent/80 text-black rounded-xl font-semibold hover:shadow-xl hover:shadow-accent/30 transition-all"
              >
                Войти
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal — связь с менеджером */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-card border border-accent/20 rounded-3xl p-8 w-full max-w-md shadow-2xl shadow-accent/10">
            <button
              onClick={() => setShowModal(false)}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-white/80">Ваше имя</label>
                <input
                  required
                  type="text"
                  placeholder="Иван Иванов"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
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
                  onChange={e => setForm(f => ({ ...f, site: e.target.value }))}
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
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
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
      )}

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 bg-card border border-accent/30 rounded-2xl px-6 py-4 shadow-2xl shadow-accent/10 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
          <div>
            <div className="font-semibold text-sm">Заявка отправлена!</div>
            <div className="text-xs text-muted-foreground">Менеджер свяжется с вами в течение 15 минут</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;