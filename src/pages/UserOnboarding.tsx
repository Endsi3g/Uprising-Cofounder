import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function UserOnboarding() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token, checkAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await fetch("/api/users/onboarding", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, role, goal })
      });
      
      await checkAuth(); // Refresh user data to get onboarding_completed = 1
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de l'onboarding", error);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    "Fondateur / CEO",
    "Développeur",
    "Designer",
    "Marketing / Ventes",
    "Étudiant",
    "Autre"
  ];

  const goals = [
    "Lancer ma première startup",
    "Accélérer la croissance de mon entreprise",
    "Trouver des idées de projets",
    "Explorer les possibilités de l'IA",
    "Autre"
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-neutral-900">Bienvenue sur Uprising Cofounder</h1>
          <p className="text-neutral-500 text-sm mt-2">Apprenons à nous connaître pour mieux vous accompagner.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Comment vous appelez-vous ?</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              placeholder="Votre prénom"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Quel est votre rôle principal ?</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-3 py-2 text-sm rounded-lg border text-left transition-colors ${role === r ? 'border-blue-600 bg-blue-600/5 text-blue-600 font-medium' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Quel est votre objectif principal ?</label>
            <div className="space-y-2">
              {goals.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={`w-full px-4 py-3 text-sm rounded-lg border text-left transition-colors ${goal === g ? 'border-blue-600 bg-blue-600/5 text-blue-600 font-medium' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name || !role || !goal || loading}
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? "Enregistrement..." : "Commencer l'aventure"}
          </button>
        </form>
      </div>
    </div>
  );
}
