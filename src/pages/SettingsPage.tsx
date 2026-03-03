import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, Book, Settings, User, LogOut, Menu, X, Bell, Moon, Sun, Laptop, Key, ExternalLink, BarChart3, Users, TrendingUp, Activity, Zap, Loader2, HelpCircle, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, checkAuth, token } = useAuth();
  const { addToast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("light");
  const [defaultMode, setDefaultMode] = useState("create");
  
  // API Keys
  const [blandApiKey, setBlandApiKey] = useState("");
  const [twilioAccountSid, setTwilioAccountSid] = useState("");
  const [twilioAuthToken, setTwilioAuthToken] = useState("");
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState("");
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState("");
  const [twentyApiKey, setTwentyApiKey] = useState("");

  // Cookie Preferences
  const [analyticsCookies, setAnalyticsCookies] = useState(false);
  const [marketingCookies, setMarketingCookies] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNotifications(user.notifications_enabled === 1);
      setTheme(user.theme || "light");
      setDefaultMode(user.default_mode || "create");
      setBlandApiKey(user.bland_api_key || "");
      setTwilioAccountSid(user.twilio_account_sid || "");
      setTwilioAuthToken(user.twilio_auth_token || "");
      setTwilioPhoneNumber(user.twilio_phone_number || "");
      setElevenLabsApiKey(user.elevenlabs_api_key || "");
      setTwentyApiKey(user.twenty_api_key || "");
    }
    
    // Load cookie preferences
    const storedAnalytics = localStorage.getItem('cookie_analytics');
    const storedMarketing = localStorage.getItem('cookie_marketing');
    setAnalyticsCookies(storedAnalytics === 'true');
    setMarketingCookies(storedMarketing === 'true');
  }, [user]);

  const handleSaveCookiePreferences = () => {
    localStorage.setItem('cookie_analytics', String(analyticsCookies));
    localStorage.setItem('cookie_marketing', String(marketingCookies));
    localStorage.setItem('cookie_consent', 'custom');
    addToast("Préférences de cookies mises à jour", "success");
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch("/api/users/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          notifications_enabled: notifications,
          theme,
          default_mode: defaultMode,
          bland_api_key: blandApiKey,
          twilio_account_sid: twilioAccountSid,
          twilio_auth_token: twilioAuthToken,
          twilio_phone_number: twilioPhoneNumber,
          elevenlabs_api_key: elevenLabsApiKey,
          twenty_api_key: twentyApiKey
        })
      });
      await checkAuth();
      addToast("Paramètres sauvegardés avec succès !", "success");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde", error);
      addToast("Une erreur est survenue.", "error");
    } finally {
      setLoading(false);
    }
  };

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
              <button className="flex items-center gap-3 w-full px-3 py-2 bg-neutral-200/50 rounded-lg text-sm font-medium">
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
          <h1 className="text-3xl font-bold text-neutral-900 mb-6">Paramètres</h1>
          
          <div className="space-y-6">
            
            {/* Analytics Section (Admin Only) */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-neutral-500" /> Analytiques de l'App
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
                    <Users className="w-3 h-3" /> Utilisateurs
                  </div>
                  <div className="text-xl font-bold text-neutral-900">1,284</div>
                  <div className="text-[10px] text-green-600 font-medium">+12% ce mois</div>
                </div>
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
                    <Activity className="w-3 h-3" /> Projets Actifs
                  </div>
                  <div className="text-xl font-bold text-neutral-900">452</div>
                  <div className="text-[10px] text-green-600 font-medium">+5% cette semaine</div>
                </div>
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
                    <TrendingUp className="w-3 h-3" /> Revenus (MRR)
                  </div>
                  <div className="text-xl font-bold text-neutral-900">$12,450</div>
                  <div className="text-[10px] text-green-600 font-medium">+8% ce mois</div>
                </div>
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
                    <Zap className="w-3 h-3 text-amber-500" /> Appels IA
                  </div>
                  <div className="text-xl font-bold text-neutral-900">8,920</div>
                  <div className="text-[10px] text-neutral-400 font-medium">Quota: 10k</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <span className="text-sm text-neutral-700">Performance Serveur</span>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">99.9% Uptime</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <span className="text-sm text-neutral-700">Temps de réponse IA (moyenne)</span>
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">1.2s</span>
                </div>
              </div>
            </div>

            {/* API Keys Section */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-neutral-500" /> Intégrations & API
              </h2>
              <p className="text-sm text-neutral-500 mb-6">
                Connectez vos services tiers pour activer les fonctionnalités avancées (appels, SMS, CRM).
                <br />
                <span className="text-xs italic text-neutral-400">Ces clés sont stockées de manière sécurisée et utilisées uniquement pour vos actions.</span>
              </p>

              <div className="space-y-4">
                {/* Bland AI */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1 flex justify-between">
                    Bland AI (Appels Vocaux)
                    <a href="https://docs.bland.ai/welcome/introduction" target="_blank" rel="noreferrer" className="text-blue-600 text-xs flex items-center gap-1 hover:underline">
                      Obtenir une clé <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input 
                    type="password" 
                    placeholder="sk-..." 
                    value={blandApiKey}
                    onChange={(e) => setBlandApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                  />
                </div>

                {/* Twilio */}
                <div className="border-t border-neutral-100 pt-4 mt-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-1 flex justify-between">
                    Twilio (SMS)
                    <a href="https://www.twilio.com/console" target="_blank" rel="noreferrer" className="text-blue-600 text-xs flex items-center gap-1 hover:underline">
                      Console Twilio <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Account SID (AC...)" 
                      value={twilioAccountSid}
                      onChange={(e) => setTwilioAccountSid(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                    />
                    <input 
                      type="password" 
                      placeholder="Auth Token" 
                      value={twilioAuthToken}
                      onChange={(e) => setTwilioAuthToken(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="Numéro Twilio (+1...)" 
                      value={twilioPhoneNumber}
                      onChange={(e) => setTwilioPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none md:col-span-2"
                    />
                  </div>
                </div>

                {/* ElevenLabs */}
                <div className="border-t border-neutral-100 pt-4 mt-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-1 flex justify-between">
                    ElevenLabs (Synthèse Vocale)
                    <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noreferrer" className="text-blue-600 text-xs flex items-center gap-1 hover:underline">
                      Obtenir une clé <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input 
                    type="password" 
                    placeholder="xi-..." 
                    value={elevenLabsApiKey}
                    onChange={(e) => setElevenLabsApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                  />
                </div>

                {/* Twenty CRM */}
                <div className="border-t border-neutral-100 pt-4 mt-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-1 flex justify-between">
                    Twenty CRM (Gestion Leads)
                    <a href="https://twenty.com" target="_blank" rel="noreferrer" className="text-blue-600 text-xs flex items-center gap-1 hover:underline">
                      Site Twenty <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input 
                    type="password" 
                    placeholder="Clé API Twenty" 
                    value={twentyApiKey}
                    onChange={(e) => setTwentyApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                  />
                </div>

              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-neutral-500" /> Notifications
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-800">Notifications par email</p>
                  <p className="text-xs text-neutral-500">Recevez des mises à jour sur vos projets.</p>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${notifications ? 'bg-blue-600' : 'bg-neutral-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-neutral-500" /> Apparence
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${theme === 'light' ? 'border-blue-600 bg-blue-600/5' : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-blue-600' : 'text-neutral-500'}`} />
                  <span className="text-sm font-medium">Clair</span>
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${theme === 'dark' ? 'border-blue-600 bg-blue-600/5' : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-600' : 'text-neutral-500'}`} />
                  <span className="text-sm font-medium">Sombre</span>
                </button>
                <button 
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${theme === 'system' ? 'border-blue-600 bg-blue-600/5' : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  <Laptop className={`w-5 h-5 ${theme === 'system' ? 'text-blue-600' : 'text-neutral-500'}`} />
                  <span className="text-sm font-medium">Système</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-neutral-500" /> Mode par défaut
              </h2>
              <p className="text-sm text-neutral-500 mb-4">Choisissez le mode de projet qui sera sélectionné par défaut lors de la création d'un nouveau projet.</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setDefaultMode('create')}
                  className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-colors ${defaultMode === 'create' ? 'border-blue-600 bg-blue-600/5' : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  <span className="text-xl">🌱</span>
                  <span className="text-sm font-medium text-neutral-900">Créer</span>
                  <span className="text-xs text-neutral-500 text-left">Pour les nouvelles idées</span>
                </button>
                <button 
                  onClick={() => setDefaultMode('scale')}
                  className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-colors ${defaultMode === 'scale' ? 'border-blue-600 bg-blue-600/5' : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  <span className="text-xl">🚀</span>
                  <span className="text-sm font-medium text-neutral-900">Scaler</span>
                  <span className="text-xs text-neutral-500 text-left">Pour les entreprises existantes</span>
                </button>
              </div>
            </div>

            {/* Cookie Preferences */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-neutral-500" /> Confidentialité & Cookies
              </h2>
              <p className="text-sm text-neutral-500 mb-6">
                Gérez vos préférences en matière de cookies. Les cookies essentiels sont nécessaires au fonctionnement du site.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Cookies Essentiels</p>
                    <p className="text-xs text-neutral-500">Nécessaires pour l'authentification et la sécurité.</p>
                  </div>
                  <div className="w-11 h-6 bg-blue-600 rounded-full relative opacity-50 cursor-not-allowed">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 translate-x-6"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Cookies Analytiques</p>
                    <p className="text-xs text-neutral-500">Nous aident à comprendre comment vous utilisez le site.</p>
                  </div>
                  <button 
                    onClick={() => setAnalyticsCookies(!analyticsCookies)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${analyticsCookies ? 'bg-blue-600' : 'bg-neutral-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${analyticsCookies ? 'translate-x-6' : 'translate-x-1'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Cookies Marketing</p>
                    <p className="text-xs text-neutral-500">Utilisés pour vous proposer des contenus pertinents.</p>
                  </div>
                  <button 
                    onClick={() => setMarketingCookies(!marketingCookies)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${marketingCookies ? 'bg-blue-600' : 'bg-neutral-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${marketingCookies ? 'translate-x-6' : 'translate-x-1'}`}></div>
                  </button>
                </div>

                <div className="pt-2 flex justify-end">
                    <button 
                        onClick={handleSaveCookiePreferences}
                        className="text-sm text-blue-600 font-medium hover:underline"
                    >
                        Mettre à jour les préférences de cookies
                    </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
