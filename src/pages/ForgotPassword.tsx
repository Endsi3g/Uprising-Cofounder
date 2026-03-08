import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(data.message || 'Lien de réinitialisation envoyé.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
        <h1 className="text-2xl font-semibold text-neutral-900 text-center mb-6">Mot de passe oublié</h1>
        <p className="text-sm text-neutral-500 text-center mb-6">Entrez votre email pour recevoir un lien de réinitialisation.</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input 
              id="email"
              title="Email"
              placeholder="votre@email.com"
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-neutral-500">
          <p>
            <Link to="/login" className="text-blue-600 hover:underline">Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
