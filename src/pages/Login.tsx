import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();
  const { login, skipLogin, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(mfaRequired ? '/api/auth/login-mfa' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mfaRequired ? { userId, token: mfaToken } : { email, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      if (data.mfa_required) {
        setMfaRequired(true);
        setUserId(data.userId);
        return;
      }

      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
        <h1 className="text-2xl font-semibold text-neutral-900 text-center mb-6">Bon retour</h1>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!mfaRequired ? (
            <>
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
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">Mot de passe</label>
                <input
                  id="password"
                  title="Mot de passe"
                  placeholder="Votre mot de passe"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="mfaToken" className="block text-sm font-medium text-neutral-700 mb-1">Code d'authentification (MFA)</label>
              <input
                id="mfaToken"
                title="Code d'authentification"
                type="text"
                required
                value={mfaToken}
                onChange={e => setMfaToken(e.target.value)}
                placeholder="123456"
                className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-neutral-200" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-neutral-400">Ou accès rapide</span></div>
        </div>

        <button
          onClick={() => {
            skipLogin();
            navigate('/');
          }}
          className="w-full border border-neutral-200 text-neutral-600 rounded-lg py-2 font-medium hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 mb-4"
        >
          Accès Développeur (Skip Login)
        </button>

        <div className="mt-6 text-center text-sm text-neutral-500 space-y-2">
          <p>
            Pas encore de compte ? <Link to="/register" className="text-blue-600 hover:underline">S'inscrire</Link>
          </p>
          <p>
            Mot de passe oublié ? <Link to="/forgot-password" className="text-blue-600 hover:underline">Le réinitialiser</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
