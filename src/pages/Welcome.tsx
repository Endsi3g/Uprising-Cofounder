import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="max-w-md w-full text-center relative z-10">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-neutral-200 flex items-center justify-center mx-auto mb-8">
          <img 
            src="/logo.png" 
            alt="Uprising Studio" 
            className="w-14 h-14 object-contain" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling!.classList.remove('hidden');
              e.currentTarget.nextElementSibling!.classList.add('flex');
            }}
          />
          <div className="hidden w-full h-full items-center justify-center text-2xl font-bold text-blue-600 bg-white rounded-3xl">US</div>
        </div>
        
        <h1 className="text-4xl font-bold text-neutral-900 mb-4 tracking-tight">
          Bienvenue sur <span className="text-blue-600">Cofounder</span>
        </h1>
        
        <p className="text-lg text-neutral-600 mb-10 leading-relaxed">
          Votre co-fondateur IA pour structurer, développer et scaler votre projet. De l'idée à l'exécution.
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => navigate('/register')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-4 px-6 font-medium text-lg hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            <Sparkles className="w-5 h-5" />
            Commencer l'aventure
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 bg-white text-neutral-700 border border-neutral-200 rounded-xl py-4 px-6 font-medium text-lg hover:bg-neutral-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            J'ai déjà un compte
          </button>

          <button 
            onClick={() => navigate('/flash-demo')}
            className="w-full text-sm text-neutral-500 hover:text-neutral-800 underline decoration-dotted underline-offset-4 transition-colors pt-4"
          >
            Mode Démo Salon (Flash)
          </button>
        </div>
      </div>
    </div>
  );
}
