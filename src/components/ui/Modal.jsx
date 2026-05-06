import { X } from 'lucide-react';

export default function Modal({ open, title, onClose, children, footer, maxWidth = 'max-w-2xl' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-ap-blue/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-xl shadow-lg w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ap-gray-100">
          <h3 className="text-base font-bold text-ap-blue">{title}</h3>
          <button onClick={onClose} className="text-ap-gray-400 hover:text-ap-gray-800 p-1 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-ap-gray-100">{footer}</div>
        )}
      </div>
    </div>
  );
}
