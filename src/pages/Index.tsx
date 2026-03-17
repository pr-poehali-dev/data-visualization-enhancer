import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authRequest } from "@/lib/api";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingSections from "@/components/landing/LandingSections";
import AuthModal from "@/components/landing/AuthModal";
import { AdminLoginModal, ContactModal, SuccessToast } from "@/components/landing/LandingModals";

const Index = () => {
  const navigate = useNavigate();
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", site: "", phone: "" });
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminForm, setAdminForm] = useState({ login: "", password: "" });
  const [adminError, setAdminError] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");
  const [authForm, setAuthForm] = useState({ phone: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("rb_user");
    if (stored) navigate("/dashboard");
  }, []);

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    const result = await authRequest(authTab, authForm.phone, authForm.password);
    setAuthLoading(false);
    if (result.error) { setAuthError(result.error); return; }
    localStorage.setItem("rb_user", JSON.stringify(result));
    setShowAuth(false);
    navigate("/dashboard");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminForm.login === "Yalta" && adminForm.password === "Yalta220577") {
      sessionStorage.setItem("rb_admin", "1");
      setShowAdminLogin(false);
      navigate("/admin");
    } else {
      setAdminError(true);
      setTimeout(() => setAdminError(false), 2500);
    }
  };

  const openAuth = (tab: "login" | "register" = "register") => {
    setAuthTab(tab);
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader
        onLoginClick={() => openAuth("login")}
        onRegisterClick={() => openAuth("register")}
      />

      <LandingSections
        visibleSections={visibleSections}
        onOpenAuth={() => openAuth("register")}
        onOpenAdminLogin={() => setShowAdminLogin(true)}
      />

      <AdminLoginModal
        show={showAdminLogin}
        form={adminForm}
        error={adminError}
        onClose={() => setShowAdminLogin(false)}
        onFormChange={setAdminForm}
        onSubmit={handleAdminLogin}
      />

      <ContactModal
        show={showModal}
        form={form}
        onClose={() => setShowModal(false)}
        onFormChange={setForm}
        onSubmit={handleSubmit}
      />

      <SuccessToast show={showSuccess} />

      <AuthModal
        show={showAuth}
        tab={authTab}
        form={authForm}
        error={authError}
        loading={authLoading}
        onClose={() => setShowAuth(false)}
        onTabChange={setAuthTab}
        onFormChange={setAuthForm}
        onSubmit={handleAuth}
      />
    </div>
  );
};

export default Index;
