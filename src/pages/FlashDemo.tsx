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

        // Manually set auth state (hacky but works if AuthContext exposes setToken/setUser, 
        // but here we might need to just use the login function if it accepts token, 
        // or just rely on the fact that we have the token and can reload or use the context's login method if it supports it.
        // Looking at AuthContext usually it takes email/pass. 
        // Let's use the login method from useAuth if it does the API call, but we already did it.
        // We need to store the token in localStorage so AuthContext picks it up on mount/update.
        
        localStorage.setItem('token', token);
        // We force a reload to pick up the auth state or we need to update the context.
        // Since we can't easily access the context setter from here without modifying AuthContext, 
        // a full reload or redirecting to a route that checks auth is best. 
        // But wait, we are already in the app.
        
        // Let's try to use the `login` function from context if it supports passing data, 
        // but usually it takes credentials.
        // We will just reload the page to /project/new-demo
        
        // Actually, we can just call the create project API with the token we have.
        
        setStatus('Création du projet Audit...');
        const projRes = await fetch('/api/projects', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                name: "Audit Flash - Salon", 
                description: "Audit de croissance en direct",
                mode: "scale" // or create
            })
        });
        
        if (!projRes.ok) {
            const errData = await projRes.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to create project");
        }
        
        const project = await projRes.json();
        
        // Send initial message to trigger the "Audit" persona
        await fetch(`/api/projects/${project.id}/messages`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                role: 'user',
                content: "Je suis au salon, fais-moi une démo flash. Audite mon business (je vais te le décrire). Commence par me demander ce que je fais."
            })
        });

        // Redirect to project
        // We need to ensure the app knows we are logged in.
        // Writing to localStorage and reloading to the project URL is the safest bet for the AuthContext to pick it up.
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
