import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, Lightbulb, Hexagon, EyeOff, Sparkles, LayoutDashboard, MessageSquare, Presentation, Search, ChevronDown, Shield, Zap, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Hero } from '../components/ui/animated-hero';
import { Timeline } from '../components/ui/timeline';
import { motion, AnimatePresence } from 'framer-motion';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-neutral-200 last:border-none">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="font-medium text-neutral-900 text-lg group-hover:text-blue-600 transition-colors">{question}</span>
        <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-neutral-600 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [idea, setIdea] = useState("");
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      navigate('/register', { state: { initialIdea: idea } });
    }
  };

  const timelineData = [
    {
      title: "Mai 2026",
      content: (
        <div>
          <p className="text-neutral-600 text-sm md:text-base font-normal mb-8">
            Expansion des capacités de l'IA avec des agents autonomes pour la recherche approfondie.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Agents de Recherche</h4>
              <p className="text-sm text-neutral-500">Des agents autonomes qui naviguent sur le web pour valider vos hypothèses.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Prototypage Rapide</h4>
              <p className="text-sm text-neutral-500">Génération automatique de wireframes à partir de vos descriptions textuelles.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Avril 2026",
      content: (
        <div>
          <p className="text-neutral-600 text-sm md:text-base font-normal mb-8">
            Intégration de nouveaux outils financiers et juridiques pour structurer votre startup.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Assistant Juridique</h4>
              <p className="text-sm text-neutral-500">Génération de statuts et de pactes d'associés conformes.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Mars 2026",
      content: (
        <div>
          <p className="text-neutral-600 text-sm md:text-base font-normal mb-8">
            Lancement de nouvelles fonctionnalités d'analyse et de présentation pour accélérer votre go-to-market.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Analyse de Marché IA</h4>
              <p className="text-sm text-neutral-500">Calcul automatique du TAM/SAM/SOM et recherche de concurrents en temps réel.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <Presentation className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Générateur de Pitch Deck</h4>
              <p className="text-sm text-neutral-500">Transformez votre canvas en une présentation structurée prête pour les investisseurs.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Février 2026",
      content: (
        <div>
          <p className="text-neutral-600 text-sm md:text-base font-normal mb-8">
            Amélioration de l'expérience de collaboration en temps réel et de l'interface du canvas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <LayoutDashboard className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Canvas Interactif</h4>
              <p className="text-sm text-neutral-500">Déplacez, redimensionnez et organisez vos idées visuellement sur un tableau infini.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Chat Contextuel</h4>
              <p className="text-sm text-neutral-500">Discutez avec votre co-fondateur IA directement depuis votre espace de travail.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Janvier 2026",
      content: (
        <div>
          <p className="text-neutral-600 text-sm md:text-base font-normal mb-4">
            Lancement initial de Uprising Cofounder.
          </p>
          <div className="mb-8 space-y-3">
            <div className="flex gap-3 items-center text-neutral-700 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">🚀</div>
              Lancement de la plateforme de base
            </div>
            <div className="flex gap-3 items-center text-neutral-700 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">🧠</div>
              Intégration de Gemini Pro pour l'analyse d'idées
            </div>
            <div className="flex gap-3 items-center text-neutral-700 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">🔒</div>
              Système d'authentification sécurisé
            </div>
          </div>
        </div>
      ),
    },
  ];

  const faqs = [
    {
      question: "Qu'est-ce que Uprising Cofounder ?",
      answer: "Uprising Cofounder est une plateforme assistée par IA qui aide les entrepreneurs à transformer une simple idée en un projet de startup concret. Nous fournissons des outils pour l'analyse de marché, la création de pitch decks et la structuration de business models."
    },
    {
      question: "Est-ce que mes idées sont protégées ?",
      answer: "Absolument. La confidentialité est notre priorité. Vos projets sont privés par défaut et nous n'utilisons pas vos données spécifiques pour entraîner nos modèles publics sans votre consentement explicite."
    },
    {
      question: "Puis-je collaborer avec mon équipe ?",
      answer: "Oui ! La plateforme est conçue pour la collaboration en temps réel. Vous pouvez inviter vos co-fondateurs sur votre canvas et travailler ensemble simultanément."
    },
    {
      question: "Quel est le coût du service ?",
      answer: "Nous proposons une version gratuite pour démarrer et valider vos premières idées. Des plans premium sont disponibles pour les équipes qui ont besoin de fonctionnalités avancées d'export et d'analyse approfondie."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden font-sans">
      {/* Dotted background */}
      <div 
        className="absolute inset-0 z-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 md:py-6">
        <div className="flex items-center">
          <div className="text-blue-600 flex items-center gap-2">
            <Hexagon className="w-8 h-8 fill-current" />
            <span className="font-bold text-xl tracking-tight text-neutral-900">Cofounder</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <button onClick={() => navigate('/documentation')} className="hover:text-blue-600 transition-colors">Documentation</button>
          <button onClick={() => navigate('/our-story')} className="hover:text-blue-600 transition-colors">Notre histoire</button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
          >
            Se connecter
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-sm"
          >
            S'inscrire
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center mt-[-5vh] mb-20">
        
        <Hero>
          <div className="w-full flex flex-col items-center">
            <form onSubmit={handleSubmit} className="relative w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-neutral-200 p-2 flex items-center transition-shadow focus-within:shadow-[0_8px_30px_rgb(37,99,235,0.1)] focus-within:border-blue-300">
              <input
                type="text"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Je veux ouvrir un café de spécialité..."
                className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-lg text-neutral-800 placeholder:text-neutral-400"
              />
              <button 
                type="submit"
                disabled={!idea.trim()}
                className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mr-1 shadow-sm"
              >
                <ArrowUp className="w-6 h-6" />
              </button>
            </form>

            <div className="flex items-center justify-between mt-6 px-2 w-full">
              <button 
                type="button"
                onClick={() => navigate('/flash-demo')}
                className="flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm hover:border-neutral-300"
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Brainstorming d'idées
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-neutral-400" />
                  Mode privé
                </span>
                <button 
                  type="button"
                  onClick={() => setPrivacyMode(!privacyMode)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${privacyMode ? 'bg-blue-600' : 'bg-neutral-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${privacyMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        </Hero>

      </main>

      {/* Changelog Section */}
      <section className="relative z-10 w-full bg-white border-t border-neutral-200 py-20">
        <div className="container mx-auto px-6 mb-12 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Évolution du Produit</h2>
          <p className="text-neutral-500 max-w-2xl mx-auto">
            Nous construisons l'avenir de l'entrepreneuriat, une fonctionnalité à la fois.
            Découvrez nos dernières mises à jour.
          </p>
        </div>
        <Timeline data={timelineData} />
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 w-full bg-slate-50 border-t border-neutral-200 py-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Questions Fréquentes</h2>
            <p className="text-neutral-500">Tout ce que vous devez savoir pour démarrer.</p>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white border-t border-neutral-200 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Hexagon className="w-6 h-6 text-blue-600 fill-current" />
                <span className="font-bold text-lg text-neutral-900">Cofounder</span>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Votre co-fondateur IA pour transformer vos idées en startups à succès.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Tarifs</a></li>
                <li><button onClick={() => navigate('/documentation')} className="hover:text-blue-600 transition-colors">Documentation</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><button onClick={() => navigate('/our-story')} className="hover:text-blue-600 transition-colors">Notre histoire</button></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <p>© 2026 Uprising Cofounder. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-neutral-900 transition-colors">Twitter</a>
              <a href="#" className="hover:text-neutral-900 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-neutral-900 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
