import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, Book, Settings, User, LogOut, Menu, X, Mail, Shield, CreditCard, Loader2, HelpCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export default function Account() {
  const navigate = useNavigate();
  const { user, logout, token, updateUser } = useAuth();
  const { addToast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-slate-50 border-b border-neutral-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="w-6 h-6 bg-blue-600 rounded-md"></div>
          Uprising Cofounder
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 w-[260px] bg-slate-50 border-r border-neutral-200 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 pt-20' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <div className="hidden md:flex items-center gap-2 font-bold text-lg mb-8 px-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md"></div>
            Uprising Cofounder
          </div>
          <nav className="space-y-1">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 w-full px-3 py-2 text-neutral-600 hover:bg-neutral-200/50 rounded-lg text-sm font-medium">
              <HomeIcon className="w-4 h-4" /> Accueil
            </button>
            <button onClick={() => navigate('/help')} className="flex items-center gap-3 w-full px-3 py-2 text-neutral-600 hover:bg-neutral-200/50 rounded-lg text-sm font-medium">
              <HelpCircle className="w-4 h-4" /> Aide & Tutoriels
            </button>
            {user?.role === 'admin' && (
              <button onClick={() => navigate('/settings')} className="flex items-center gap-3 w-full px-3 py-2 text-neutral-600 hover:bg-neutral-200/50 rounded-lg text-sm font-medium">
                <Settings className="w-4 h-4" /> Paramètres
              </button>
            )}
            <button className="flex items-center gap-3 w-full px-3 py-2 bg-neutral-200/50 rounded-lg text-sm font-medium">
              <User className="w-4 h-4" /> Mon Compte
            </button>
          </nav>
        </div>
        
        <div className="space-y-2">
          <button 
            onClick={logout}
            className="flex items-center justify-between w-full p-3 hover:bg-neutral-200/50 rounded-xl text-sm text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
              </div>
              <span className="font-medium text-neutral-800 truncate max-w-[120px]">{user?.name || user?.email}</span>
            </div>
            <LogOut className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-3xl mx-auto w-full p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-6">Mon Compte</h1>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">{user?.name || "Utilisateur"}</h2>
                  <p className="text-neutral-500">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Rôle</p>
                      <p className="text-sm text-neutral-500 capitalize">{user?.role || "Utilisateur"}</p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      setIsUpdatingRole(true);
                      try {
                        const newRole = user?.role === 'admin' ? 'user' : 'admin';
                        const res = await fetch("/api/users/onboarding", {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                          },
                          body: JSON.stringify({ role: newRole })
                        });
                        if (res.ok) {
                          const data = await res.json();
                          updateUser({ ...user!, role: newRole });
                          addToast(`Vous êtes maintenant ${newRole === 'admin' ? 'Administrateur' : 'Utilisateur'}`, "success");
                        } else {
                          addToast("Erreur lors du changement de rôle", "error");
                        }
                      } finally {
                        setIsUpdatingRole(false);
                      }
                    }}
                    disabled={isUpdatingRole}
                    className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50 flex items-center gap-1"
                  >
                    {isUpdatingRole ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    Changer en {user?.role === 'admin' ? 'Utilisateur' : 'Admin'}
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Objectif</p>
                      <p className="text-sm text-neutral-500">{user?.goal || "Non spécifié"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Email</p>
                      <p className="text-sm text-neutral-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-neutral-500" /> Abonnement
              </h2>
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-800">Plan Gratuit</p>
                  <p className="text-sm text-neutral-500 mt-1">Fonctionnalités de base incluses.</p>
                </div>
                <button className="bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
                  Passer à la version Pro
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
              <h2 className="text-lg font-semibold text-red-600 mb-2">Zone de danger</h2>
              <p className="text-sm text-neutral-500 mb-4">Une fois que vous supprimez votre compte, il n'y a pas de retour en arrière. Soyez certain de votre choix.</p>
              <button className="text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Supprimer le compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
