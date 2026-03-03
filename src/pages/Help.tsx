import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, HelpCircle, Settings, User, LogOut, Menu, X, Search, ChevronDown, ChevronUp, BookOpen, MessageCircle, Lightbulb } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Help() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'guide' | 'faq'>('guide');

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
              <HelpCircle className="w-4 h-4" /> Aide & Tutoriels
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
            className="flex items-center justify-between w-full p-3 hover:bg-neutral-200/50 rounded-lg text-sm text-left"
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
        <div className="max-w-4xl mx-auto w-full p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Centre d'Aide</h1>
          <p className="text-neutral-500 mb-8">Guides, tutoriels et réponses à vos questions.</p>
          
          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-neutral-200 mb-8">
            <button 
              onClick={() => setActiveTab('guide')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'guide' ? 'text-[#E8794A]' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Guide de Démarrage
              {activeTab === 'guide' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8794A] rounded-t-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('faq')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'faq' ? 'text-[#E8794A]' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Foire Aux Questions
              {activeTab === 'faq' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8794A] rounded-t-full"></div>}
            </button>
          </div>

          {activeTab === 'guide' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-800 mb-2">Bienvenue sur Uprising Cofounder</h2>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Uprising Cofounder est votre partenaire IA pour la création et le développement de votre entreprise. 
                      Notre plateforme combine intelligence artificielle et outils de gestion de projet pour vous aider à passer de l'idée à l'action.
                    </p>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                  <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🌱</span> Mode Création
                  </h3>
                  <p className="text-neutral-600 text-sm mb-4">
                    Idéal pour les entrepreneurs en phase de démarrage. Ce mode vous aide à :
                  </p>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-[#E8794A] rounded-full mt-1.5"></div>
                      Valider votre idée de business
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-[#E8794A] rounded-full mt-1.5"></div>
                      Identifier votre marché cible
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-[#E8794A] rounded-full mt-1.5"></div>
                      Créer votre MVP (Produit Minimum Viable)
                    </li>
                  </ul>
                </section>

                <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                  <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🚀</span> Mode Scale
                  </h3>
                  <p className="text-neutral-600 text-sm mb-4">
                    Conçu pour les entreprises déjà établies. Ce mode se concentre sur :
                  </p>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-[#E8794A] rounded-full mt-1.5"></div>
                      L'optimisation des opérations
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-[#E8794A] rounded-full mt-1.5"></div>
                      L'acquisition de nouveaux clients
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-[#E8794A] rounded-full mt-1.5"></div>
                      L'analyse de la concurrence
                    </li>
                  </ul>
                </section>
              </div>

              <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-neutral-500" /> Comment utiliser l'espace de travail
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-600 flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-1">Le Chat Intelligent</h4>
                      <p className="text-sm text-neutral-600">Discutez naturellement avec votre cofondateur IA. Posez des questions, demandez des conseils ou brainstormez des idées.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-600 flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-1">Génération de Cartes</h4>
                      <p className="text-sm text-neutral-600">Utilisez des mots-clés comme "analyse", "résumé" ou "plan" pour que l'IA génère des cartes visuelles sur votre tableau blanc.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-600 flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-1">Le Tableau Blanc</h4>
                      <p className="text-sm text-neutral-600">Organisez vos idées visuellement. Vous pouvez déplacer les cartes, les modifier et structurer votre projet comme vous le souhaitez.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher une question..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#E8794A] focus:ring-1 focus:ring-[#E8794A] shadow-sm"
                />
              </div>

              <div className="space-y-4">
                {[
                  {
                    q: "Comment créer un nouveau projet ?",
                    a: "Pour créer un nouveau projet, rendez-vous sur la page d'accueil et utilisez la zone de saisie principale pour décrire votre idée. Cliquez ensuite sur 'Démarrer' ou sélectionnez 'Créer' pour lancer le processus."
                  },
                  {
                    q: "Qu'est-ce que le mode 'Scale' ?",
                    a: "Le mode 'Scale' est conçu pour les entreprises existantes. Il offre des outils spécifiques pour l'analyse de croissance, l'optimisation des processus et l'expansion du marché."
                  },
                  {
                    q: "Puis-je inviter des collaborateurs ?",
                    a: "La fonctionnalité de collaboration en temps réel est actuellement en cours de développement. Vous serez notifié dès qu'elle sera disponible pour votre compte."
                  },
                  {
                    q: "Comment fonctionne le système de crédits ?",
                    a: "Chaque interaction avec l'IA consomme des crédits. Le plan gratuit inclut un quota mensuel généreux. Pour des besoins plus importants, vous pouvez passer au plan Pro depuis la page 'Mon Compte'."
                  },
                  {
                    q: "Mes données sont-elles sécurisées ?",
                    a: "Oui, la sécurité est notre priorité. Vos données sont chiffrées et ne sont jamais partagées avec des tiers sans votre consentement explicite. Nous utilisons des protocoles de sécurité bancaire."
                  },
                  {
                    q: "Comment supprimer un projet ?",
                    a: "Sur la page d'accueil, cliquez sur l'icône de corbeille située sur la carte du projet que vous souhaitez supprimer. Cette action est irréversible."
                  },
                  {
                    q: "Puis-je exporter mon Pitch Deck ?",
                    a: "Oui, une fois votre Pitch Deck généré dans un projet, vous pouvez le copier ou l'exporter au format texte pour l'utiliser dans vos présentations."
                  }
                ].filter(item => 
                  item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  item.a.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((item, index) => (
                  <div key={index} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-neutral-50 transition-colors">
                        <span className="font-medium text-neutral-900">{item.q}</span>
                        <span className="transition-transform group-open:rotate-180">
                          <ChevronDown className="w-5 h-5 text-neutral-400" />
                        </span>
                      </summary>
                      <div className="px-4 pb-4 text-neutral-600 text-sm leading-relaxed border-t border-neutral-100 pt-4">
                        {item.a}
                      </div>
                    </details>
                  </div>
                ))}

                {[
                  {
                    q: "Comment créer un nouveau projet ?",
                    a: "Pour créer un nouveau projet, rendez-vous sur la page d'accueil et utilisez la zone de saisie principale pour décrire votre idée. Cliquez ensuite sur 'Démarrer' ou sélectionnez 'Créer' pour lancer le processus."
                  },
                  {
                    q: "Qu'est-ce que le mode 'Scale' ?",
                    a: "Le mode 'Scale' est conçu pour les entreprises existantes. Il offre des outils spécifiques pour l'analyse de croissance, l'optimisation des processus et l'expansion du marché."
                  },
                  {
                    q: "Puis-je inviter des collaborateurs ?",
                    a: "La fonctionnalité de collaboration en temps réel est actuellement en cours de développement. Vous serez notifié dès qu'elle sera disponible pour votre compte."
                  },
                  {
                    q: "Comment fonctionne le système de crédits ?",
                    a: "Chaque interaction avec l'IA consomme des crédits. Le plan gratuit inclut un quota mensuel généreux. Pour des besoins plus importants, vous pouvez passer au plan Pro depuis la page 'Mon Compte'."
                  },
                  {
                    q: "Mes données sont-elles sécurisées ?",
                    a: "Oui, la sécurité est notre priorité. Vos données sont chiffrées et ne sont jamais partagées avec des tiers sans votre consentement explicite. Nous utilisons des protocoles de sécurité bancaire."
                  },
                  {
                    q: "Comment supprimer un projet ?",
                    a: "Sur la page d'accueil, cliquez sur l'icône de corbeille située sur la carte du projet que vous souhaitez supprimer. Cette action est irréversible."
                  },
                  {
                    q: "Puis-je exporter mon Pitch Deck ?",
                    a: "Oui, une fois votre Pitch Deck généré dans un projet, vous pouvez le copier ou l'exporter au format texte pour l'utiliser dans vos présentations."
                  }
                ].filter(item => 
                  item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  item.a.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-neutral-500">Aucun résultat trouvé pour "{searchQuery}"</p>
                    <button onClick={() => setSearchQuery("")} className="text-[#E8794A] text-sm font-medium mt-2 hover:underline">
                      Effacer la recherche
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
