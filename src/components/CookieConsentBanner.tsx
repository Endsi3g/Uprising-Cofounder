import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_analytics', 'true');
    localStorage.setItem('cookie_marketing', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    localStorage.setItem('cookie_analytics', 'false');
    localStorage.setItem('cookie_marketing', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-600/10 rounded-lg hidden md:block">
            <Cookie className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-1">Nous respectons votre vie privée</h3>
            <p className="text-sm text-neutral-600 max-w-2xl">
              Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. 
              Conformément aux réglementations canadiennes, vous avez le contrôle sur vos données.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleDecline}
            className="flex-1 md:flex-none px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Refuser
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Accepter tout
          </button>
          <button 
            onClick={() => setIsVisible(false)} 
            className="p-2 text-neutral-400 hover:text-neutral-600 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
