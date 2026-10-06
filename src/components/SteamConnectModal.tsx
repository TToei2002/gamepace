'use client';

import React, { useState } from 'react';
import { X, Link2, CheckCircle2, Sparkles } from 'lucide-react';
import { SteamIcon } from './SteamIcon';

interface SteamConnectModalProps {
  isOpen: boolean;
  currentSteamId?: string | null;
  onClose: () => void;
  onSaveSteamId: (input: string) => Promise<void>;
}

export function SteamConnectModal({
  isOpen,
  currentSteamId,
  onClose,
  onSaveSteamId,
}: SteamConnectModalProps) {
  const [input, setInput] = useState(currentSteamId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await onSaveSteamId(input.trim());
      setSuccessMsg('ผูก Steam ID และบันทึกข้อมูลเรียบร้อยแล้ว!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Error saving Steam ID:', err);
      setErrorMsg(err.message || 'ไม่พบบัญชี Steam นี้ กรุณาตรวจสอบ Steam ID หรือ Profile URL อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[var(--gp-primary)] border border-[var(--gp-divider)] rounded-2xl max-w-md w-full shadow-2xl animate-scaleIn relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[var(--gp-divider)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--gp-brand)]/15 text-[var(--gp-brand-light)] flex items-center justify-center">
              <SteamIcon className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[var(--gp-text-strong)]">
              ตั้งค่า / เชื่อมต่อ Steam ID
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--gp-text-muted)] hover:text-[var(--gp-text-strong)] hover:bg-[var(--gp-elevated)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold block text-[var(--gp-text)]">
                กรอก Steam ID64 หรือ Custom Profile Link:
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gp-text-muted)]" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="เช่น 76561198012345678 หรือ https://steamcommunity.com/id/yourname"
                  className="w-full bg-[var(--gp-rail)] border border-[var(--gp-divider)] focus:border-[var(--gp-brand)] rounded-lg pl-9 pr-3.5 py-2 text-xs font-mono text-[var(--gp-text)] placeholder-[var(--gp-text-muted)] focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] leading-relaxed pt-0.5 text-[var(--gp-text-muted)]">
                * ระบบจะตรวจสอบกับ Steam API โดยตรง หาก Steam ID ถูกต้องจะบันทึกโปรไฟล์จริงของคุณ
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl text-xs flex items-start gap-2 border border-red-500/30 bg-red-500/10 text-red-400 animate-fadeIn">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl text-xs flex items-center gap-2 border border-[var(--gp-green)]/30 bg-[var(--gp-green)]/10 text-[var(--gp-green)] animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-[var(--gp-green)] shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[var(--gp-secondary)] border-t border-[var(--gp-border-subtle)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-[var(--gp-text-sub)] hover:underline"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[var(--gp-brand)] hover:bg-[var(--gp-brand-hover)] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก Steam ID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
