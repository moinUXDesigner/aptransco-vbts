const STATUS_CONFIG = {
  /* ── Flowchart milestones (M1–M10) ─────────────────────────── */
  'Submitted':                { bg: 'bg-ap-blue-light',   text: 'text-ap-blue-mid',  label: 'Submitted' },
  'Pending with AEE':         { bg: 'bg-ap-orange-light', text: 'text-ap-orange',    label: 'Pending · AEE' },
  'Pending with DEE':         { bg: 'bg-ap-orange-light', text: 'text-ap-orange',    label: 'Pending · DEE' },
  'Pending with EE':          { bg: 'bg-ap-blue-light',   text: 'text-ap-blue-mid',  label: 'Pending · EE' },
  'Invoice Posted':           { bg: 'bg-ap-gold-light',   text: 'text-yellow-700',   label: 'Invoice Posted' },
  'Pending with Field SAO':   { bg: 'bg-ap-orange-light', text: 'text-ap-orange',    label: 'Pending · Field SAO' },
  'Pending with HQ SAO':      { bg: 'bg-purple-100',      text: 'text-purple-700',   label: 'Pending · HQ SAO' },
  'HQ LOA Processing':        { bg: 'bg-purple-100',      text: 'text-purple-700',   label: 'HQ LOA Processing' },
  'LOA Processing':           { bg: 'bg-ap-green-light',  text: 'text-ap-green',     label: 'LOA Processing' },
  'Paid':                     { bg: 'bg-ap-green-light',  text: 'text-ap-green',     label: 'Paid' },

  /* ── Terminal negative states ───────────────────────────────── */
  'Rejected':                 { bg: 'bg-ap-red-light',    text: 'text-ap-red',       label: 'Rejected' },
  'Sent Back by Accounts':    { bg: 'bg-ap-red-light',    text: 'text-ap-red',       label: 'Sent Back' },
  'Sent Back by HQ':          { bg: 'bg-ap-red-light',    text: 'text-ap-red',       label: 'Sent Back' },

  /* ── Bill type badges ───────────────────────────────────────── */
  'Material':   { bg: 'bg-ap-blue-light',   text: 'text-ap-blue-mid',  label: 'Material' },
  'Service':    { bg: 'bg-ap-green-light',  text: 'text-ap-green',     label: 'Service' },
  'HR':         { bg: 'bg-ap-gold-light',   text: 'text-yellow-700',   label: 'HR' },
  'Retention':  { bg: 'bg-purple-100',      text: 'text-purple-700',   label: 'Retention' },
  'Penalty':    { bg: 'bg-ap-red-light',    text: 'text-ap-red',       label: 'Penalty' },
  'Other':      { bg: 'bg-neutral-100',     text: 'text-neutral-600',  label: 'Other' },
  'Draft':      { bg: 'bg-neutral-100',     text: 'text-neutral-700',  label: 'Draft' },
};

export default function Badge({ status, className = '' }) {
  const cfg = STATUS_CONFIG[status] || { bg: 'bg-neutral-100', text: 'text-neutral-700', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} ${className}`}>
      {cfg.label}
    </span>
  );
}
