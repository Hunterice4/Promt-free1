
import React from 'react';
import { FireIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-[#0f111a] border border-[#1e2235] rounded-3xl w-full max-w-md p-8 shadow-2xl shadow-[#0066ff]/20 transform transition-all scale-100">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0066ff]/10 rounded-full mb-2 animate-pulse">
            <FireIcon className="w-10 h-10 text-[#0066ff]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              โควต้าวันนี้หมดแล้ว!
            </h2>
            <p className="text-gray-400 font-medium">
              คุณใช้งานครบ 4 ครั้งต่อวันแล้ว <br/>
              ต้องการใช้งานแบบ <span className="text-[#0066ff] font-bold">Unlimited</span> หรือไม่?
            </p>
          </div>

          <div className="bg-[#05050a] rounded-xl p-4 border border-[#1e2235] text-left space-y-3">
            <div className="flex justify-between items-center border-b border-[#1e2235] pb-2">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                สิ่งที่จะได้รับใน Version PRO
                </h3>
                <span className="bg-[#0066ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Premium
                </span>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> สร้างสคริปต์ได้ไม่จำกัด
              </li>
                  <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> ดูประวัติย้อนหลังได้
              </li>
                  <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> เพิ่มฉากได้ไม่จำกัด
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> เข้ากลุ่มลับ
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> ฟรีคอร์สเรียน
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-black text-white tracking-tight">
                199 บาท <span className="text-sm font-medium text-gray-400">(ตลอดชีพ)</span>
            </div>

            <a 
                href="https://m.me/ByteVerseAI" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full py-4 bg-gradient-to-r from-[#0066ff] to-[#0044aa] hover:from-[#0055dd] hover:to-[#003399] text-white font-black text-lg rounded-xl shadow-lg shadow-[#0066ff]/25 transition-all transform hover:scale-[1.02] active:scale-95"
            >
                Upgrade Now (ติดต่อ ByteVerse)
            </a>
          </div>
          
          <button 
            onClick={onClose}
            className="text-gray-500 text-sm hover:text-white underline decoration-gray-500/30"
          >
            ใช้งานฟรีใหม่พรุ่งนี้
          </button>
        </div>
      </div>
    </div>
  );
};
