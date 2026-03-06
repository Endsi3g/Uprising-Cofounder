import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md"
            >
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20"
                >
                    <Compass className="w-10 h-10 text-white" />
                </motion.div>

                <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                    404
                </h1>
                <h2 className="text-2xl font-semibold text-white mb-3">
                    Page introuvable
                </h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    On dirait que cette page n'existe pas encore. Retournez au tableau de bord pour continuer à construire votre projet.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 transition-all duration-200 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-blue-500/20 cursor-pointer"
                    >
                        Tableau de bord
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
