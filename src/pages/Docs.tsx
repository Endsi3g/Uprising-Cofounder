import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, Book, Settings, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Docs() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#FDF7F1]">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#FDF7F1] border-b border-neutral-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="w-6 h-6 bg-[#E8794A] rounded-md"></div>
          Uprising Cofounder
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 w-[260px] bg-[#FDF7F1] border-r border-neutral-200 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 pt-20' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <div className="hidden md:flex items-center gap-2 font-bold text-lg mb-8 px-2">
            <div className="w-6 h-6 bg-[#E8794A] rounded-md"></div>
            Uprising Cofounder
          </div>
          <nav className="space-y-1">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 w-full px-3 py-2 text-neutral-600 hover:bg-neutral-200/50 rounded-lg text-sm font-medium">
              <HomeIcon className="w-4 h-4" /> Accueil
            </button>
            <button className="flex items-center gap-3 w-full px-3 py-2 bg-neutral-200/50 rounded-lg text-sm font-medium">
              <Book className="w-4 h-4" /> Docs
            </button>
            {user?.role === 'admin' && (
              <button onClick={() => navigate('/settings')} className="flex items-center gap-3 w-full px-3 py-2 text-neutral-600 hover:bg-neutral-200/50 rounded-lg text-sm font-medium">
                <Settings className="w-4 h-4" /> Paramètres
              </button>
            )}
            <button onClick={() => navigate('/account')} className="flex items-center gap-3 w-full px-3 py-2 text-neutral-600 hover:bg-neutral-200/50 rounded-lg text-sm font-medium">
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
          <h1 className="text-3xl font-bold text-neutral-900 mb-6">Documentation</h1>
          
          <div className="space-y-8">
            <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">Bienvenue sur Uprising Cofounder</h2>
              <p className="text-neutral-600 leading-relaxed">
                Uprising Cofounder est votre partenaire IA pour la création et le développement de votre entreprise. 
                Que vous soyez au stade de l'idée ou en phase de croissance, notre plateforme s'adapte à vos besoins.
              </p>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">Les Modes</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-neutral-900 flex items-center gap-2"><span className="text-xl">🌱</span> Mode Création</h3>
                  <p className="text-neutral-600 text-sm mt-1">Idéal si vous n'avez pas encore d'entreprise. Validez vos idées, trouvez votre marché et obtenez vos premiers clients.</p>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 flex items-center gap-2"><span className="text-xl">🚀</span> Mode Scale</h3>
                  <p className="text-neutral-600 text-sm mt-1">Conçu pour les entreprises existantes. Optimisez vos opérations, trouvez de nouveaux leviers de croissance et scalez vos revenus.</p>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">L'Espace de Travail</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Chaque projet dispose d'un espace de travail unique combinant un chat intelligent et un tableau blanc infini.
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 text-sm">
                <li>Discutez avec votre cofondateur IA pour brainstormer et analyser.</li>
                <li>Utilisez les mots-clés "recherche" ou "analyse" pour générer des cartes de synthèse.</li>
                <li>Déplacez et organisez les cartes sur le tableau blanc pour structurer votre pensée.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
