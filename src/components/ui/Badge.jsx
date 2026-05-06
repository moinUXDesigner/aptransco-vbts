const STATUS_CONFIG = {
  'Submitted':            { bg: 'bg-ap-blue-light',      text: 'text-ap-blue-mid',   label: 'Submitted' },
  'Pending with AEE':     { bg: 'bg-ap-orange-light',    text: 'text-ap-orange',      label: 'Pending with AEE' },
  'Under Verification':   { bg: 'bg-ap-orange-light',    text: 'text-ap-orange',      label: 'Under Verification' },
  'Reviewed by Engineer': { bg: 'bg-ap-blue-light',      text: 'text-ap-blue-mid',   label: 'Reviewed' },
  'Form13 Updated':       { bg: 'bg-ap-gold-light',      text: 'text-yellow-700',    label: 'Form13 Updated' },
  'Form14 Updated':       { bg: 'bg-ap-green-light',     text: 'text-ap-green',      label: 'Form14 Updated' },
  'Invoice Posted':       { bg: 'bg-ap-orange-light',    text: 'text-ap-orange',      label: 'Invoice Posted' },
  'LOA Created':          { bg: 'bg-ap-green-light',     text: 'text-ap-green',      label: 'LOA Created' },
  'LOA Approved':         { bg: 'bg-ap-green-light',     text: 'text-ap-green',      label: 'LOA Approved' },
  'With HQ Accounts':     { bg: 'bg-ap-orange-light',    text: 'text-ap-orange',      label: 'With HQ Accounts' },
  'Approved':             { bg: 'bg-ap-green-light',     text: 'text-ap-green',      label: 'Approved' },
  'Paid':                 { bg: 'bg-ap-green-light',     text: 'text-ap-green',      label: 'Paid' },
  'Rejected':             { bg: 'bg-ap-red-light',       text: 'text-ap-red',        label: 'Rejected' },
  'Sent Back by Accounts':{ bg: 'bg-ap-red-light',       text: 'text-ap-red',        label: 'Sent Back' },
  'Sent Back by HQ':      { bg: 'bg-ap-red-light',       text: 'text-ap-red',        label: 'Sent Back' },
  'Draft':                { bg: 'bg-neutral-100',        text: 'text-neutral-700',   label: 'Draft' },
  'Material':             { bg: 'bg-ap-blue-light',      text: 'text-ap-blue-mid',   label: 'Material' },
  'Service':              { bg: 'bg-ap-green-light',     text: 'text-ap-green',      label: 'Service' },
  'HR':                   { bg: 'bg-ap-gold-light',      text: 'text-yellow-700',    label: 'HR' },
  'Retention':            { bg: 'bg-purple-100',         text: 'text-purple-700',    label: 'Retention' },
  'Penalty':              { bg: 'bg-ap-red-light',       text: 'text-ap-red',        label: 'Penalty' },
};

export default function Badge({ status, className = '' }) {
  const cfg = STATUS_CONFIG[status] || { bg: 'bg-neutral-100', text: 'text-neutral-700', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} ${className}`}>
      {cfg.label}
    </span>
  );
}
