import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Lightbulb, Settings, Home as HomeIcon, Share, User, LogOut, Menu, X, Book, Loader2, Clock, Zap, CreditCard, Building2, Rocket, FolderOpen, Trash2, Search, ArrowUpDown, Crown, Lock, Globe, LayoutGrid, ShoppingBag, Store, Smartphone, Briefcase, HelpCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { generateIdeas } from "../lib/gemini";
import { TEMPLATES, Template } from "../constants/templates";

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [idea, setIdea] = useState("");
  const [mode, setMode] = useState<"create" | "scale" | "analyse">("create");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBrainstormModal, setShowBrainstormModal] = useState(false);
  const [brainstormInterests, setBrainstormInterests] = useState("");
  const [businessType, setBusinessType] = useState<'startup' | 'traditional'>('startup');
  const [generatedIdeas, setGeneratedIdeas] = useState<{title: string, description: string, targetAudience?: string, businessModel?: string, marketOpportunity?: string, estimatedTime?: string, methods?: {free: string, paid: string}}[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [isPrivate, setIsPrivate] = useState(false);
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  useEffect(() => {
    if (user?.default_mode) {
      setMode(user.default_mode as "create" | "scale");
    }
  }, [user]);

  useEffect(() => {
    fetch("/api/projects", {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProjects(data));
  }, [token]);

  const handleStartProject = async (overrideIdea?: string, template?: Template) => {
    setIsCreatingProject(true);
    const finalIdea = overrideIdea || idea;
    const projectName = template ? template.name : (finalIdea ? (finalIdea.slice(0, 30) + "...") : "Nouveau projet");
    const projectDescription = template ? template.description : (finalIdea || "Projet vide");
    
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: projectName, description: projectDescription, mode, is_private: isPrivate }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create project");
      }
      
      const project = await res.json();

      if (template) {
        // Add template cards
        const cardPromises = template.cards.map((card, index) => {
          // Calculate positions for a 3x3 grid or similar
          const row = Math.floor((card.phase - 1) / 3);
          const col = (card.phase - 1) % 3;
          return fetch(`/api/projects/${project.id}/cards`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              title: card.title,
              content: card.content,
              phase: card.phase,
              position_x: 100 + col * 320,
              position_y: 100 + row * 280
            }),
          });
        });
        await Promise.all(cardPromises);
      }

      navigate(`/project/${project.id}`);
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!confirm("Voulez-vous vraiment supprimer ce projet ?")) return;
    
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
      }
    } catch (error) {
      console.error("Failed to delete project", error);
    }
  };

  const handleBrainstorm = async () => {
    setIsGeneratingIdeas(true);
    setGeneratedIdeas([]);
    try {
      const ideas = await generateIdeas(brainstormInterests, businessType);
      setGeneratedIdeas(ideas);
    } catch (error) {
      console.error("Failed to generate ideas", error);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };


  const filteredProjects = projects
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return a.name.localeCompare(b.name);
    });

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
            <button className="flex items-center gap-3 w-full px-3 py-2 bg-neutral-200/50 rounded-lg text-sm font-medium">
              <HomeIcon className="w-4 h-4" /> Accueil
            </button>
            <button 
              onClick={() => navigate('/help')}
              className="flex items-center gap-3 w-full px-3 py-2 text-neutral-600 hover:bg-neutral-200/50 rounded-lg text-sm font-medium"
            >
              <HelpCircle className="w-4 h-4" /> Aide & Tutoriels
            </button>
            {user?.role === 'admin' && (
              <button 
                onClick={() => navigate('/settings')}
                className="flex items-center gap-3 w-full px-3 py-2 text-neutral-600 hover:bg-neutral-200/50 rounded-lg text-sm font-medium"
              >
                <Settings className="w-4 h-4" /> Paramètres
              </button>
            )}
            <button 
              onClick={() => navigate('/account')}
              className="flex items-center gap-3 w-full px-3 py-2 text-neutral-600 hover:bg-neutral-200/50 rounded-lg text-sm font-medium"
            >
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
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 relative pt-14 md:pt-0 overflow-y-auto">
        <div className="w-full max-w-[720px] py-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-sm">
              <Crown className="w-3 h-3" /> Plan Pro Actif
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 text-center mb-8">
            Bonjour, {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}
          </h1>
          
          {/* Main input */}
          <div className="bg-white rounded-2xl p-2 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-neutral-100 mb-6">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full outline-none text-neutral-700 placeholder:text-neutral-400 text-base resize-none p-4 min-h-[100px]"
              placeholder="Que souhaitez-vous démarrer ?"
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 border-t border-neutral-100 mt-2 gap-2 sm:gap-0">
              <div className="flex bg-neutral-100 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setMode('create')}
                  disabled={isCreatingProject}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap disabled:opacity-50 ${mode === 'create' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  🌱 Créer
                </button>
                <button
                  onClick={() => setMode('scale')}
                  disabled={isCreatingProject}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap disabled:opacity-50 ${mode === 'scale' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  🚀 Scaler
                </button>
                <button
                  onClick={() => setMode('analyse')}
                  disabled={isCreatingProject}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap disabled:opacity-50 ${mode === 'analyse' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  🔍 Analyser
                </button>
              </div>
              <button 
                onClick={() => handleStartProject()}
                disabled={isCreatingProject}
                className="bg-blue-600/20 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors rounded-full w-full sm:w-8 h-8 flex items-center justify-center disabled:opacity-50"
              >
                {isCreatingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <span className="sm:hidden font-medium text-sm">Démarrer</span>
                    <span className="hidden sm:inline">↑</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 sm:gap-0">
            <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => handleStartProject()}
                disabled={isCreatingProject}
                className="flex items-center gap-2 bg-white border border-neutral-200 text-neutral-700 rounded-full px-4 py-2 text-sm font-medium shadow-sm hover:bg-neutral-50 disabled:opacity-50"
              >
                {isCreatingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-neutral-400">▷</span>} 
                {isCreatingProject ? "Création..." : "Démarrer le projet"}
              </button>
              <button 
                onClick={() => setShowBrainstormModal(true)}
                className="flex items-center gap-2 bg-white border border-neutral-200 text-neutral-700 rounded-full px-4 py-2 text-sm font-medium shadow-sm hover:bg-neutral-50"
              >
                <Lightbulb className="w-4 h-4 text-neutral-400" /> Trouver des idées
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
              Mode privé
              <div 
                className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${isPrivate ? 'bg-blue-600' : 'bg-neutral-200'}`} 
                onClick={() => setIsPrivate(!isPrivate)}
              >
                <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${isPrivate ? 'left-4' : 'left-0.5'}`}></div>
              </div>
            </div>
          </div>

          {/* Templates Section */}
          <div className="mb-12">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Modèles d'industrie
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleStartProject(undefined, template)}
                  disabled={isCreatingProject}
                  className="flex flex-col items-center gap-2 p-4 bg-white border border-neutral-200 rounded-2xl hover:border-blue-600 hover:shadow-md transition-all group text-center disabled:opacity-50 disabled:hover:border-neutral-200 disabled:hover:shadow-none disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                    <template.icon className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-neutral-700 group-hover:text-blue-600 transition-colors leading-tight">
                    {template.name.split(' (')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* All projects */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-neutral-400" />
                  Vos projets
                </h2>
                <span className="text-xs font-medium bg-neutral-100 text-neutral-500 px-2 py-1 rounded-full">
                  {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 w-full sm:w-48"
                  />
                </div>
                <button 
                  onClick={() => setSortBy(prev => prev === "date" ? "name" : "date")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-600 whitespace-nowrap"
                  title={`Trier par ${sortBy === "date" ? "nom" : "date"}`}
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="hidden sm:inline">{sortBy === "date" ? "Date" : "Nom"}</span>
                </button>
              </div>
            </div>
            
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProjects.map((project) => (
                  <div 
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[120px]"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-neutral-800 text-base group-hover:text-blue-600 transition-colors line-clamp-1 flex items-center gap-2">
                          {project.name}
                          {project.is_private === 1 ? (
                            <span title="Projet privé"><Lock className="w-3 h-3 text-neutral-400" /></span>
                          ) : (
                            <span title="Projet public"><Globe className="w-3 h-3 text-neutral-400" /></span>
                          )}
                        </h3>
                        <button 
                          onClick={(e) => handleDeleteProject(e, project.id)}
                          className="text-neutral-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                          title="Supprimer le projet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-neutral-500 line-clamp-2">{project.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
                      <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                        {project.mode === 'create' ? '🌱 Création' : project.mode === 'scale' ? '🚀 Scale' : '🔍 Analyse'}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-100 border-dashed p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-3">
                  <FolderOpen className="w-6 h-6 text-neutral-300" />
                </div>
                <h3 className="text-sm font-medium text-neutral-700 mb-1">Aucun projet</h3>
                <p className="text-xs text-neutral-500">Commencez par créer votre premier projet ci-dessus.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Brainstorm Modal */}
      {showBrainstormModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-800">Trouver des idées</h2>
                  <p className="text-sm text-neutral-500">Laissez l'IA vous suggérer des concepts innovants.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBrainstormModal(false)}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Type d'entreprise
                  </label>
                  <div className="flex bg-neutral-100 p-1 rounded-lg w-full sm:w-fit">
                    <button
                      onClick={() => setBusinessType('startup')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${businessType === 'startup' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                      <Rocket className="w-4 h-4" /> Startup / Tech
                    </button>
                    <button
                      onClick={() => setBusinessType('traditional')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${businessType === 'traditional' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                      <Building2 className="w-4 h-4" /> Traditionnelle
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Centres d'intérêt ou domaine (optionnel)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={brainstormInterests}
                      onChange={(e) => setBrainstormInterests(e.target.value)}
                      placeholder={businessType === 'startup' ? "Ex: IA, Santé, Éducation, SaaS B2B..." : "Ex: Restauration, Agence, Artisanat, Consulting..."}
                      className="flex-1 border border-neutral-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleBrainstorm(); }}
                    />
                    <button
                      onClick={handleBrainstorm}
                      disabled={isGeneratingIdeas}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isGeneratingIdeas ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Génération...</>
                      ) : (
                        "Générer"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {isGeneratingIdeas && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Génération en cours...</h3>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-neutral-200 rounded-xl p-4 animate-pulse">
                      <div className="flex justify-between items-start mb-2">
                        <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
                        <div className="h-6 bg-neutral-200 rounded-full w-24"></div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="h-4 bg-neutral-200 rounded w-full"></div>
                        <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
                      </div>
                      <div className="flex gap-2 mt-2 mb-3">
                        <div className="h-6 bg-neutral-200 rounded-md w-20"></div>
                        <div className="h-6 bg-neutral-200 rounded-md w-24"></div>
                        <div className="h-6 bg-neutral-200 rounded-md w-24"></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-100">
                        <div className="h-20 bg-neutral-200 rounded-lg"></div>
                        <div className="h-20 bg-neutral-200 rounded-lg"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isGeneratingIdeas && generatedIdeas.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Idées générées</h3>
                  {generatedIdeas.map((idea, index) => (
                    <div 
                      key={index}
                      className="border border-neutral-200 rounded-xl p-4 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => {
                        setShowBrainstormModal(false);
                        const richPrompt = `Je veux créer une entreprise appelée "${idea.title}".\n\nDescription: ${idea.description}\n\nCible: ${idea.targetAudience || 'Non spécifiée'}\n\nBusiness Model: ${idea.businessModel || 'Non spécifié'}\n\nOpportunité de marché: ${idea.marketOpportunity || 'Non spécifiée'}\n\nTemps estimé pour lancer: ${idea.estimatedTime || 'Non spécifié'}\n\nMéthode gratuite (outils): ${idea.methods?.free || 'Non spécifiée'}\n\nMéthode payante (outils): ${idea.methods?.paid || 'Non spécifiée'}\n\nAgis comme mon cofondateur, analyse cette idée en profondeur, donne-moi ton avis critique et génère un plan d'action complet sur le canvas en prenant en compte ces méthodes.`;
                        handleStartProject(richPrompt);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-neutral-800 text-lg group-hover:text-blue-600 transition-colors">{idea.title}</h4>
                        <span className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full group-hover:bg-blue-600/10 group-hover:text-blue-600 transition-colors whitespace-nowrap ml-2">
                          Sélectionner →
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed mb-3">{idea.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-2 mb-3">
                        {idea.estimatedTime && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                            <Clock className="w-3 h-3" /> {idea.estimatedTime}
                          </span>
                        )}
                        {idea.targetAudience && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                            🎯 {idea.targetAudience}
                          </span>
                        )}
                        {idea.businessModel && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium">
                            💰 {idea.businessModel}
                          </span>
                        )}
                      </div>

                      {idea.methods && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-100">
                          <div className="bg-neutral-50 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-1.5">
                              <Zap className="w-3.5 h-3.5 text-blue-500" /> Méthode 100% Gratuite
                            </div>
                            <p className="text-xs text-neutral-600 leading-relaxed">{idea.methods.free}</p>
                          </div>
                          <div className="bg-neutral-50 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Méthode Payante (Rapide)
                            </div>
                            <p className="text-xs text-neutral-600 leading-relaxed">{idea.methods.paid}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {!isGeneratingIdeas && generatedIdeas.length === 0 && (
                <div className="text-center py-12 text-neutral-400">
                  <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Cliquez sur "Générer" pour obtenir des idées de startup.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
