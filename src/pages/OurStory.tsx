import React from 'react';
import { ArrowLeft, Users, Target, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function OurStory() {
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
            <span className="font-bold text-xl text-neutral-900">Notre Histoire</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          <section className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
              Démocratiser l'Entrepreneuriat
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Nous croyons que chaque idée mérite une chance d'être explorée, validée et construite, sans barrières techniques ou financières.
            </p>
          </section>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center space-y-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Mission</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Fournir à chaque entrepreneur un co-fondateur IA capable d'analyser, de conseiller et d'exécuter.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center space-y-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Vision</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Un monde où la création de startup est accessible à tous, guidée par des données et l'intelligence artificielle.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Valeurs</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Transparence, innovation radicale et focus utilisateur sont au cœur de tout ce que nous construisons.
              </p>
            </div>
          </div>

          <section className="prose prose-lg prose-neutral mx-auto">
            <h3>L'Origine</h3>
            <p>
              Uprising Cofounder est né d'un constat simple : trop d'excellentes idées meurent dans des carnets de notes, faute de savoir par où commencer. 
              Les fondateurs passent des mois à chercher des associés, à valider leur marché ou à créer des pitch decks, souvent sans retour concret.
            </p>
            <p>
              En 2024, nous avons décidé de changer cela. En combinant les dernières avancées en IA générative (Gemini) avec une interface de collaboration intuitive, 
              nous avons créé un outil qui agit comme un véritable partenaire de réflexion.
            </p>
            
            <h3>Aujourd'hui</h3>
            <p>
              Nous aidons des milliers d'entrepreneurs à structurer leur pensée, analyser leur concurrence et préparer leurs levées de fonds. 
              Notre plateforme évolue chaque semaine avec de nouvelles fonctionnalités basées sur les retours de notre communauté.
            </p>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
