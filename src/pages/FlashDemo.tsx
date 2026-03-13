import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function FlashDemo() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('Initialisation du mode démo...');

  useEffect(() => {
    const setupDemo = async () => {
      try {
        // 1. Create/Login Guest User
        const guestEmail = `guest_${Date.now()}@uprising.demo`;
        const guestPassword = 'demo_password_123';

        setStatus('Création du profil invité...');
        
        // Register
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: guestEmail, password: guestPassword })
        });

        let token;
        let user;

        if (regRes.ok) {
            const data = await regRes.json();
            token = data.token;
            user = data.user;
        } else {
            // Fallback login if collision (unlikely)
            const loginRes = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: guestEmail, password: guestPassword })
            });
            const data = await loginRes.json();
            token = data.token;
            user = data.user;
        }
        
        localStorage.setItem('token', token);
        
        setStatus('Création du projet Audit...');
        const projRes = await fetch('/api/projects', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                name: "Business Plan (Généré par IA)", 
                description: "Plan de lancement complet",
                mode: "create"
            })
        });
        
        if (!projRes.ok) {
            const errData = await projRes.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to create project");
        }
        
        const project = await projRes.json();
        
        setStatus('Génération du plan de business complet...');

        // Send initial message to trigger the creation of a full business plan
        await fetch(`/api/projects/${project.id}/messages`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                role: 'user',
                content: "Génère un plan de business complet étape par étape pour une nouvelle startup Tech, et crée immédiatement les cartes correspondantes dans le canvas pour les phases 1 (Idéation), 2 (Produit), 3 (Marketing) et 4 (GTM)."
            })
        });

        // Redirect to project
        window.location.href = `/project/${project.id}?demo=true`;

      } catch (error) {
        console.error("Demo setup failed", error);
        setStatus("Erreur lors de l'initialisation.");
      }
    };

    setupDemo();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <h2 className="text-xl font-bold text-neutral-800">{status}</h2>
    </div>
  );
}
