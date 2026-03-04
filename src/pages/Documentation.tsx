import React from 'react';
import { ArrowLeft, Book, FileText, Code, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Documentation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-neutral-100 rounded-full text-neutral-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-xl text-neutral-900">Documentation</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <section>
            <h1 className="text-4xl font-bold text-neutral-900 mb-6">Guide de Démarrage</h1>
            <p className="text-lg text-neutral-600 leading-relaxed mb-8">
              Bienvenue dans la documentation de Uprising Cofounder. Apprenez à utiliser nos outils d'IA pour transformer vos idées en startups viables.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <Book className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Premiers Pas</h3>
                <p className="text-neutral-500 text-sm mb-4">Configurez votre compte et créez votre premier projet en quelques minutes.</p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center gap-2">• Création de compte</li>
                  <li className="flex items-center gap-2">• Configuration du profil</li>
                  <li className="flex items-center gap-2">• Premier canvas</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                  <Terminal className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Outils IA</h3>
                <p className="text-neutral-500 text-sm mb-4">Maîtrisez nos outils d'analyse et de génération.</p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center gap-2">• Analyse de marché</li>
                  <li className="flex items-center gap-2">• Générateur de Pitch Deck</li>
                  <li className="flex items-center gap-2">• Chat avec le co-fondateur</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="prose prose-neutral max-w-none">
            <h2>Concepts Clés</h2>
            <h3>Le Canvas Infini</h3>
            <p>
              Votre espace de travail principal est un canvas infini. Vous pouvez y déposer des notes, des images, des liens et générer du contenu via l'IA.
              Utilisez la molette de la souris pour zoomer/dézoomer et maintenez le clic pour vous déplacer.
            </p>
            
            <h3>Cartes Intelligentes</h3>
            <p>
              Chaque élément sur le canvas est une "carte". Les cartes peuvent être :
            </p>
            <ul>
              <li>Des notes textuelles simples</li>
              <li>Des images uploadées</li>
              <li>Des analyses générées par l'IA</li>
              <li>Des tâches à accomplir</li>
            </ul>

            <h3>Collaboration Temps Réel</h3>
            <p>
              Invitez votre équipe à rejoindre votre projet. Toutes les modifications sont synchronisées instantanément.
              Vous pouvez voir les curseurs de vos collaborateurs et discuter via le chat intégré.
            </p>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
