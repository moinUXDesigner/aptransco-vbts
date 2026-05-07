import { useEffect, useState } from 'react';
import BillTimeline from './BillTimeline';
import Badge from './Badge';

function fmtAmt(v) {
  return '₹' + Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

export default function TimelineSidebar({ bill, onClose }) {
  const [rendered, setRendered] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (bill) {
      setRendered(true);
      // Double rAF ensures the browser has painted the initial (off-screen) state
      // before we apply the enter class, giving CSS transition something to animate from.
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setEntered(true))
      );
      return () => cancelAnimationFrame(id);
    } else {
      setEntered(false);
      const t = setTimeout(() => setRendered(false), 320);
      return () => clearTimeout(t);
    }
  }, [bill]);

  if (!rendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: 'rgba(0,31,63,0.45)',
          backdropFilter: 'blur(2px)',
          opacity: entered ? 1 : 0,
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="relative flex flex-col h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out"
        style={{
          width: 460,
          maxWidth: '92vw',
          transform: entered ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 flex items-start justify-between px-5 py-4 border-b border-ap-gray-200"
          style={{ background: 'linear-gradient(135deg, #001F3F 0%, #005FAD 100%)' }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-white font-bold text-sm">Bill Processing Timeline</span>
            </div>
            <div
              className="font-mono text-xs truncate"
              style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 340 }}
            >
              {bill?.billId}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge status={bill?.type} />
              <Badge status={bill?.status} />
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">
          {bill && <BillTimeline bill={bill} />}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-ap-gray-100 bg-ap-gray-50 flex items-center justify-between">
          <span className="text-xs text-ap-gray-400">
            PO: <span className="font-semibold text-ap-gray-600">{bill?.poNo}</span>
            {bill?.wing && <> &nbsp;·&nbsp; Wing: <span className="font-semibold text-ap-gray-600">{bill?.wing}</span></>}
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-ap-blue-mid hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
