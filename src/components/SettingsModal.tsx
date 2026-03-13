import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, token, updateUser } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('light');
  const [defaultMode, setDefaultMode] = useState('create');
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState({
    gemini_api_key: '',
    bland_api_key: '',
    elevenlabs_api_key: '',
    twenty_api_key: '',
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setNotifications(user.notifications_enabled === 1);
      setTheme(user.theme || 'light');
      setDefaultMode(user.default_mode || 'create');
      
      setApiKeys({
        gemini_api_key: user.gemini_api_key || '',
        bland_api_key: user.bland_api_key || '',
        elevenlabs_api_key: user.elevenlabs_api_key || '',
        twenty_api_key: user.twenty_api_key || '',
        twilio_account_sid: user.twilio_account_sid || '',
        twilio_auth_token: user.twilio_auth_token || '',
        twilio_phone_number: user.twilio_phone_number || ''
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          notifications_enabled: notifications, 
          theme, 
          default_mode: defaultMode,
          ...apiKeys
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        onClose();
      }
    } catch (error) {
      console.error('Failed to save settings', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="flex justify-between items-center p-6 border-b border-neutral-100">
          <h2 className="text-xl font-semibold text-neutral-900">Paramètres</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-neutral-900">Notifications</h3>
              <p className="text-xs text-neutral-500">Recevoir des mises à jour et alertes par email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E8794A]"></div>
            </label>
          </div>

          {/* Theme */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-3">Thème</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setTheme('light')}
                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${theme === 'light' ? 'border-[#E8794A] bg-[#E8794A]/5 text-[#E8794A]' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
              >
                Mode Clair
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${theme === 'dark' ? 'border-[#E8794A] bg-[#E8794A]/5 text-[#E8794A]' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
              >
                Mode Sombre
              </button>
            </div>
          </div>

          {/* Default Mode */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-3">Mode de projet par défaut</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setDefaultMode('create')}
                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${defaultMode === 'create' ? 'border-[#E8794A] bg-[#E8794A]/5 text-[#E8794A]' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
              >
                🌱 Créer
              </button>
              <button 
                onClick={() => setDefaultMode('scale')}
                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${defaultMode === 'scale' ? 'border-[#E8794A] bg-[#E8794A]/5 text-[#E8794A]' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
              >
                🚀 Scaler
              </button>
            </div>
          </div>

          <hr className="border-neutral-100" />
          
          {/* API Keys */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-3">Clés d'API & Intégrations</h3>
            <p className="text-xs text-neutral-500 mb-4">Ces clés seront utilisées par votre assistant IA pour les automatisations et générations. Elles sont stockées de manière sécurisée.</p>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {[
                { id: 'gemini_api_key', label: 'Google Gemini API Key', placeholder: 'AIzaSy...' },
                { id: 'bland_api_key', label: 'Bland AI API Key', placeholder: 'sk-...' },
                { id: 'elevenlabs_api_key', label: 'ElevenLabs API Key', placeholder: 'sk_...' },
                { id: 'twenty_api_key', label: 'Twenty CRM API Key', placeholder: '...' },
                { id: 'twilio_account_sid', label: 'Twilio Account SID', placeholder: 'AC...' },
                { id: 'twilio_auth_token', label: 'Twilio Auth Token', placeholder: '...' },
                { id: 'twilio_phone_number', label: 'Twilio Phone Number', placeholder: '+1234567890' }
              ].map(field => (
                <div key={field.id}>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">{field.label}</label>
                  <input
                    type="password"
                    placeholder={field.placeholder}
                    value={apiKeys[field.id as keyof typeof apiKeys]}
                    onChange={e => setApiKeys({...apiKeys, [field.id]: e.target.value})}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8794A] focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-[#E8794A] text-white rounded-lg hover:bg-[#d66b3d] transition-colors disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
