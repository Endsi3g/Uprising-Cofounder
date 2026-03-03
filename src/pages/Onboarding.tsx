import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Onboarding() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { token } = useAuth();

  const handleSelect = async (mode: "create" | "scale") => {
    setLoading(true);
    try {
      if (projectId) {
        await fetch(`/api/projects/${projectId}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ mode }),
        });
        navigate(`/project/${projectId}`);
      } else {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F1] flex items-center justify-center px-8">
      <div className="w-full max-w-[720px]">
        <h1 className="text-3xl font-semibold text-neutral-900 text-center mb-3">
          Où en es-tu ?
        </h1>
        <p className="text-neutral-500 text-center mb-10 text-sm">
          Uprising Cofounder adapte son accompagnement selon ta situation
        </p>
        
        <div className="grid grid-cols-2 gap-5">
          {/* Mode A */}
          <button
            onClick={() => handleSelect('create')}
            onMouseEnter={() => setHovered('create')}
            onMouseLeave={() => setHovered(null)}
            disabled={loading}
            className={`
              text-left p-7 rounded-2xl border-2 transition-all duration-200 disabled:opacity-50 relative
              ${hovered === 'create' 
                ? 'border-[#E8794A] shadow-[0_8px_30px_rgba(232,121,74,0.15)] bg-white' 
                : 'border-neutral-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]'}
            `}
          >
            {loading && hovered === 'create' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-2xl z-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#E8794A]" />
              </div>
            )}
            <div className="text-3xl mb-4">🌱</div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              Je n'ai pas encore d'entreprise
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              J'ai une idée ou je cherche à en valider une. Je veux savoir si ça vaut la peine de me lancer.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Valider une idée', 'Trouver un marché', 'Premiers clients'].map(tag => (
                <span key={tag} className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </button>

          {/* Mode B */}
          <button
            onClick={() => handleSelect('scale')}
            onMouseEnter={() => setHovered('scale')}
            onMouseLeave={() => setHovered(null)}
            disabled={loading}
            className={`
              text-left p-7 rounded-2xl border-2 transition-all duration-200 disabled:opacity-50 relative
              ${hovered === 'scale' 
                ? 'border-[#E8794A] shadow-[0_8px_30px_rgba(232,121,74,0.15)] bg-white' 
                : 'border-neutral-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]'}
            `}
          >
            {loading && hovered === 'scale' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-2xl z-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#E8794A]" />
              </div>
            )}
            <div className="text-3xl mb-4">🚀</div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              J'ai déjà une entreprise
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Mon business existe déjà. Je veux scaler, optimiser mes opérations ou identifier de nouvelles opportunités.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Scaler le revenu', "Optimiser l'offre", 'Trouver des leviers'].map(tag => (
                <span key={tag} className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </button>
        </div>
        
        <p className="text-center text-xs text-neutral-400 mt-6">
          Tu pourras changer de mode à tout moment dans les paramètres du projet
        </p>
      </div>
    </div>
  );
}
