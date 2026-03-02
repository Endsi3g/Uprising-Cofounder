import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setSuccess('Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F1] flex items-center justify-center px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
        <h1 className="text-2xl font-semibold text-neutral-900 text-center mb-6">Réinitialiser le mot de passe</h1>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8794A] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nouveau mot de passe</label>
            <input 
              type="password" 
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8794A] focus:border-transparent"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-[#E8794A] text-white rounded-lg py-2 font-medium hover:bg-[#d66b3d] transition-colors"
          >
            Réinitialiser
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-neutral-500">
          <p>
            Vous vous souvenez de votre mot de passe ? <Link to="/login" className="text-[#E8794A] hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
