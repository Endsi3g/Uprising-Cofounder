import React, { useState } from 'react';
import { Phone, User, Calendar, Briefcase, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const agents = [
  {
    id: 'sophie',
    name: 'Sophie',
    role: 'Réceptionniste',
    description: 'Gère les appels entrants, répond aux questions fréquentes et transfère les appels.',
    icon: User,
    color: 'bg-blue-100 text-blue-600',
    voice: 'ElevenLabs - Française'
  },
  {
    id: 'julie',
    name: 'Julie',
    role: 'Suivi Client & RDV',
    description: 'Spécialiste de la prise de rendez-vous et du suivi de satisfaction client.',
    icon: Calendar,
    color: 'bg-purple-100 text-purple-600',
    voice: 'ElevenLabs - Québécoise'
  },
  {
    id: 'marc',
    name: 'Marc',
    role: 'Prospection',
    description: 'Qualifie les leads sortants et détecte les opportunités commerciales.',
    icon: Briefcase,
    color: 'bg-green-100 text-green-600',
    voice: 'ElevenLabs - Masculin'
  }
];

export default function VoiceDemo() {
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setLoading(true);
    setStatus('Initialisation de l\'appel...');

    try {
      const response = await fetch('/api/demo/voice-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming user is logged in or we allow public demo
        },
        body: JSON.stringify({
          phoneNumber,
          agentId: selectedAgent.id,
          task: `You are ${selectedAgent.name}, a ${selectedAgent.role}. Call this potential client and demonstrate your capabilities.`
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus(`Appel lancé ! (${data.message || 'Succès'})`);
      } else {
        setStatus('Erreur lors du lancement de l\'appel.');
      }
    } catch (error) {
      setStatus('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F1] p-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-neutral-500 hover:text-neutral-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">Uprising AI Voice Agency</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Découvrez nos agents IA vocaux capables de gérer vos appels entrants et sortants avec une fluidité humaine.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                selectedAgent.id === agent.id
                  ? 'border-[#E8794A] bg-white shadow-lg scale-[1.02]'
                  : 'border-transparent bg-white/50 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl ${agent.color} flex items-center justify-center mb-4`}>
                <agent.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-1">{agent.name}</h3>
              <p className="text-sm font-medium text-[#E8794A] mb-2">{agent.role}</p>
              <p className="text-sm text-neutral-500 mb-4">{agent.description}</p>
              <div className="text-xs font-mono bg-neutral-100 px-2 py-1 rounded inline-block text-neutral-600">
                Voix: {agent.voice}
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-200 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#E8794A]" />
            Tester une démo live
          </h2>

          <form onSubmit={handleCall} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#E8794A] focus:ring-2 focus:ring-[#E8794A]/20 outline-none transition-all"
                required
              />
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl text-sm text-neutral-600 mb-4">
              Agent sélectionné : <span className="font-bold text-neutral-900">{selectedAgent.name}</span>
              <br />
              Scénario : Démonstration des capacités de réceptionniste IA.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#141414] text-white py-4 rounded-xl font-medium hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Appel en cours...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  M'appeler maintenant
                </>
              )}
            </button>

            {status && (
              <p className={`text-center text-sm ${status.includes('Erreur') ? 'text-red-500' : 'text-green-600'}`}>
                {status}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
