import React from 'react';
import { Lock, MessageCircle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { buildWhatsAppPurchaseLink } from '../utils/examoraLogic';

interface PaidAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  itemCategory: string;
  itemType?: 'Paid Note' | 'Paid Study PDF' | 'Paid Past Paper';
  whatsappNumber: string;
}

export const PaidAccessModal: React.FC<PaidAccessModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  itemCategory,
  itemType = 'Paid Note',
  whatsappNumber,
}) => {
  if (!isOpen) return null;

  const waInfo = buildWhatsAppPurchaseLink(whatsappNumber, itemTitle, itemType);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paid-access-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#091D49]/70 backdrop-blur-xs animate-fadeIn"
    >
      <div className="examora-card max-w-md w-full overflow-hidden border-2 border-[#EAB52F] shadow-2xl">
        {/* Top Navy Header */}
        <div className="bg-gradient-to-r from-[#123675] to-[#091D49] px-6 py-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#EAB52F]/20 border border-[#EAB52F] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#EAB52F]" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider uppercase text-[#EAB52F]">
                Protected Study Resource
              </p>
              <h2
                id="paid-access-modal-title"
                className="font-serif-heading text-lg font-bold text-[#FFFDFA]"
              >
                Premium Access Required
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-white/75 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 bg-[#FFFDFA]">
          <div className="p-4 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] space-y-1">
            <p className="text-xs font-semibold text-[#687080]">
              {itemCategory} · {itemType}
            </p>
            <p className="font-serif-heading text-base font-bold text-[#17233B]">
              {itemTitle}
            </p>
          </div>

          <p className="text-sm text-[#17233B] leading-relaxed">
            This study document is part of the <strong>EXAMORA PAKISTAN</strong> premium
            preparation library and is protected by server-side access verification. To
            unlock and receive full access to this material, contact our academic desk on
            WhatsApp with the prefilled request below.
          </p>

          <ul className="space-y-2 text-xs text-[#687080]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#123675] shrink-0" />
              <span>Instant verification by the EXAMORA PAKISTAN academic team</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#123675] shrink-0" />
              <span>Complete syllabus-aligned notes & solved examination outlines</span>
            </li>
          </ul>

          {waInfo.valid ? (
            <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={waInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full examora-btn-gold py-3 px-5 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 text-center"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Request Access on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-[#E6E0D5] text-xs font-bold text-[#687080] hover:text-[#17233B] hover:bg-[#FBF6EC] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-amber-900">
                <p className="font-bold">Purchase Contact Not Configured</p>
                <p>{waInfo.fallbackMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
