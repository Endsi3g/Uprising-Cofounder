import React, { useState } from 'react';
import { X, Copy, Check, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="relative p-6 text-center">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-blue-600" />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Débloquez l'offre Agence
              </h2>
              <p className="text-neutral-600 mb-6">
                Partagez l'application avec vos amis pour obtenir un accès exclusif à nos fonctionnalités avancées et une offre spéciale pour votre agence.
              </p>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-6 flex items-center justify-between gap-2">
                <code className="text-sm font-mono text-neutral-800 truncate flex-1 text-left">
                  {referralLink}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-white rounded-md transition-colors border border-transparent hover:border-neutral-200 shadow-sm"
                  title="Copier le lien"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-neutral-500" />
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCopy}
                  className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copier mon lien de parrainage
                </button>
                <p className="text-xs text-neutral-400">
                  Invitez 3 amis pour débloquer toutes les fonctionnalités.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
