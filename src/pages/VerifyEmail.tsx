import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage("Jeton manquant.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        
        setStatus('success');
        setMessage(data.message || 'Email vérifié avec succès.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Vérification de l'email</h1>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-neutral-500">Vérification en cours...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {message}
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
            {message}
          </div>
        )}

        <div>
          <Link to="/login" className="inline-block bg-blue-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-blue-700 transition-colors">
            Aller à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
