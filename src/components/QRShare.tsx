import React, { useState } from 'react';
import { Share2, Copy, Check, QrCode, X, ExternalLink } from 'lucide-react';

interface QRShareProps {
  appUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRShare({ appUrl, isOpen, onClose }: QRShareProps) {
  const [copied, setCopied] = useState(false);

  // Fallback if appUrl is not set or empty
  const shareDestination = appUrl || window.location.href;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareDestination)}&color=0f172a&bgcolor=f8fafc`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareDestination);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  return (
    <>
      {/* 1. Modal Dialog rendering */}
      {isOpen && (
        <div id="qr-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div id="qr-modal-card" className="relative w-full max-w-md overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#1E293B] p-6 shadow-2xl text-center">
            
            {/* Header close */}
            <button 
              id="qr-close-button"
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
              <QrCode className="h-6 w-6 stroke-[2]" />
            </div>

            <h3 className="mt-4 font-display text-xl font-bold text-white">Peer-to-Peer Invite</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
              Ask your friend or classmate to scan this target with their phone camera to open ScholarStep directly!
            </p>

            {/* QR Target Container */}
            <div id="qr-target-container" className="mx-auto my-6 flex h-48 w-48 items-center justify-center rounded-xl bg-white p-3 shadow-md border-4 border-indigo-500/20">
              <img 
                src={qrImageSrc} 
                alt="ScholarStep QR invite link" 
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Target Address Display */}
            <div className="rounded-lg bg-slate-950 p-3 flex items-center justify-between border border-slate-800 gap-2 mb-2">
              <span className="text-left text-xs font-mono text-slate-300 truncate max-w-[240px]">
                {shareDestination}
              </span>
              <button
                _id="qr-modal-copy-btn"
                onClick={copyToClipboard}
                className="shrink-0 flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <a 
              href={shareDestination}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              <span>Visit direct link</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}

// 2. Dash Board Compact Info Card Widget representing the P2P system
export function QRShareDashboardCard({ appUrl, onOpenModal }: { appUrl: string; onOpenModal: () => void }) {
  const shareDestination = appUrl || window.location.href;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareDestination)}&color=0f172a&bgcolor=f8fafc`;

  return (
    <div id="qr-dashboard-card" className="flex flex-col md:flex-row items-center gap-6 rounded-2xl border border-indigo-500/25 bg-[#1E293B] p-6 shadow-lg">
      <div className="shrink-0 flex h-36 w-36 items-center justify-center rounded-xl bg-white p-2.5 shadow-sm border border-slate-700/50">
        <img 
          src={qrImageSrc} 
          alt="ScholarStep Invite Link" 
          className="h-full w-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="flex-1 text-center md:text-left">
        <span className="font-display text-xs font-semibold uppercase tracking-wider text-teal-400">Classroom Peer Invite</span>
        <h4 className="mt-1 font-display text-lg font-bold text-white">Share ScholarStep with Friends</h4>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-md">
          Collaborating is the best way to conquer difficult study material. Point any phone camera here to download the study suite instantly.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-2">
          <button
            id="share-open-modal-idx"
            onClick={onOpenModal}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Open Large Share Target</span>
          </button>
        </div>
      </div>
    </div>
  );
}
