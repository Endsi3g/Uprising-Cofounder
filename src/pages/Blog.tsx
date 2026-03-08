import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Blog() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-neutral-800">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button 
          onClick={() => navigate('/')}
          title="Retour à l'accueil"
          className="flex items-center text-sm text-neutral-500 hover:text-neutral-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </button>

        <h1 className="text-4xl font-bold mb-8">Blog & Actualités</h1>
        
        <div className="grid gap-8">
          <article className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-sm text-blue-600 font-semibold mb-2">Mise à jour Produit</div>
            <h2 className="text-2xl font-bold mb-3">Lancement de la version 2.0 !</h2>
            <p className="text-neutral-600 mb-4 leading-relaxed">
              Nous sommes ravis de vous présenter la toute nouvelle version d'Uprising Cofounder. 
              Des temps de génération plus rapides, un canevas temps-réel, un éditeur de notes plus intelligent, et bien plus encore.
            </p>
            <div className="text-xs text-neutral-400">9 Mars 2026</div>
          </article>

          <article className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-sm text-emerald-600 font-semibold mb-2">Entrepreneuriat</div>
            <h2 className="text-2xl font-bold mb-3">Comment structurer votre Pitch Deck</h2>
            <p className="text-neutral-600 mb-4 leading-relaxed">
              Un bon pitch deck est essentiel pour convaincre les investisseurs. Découvrez comment notre IA peut vous aider à construire une présentation optimale et structurer vos projections de revenus.
            </p>
            <div className="text-xs text-neutral-400">1 Février 2026</div>
          </article>
        </div>
      </div>
    </div>
  );
}
