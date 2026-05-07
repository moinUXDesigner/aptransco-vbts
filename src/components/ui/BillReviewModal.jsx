import { useState, useEffect } from 'react';
import Badge from './Badge';
import Button from './Button';

function fmtAmt(v) {
  return '₹' + Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

/* ── Stage-specific review config ─────────────────────────────────────
   Each entry defines what the responsible officer sees & fills in
   before advancing to the next milestone.
──────────────────────────────────────────────────────────────────────── */
const STAGE_CONFIG = {
  'Submitted': {
    milestone: 'M2', role: 'AEE – Technical Wing',
    title: 'AEE Review & Acceptance',
    instruction: 'Accept the bill and initiate GR/SE in SAP. Form-13 / Form-14 will be generated at this stage.',
    fields: [
      { key: 'grSeNo',    label: 'GR/SE Number (SAP)',  required: true,  placeholder: 'e.g. 5000012345' },
      { key: 'form13Ref', label: 'Form-13 Reference',   required: true,  placeholder: 'Form-13 Ref No.' },
      { key: 'form14Ref', label: 'Form-14 Reference',   required: false, placeholder: 'Form-14 Ref No. (if available)' },
      { key: 'remarks',   label: 'Remarks',             required: false, type: 'textarea', placeholder: 'Any observations...' },
    ],
    approveLabel: 'Accept & Forward to AEE Processing',
    nextStatus: 'Pending with AEE',
  },
  'Pending with AEE': {
    milestone: 'M2', role: 'AEE – Technical Wing',
    title: 'AEE Processing – Forward to DEE',
    instruction: 'Confirm GR/SE is raised in SAP and Form-13/Form-14 are generated. Then forward to DEE for verification.',
    fields: [
      { key: 'grSeNo',    label: 'GR/SE Number (SAP)',  required: true,  placeholder: 'e.g. 5000012345' },
      { key: 'form13Ref', label: 'Form-13 Reference',   required: true,  placeholder: 'Form-13 Ref No.' },
      { key: 'form14Ref', label: 'Form-14 Reference',   required: false, placeholder: 'Form-14 Ref No.' },
      { key: 'remarks',   label: 'Remarks',             required: false, type: 'textarea' },
    ],
    approveLabel: 'Approve & Forward to DEE',
    nextStatus: 'Pending with DEE',
  },
  'Pending with DEE': {
    milestone: 'M3', role: 'DEE – Engineering Division',
    title: 'DEE Verification',
    instruction: 'Verify all recoveries and supporting documents before forwarding to EE for approval.',
    fields: [
      { key: 'recoveriesOk', label: 'Recoveries verified and accounted', type: 'checkbox', required: true },
      { key: 'docsOk',       label: 'Supporting documents verified',     type: 'checkbox', required: true },
      { key: 'remarks',      label: 'Verification Remarks',             required: false, type: 'textarea' },
    ],
    approveLabel: 'Verify & Forward to EE',
    nextStatus: 'Pending with EE',
  },
  'Pending with EE': {
    milestone: 'M4', role: 'EE – Executive Engineer',
    title: 'EE Approval',
    instruction: 'Review and approve the bill. On approval it will be forwarded to Field Accounts for invoice posting.',
    fields: [
      { key: 'eeApproved', label: 'I approve this bill for payment processing', type: 'checkbox', required: true },
      { key: 'remarks',    label: 'Approval Remarks', required: false, type: 'textarea' },
    ],
    approveLabel: 'Approve & Forward to Field Accounts',
    nextStatus: 'Invoice Posted',
  },
  'Invoice Posted': {
    milestone: 'M5 + M6', role: 'Field Accounts – AAO / JAO',
    title: 'Invoice Posting & LOA Generation',
    instruction: 'Post invoice in SAP and generate LOA simultaneously (M5 & M6 are done together by Field AOs).',
    fields: [
      { key: 'invoiceDocNo', label: 'SAP Invoice Document No.', required: true,  placeholder: 'e.g. 5100012345' },
      { key: 'loaNo',        label: 'LOA Number',               required: true,  placeholder: 'e.g. LOA/2025-26/001' },
      { key: 'remarks',      label: 'Remarks',                  required: false, type: 'textarea' },
    ],
    approveLabel: 'Post Invoice & Generate LOA → Field SAO',
    nextStatus: 'Pending with Field SAO',
  },
  'Pending with Field SAO': {
    milestone: 'M7', role: 'Field SAO – Field Office',
    title: 'Field SAO – LOA Verification',
    instruction: 'Review LOA in VBTS and approve in SAP before escalating to HQ SAO.',
    fields: [
      { key: 'loaVerified', label: 'LOA reviewed and approved in SAP', type: 'checkbox', required: true },
      { key: 'remarks',     label: 'Verification Remarks', required: false, type: 'textarea' },
    ],
    approveLabel: 'Verify LOA & Escalate to HQ SAO',
    nextStatus: 'Pending with HQ SAO',
  },
  'Pending with HQ SAO': {
    milestone: 'M8', role: 'HQ SAO – Headquarters',
    title: 'HQ SAO – LOA Approval',
    instruction: 'Approve LOA after subordinate review in SAP. System will auto-log "HQ LOA Processing" on approval.',
    fields: [
      { key: 'loaApproved', label: 'LOA approved in SAP after subordinate review', type: 'checkbox', required: true },
      { key: 'remarks',     label: 'Approval Remarks', required: false, type: 'textarea' },
    ],
    approveLabel: 'Approve LOA (Auto-logs HQ LOA Processing)',
    nextStatus: 'HQ LOA Processing',
  },
  'HQ LOA Processing': {
    milestone: 'M9a + M9b', role: 'Loans & B&R Section (HQ)',
    title: 'LOA / LOC Parallel Processing',
    instruction: 'Confirm both Loans section (M9a – LOA) and B&R section (M9b – LOC) have completed their approvals.',
    fields: [
      { key: 'm9aLoans', label: 'M9a – Loans section: LOA approved',  type: 'checkbox', required: true },
      { key: 'm9bBnR',   label: 'M9b – B&R section: LOC approved',    type: 'checkbox', required: true },
      { key: 'transRef', label: 'RTGS / NEFT Transaction Reference',  required: true,  placeholder: 'Transaction Ref No.' },
      { key: 'remarks',  label: 'Remarks',                            required: false, type: 'textarea' },
    ],
    approveLabel: 'Release Payment – M10',
    nextStatus: 'Paid',
  },
};

/* ── Field renderer ────────────────────────────────────────────────── */
function Field({ field, value, onChange, error }) {
  const base = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ap-blue-mid focus:ring-2 focus:ring-ap-blue-light transition-all';
  const borderCls = error ? 'border-ap-red bg-red-50' : 'border-ap-gray-200 bg-ap-gray-50';

  if (field.type === 'checkbox') {
    return (
      <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
        ${value ? 'border-ap-green bg-ap-green-light' : error ? 'border-ap-red bg-red-50' : 'border-ap-gray-200 bg-ap-gray-50 hover:bg-ap-gray-100'}`}>
        <input
          type="checkbox"
          checked={!!value}
          onChange={e => onChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-ap-green flex-shrink-0"
        />
        <span className={`text-sm font-medium ${value ? 'text-ap-green' : 'text-ap-gray-700'}`}>{field.label}</span>
      </label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder || 'Enter remarks...'}
        rows={3}
        className={`${base} ${borderCls} resize-none`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={`${base} ${borderCls}`}
    />
  );
}

/* ── Main modal component ─────────────────────────────────────────── */
export default function BillReviewModal({ bill, onClose, onApprove, onReject }) {
  const [visible, setVisible] = useState(false);
  const [values, setValues]   = useState({});
  const [errors, setErrors]   = useState({});

  useEffect(() => {
    if (bill) {
      setValues({});
      setErrors({});
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
    }
  }, [bill]);

  if (!bill) return null;

  const cfg = STAGE_CONFIG[bill.status];
  if (!cfg) {
    // Fallback for stages without specific config — just confirm
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 z-10">
          <p className="text-sm text-ap-gray-600 mb-4">Advance bill <b>{bill.billId}</b> from <b>{bill.status}</b>?</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <Button variant="primary" onClick={() => onApprove(bill.billId, {}, '')} className="flex-1">Advance →</Button>
          </div>
        </div>
      </div>
    );
  }

  const set = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: false }));
  };

  const handleApprove = () => {
    const newErrors = {};
    cfg.fields.forEach(f => {
      if (f.required && !values[f.key]) newErrors[f.key] = true;
    });
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    onApprove(bill.billId, values, cfg.nextStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: 'rgba(0,31,63,0.5)', backdropFilter: 'blur(3px)', opacity: visible ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] transition-all duration-300"
        style={{ transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(16px)', opacity: visible ? 1 : 0 }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-4 rounded-t-2xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #001F3F 0%, #005FAD 100%)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded">{cfg.milestone}</span>
              <span className="text-white font-bold text-sm">{cfg.title}</span>
            </div>
            <div className="text-white/60 text-xs">{cfg.role}</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Bill summary strip */}
        <div className="grid grid-cols-4 gap-3 px-6 py-3 bg-ap-gray-50 border-b border-ap-gray-200 flex-shrink-0">
          {[
            { label: 'Bill ID',  value: bill.billId,            mono: true },
            { label: 'Vendor',   value: bill.vendorId },
            { label: 'Type',     value: <Badge status={bill.type} /> },
            { label: 'Amount',   value: fmtAmt(bill.grossAmt),  bold: true },
          ].map(item => (
            <div key={item.label}>
              <div className="text-[10px] font-semibold text-ap-gray-400 uppercase tracking-wide mb-0.5">{item.label}</div>
              <div className={`text-xs ${item.mono ? 'font-mono text-ap-blue-mid' : item.bold ? 'font-bold text-ap-blue font-sans' : 'font-medium text-ap-gray-800'}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Instruction */}
        <div className="px-6 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-start gap-2 bg-ap-blue-light border border-ap-blue-mid/30 rounded-lg px-3 py-2.5">
            <svg className="w-4 h-4 text-ap-blue-mid flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-ap-blue leading-snug">{cfg.instruction}</p>
          </div>
        </div>

        {/* Form fields */}
        <div className="px-6 pb-4 space-y-3 overflow-y-auto flex-1">
          {cfg.fields.map(f => (
            <div key={f.key}>
              {f.type !== 'checkbox' && (
                <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">
                  {f.label}{f.required && <span className="text-ap-red ml-0.5">*</span>}
                </label>
              )}
              <Field
                field={f}
                value={values[f.key] ?? ''}
                onChange={val => set(f.key, val)}
                error={errors[f.key]}
              />
              {errors[f.key] && (
                <p className="text-xs text-ap-red mt-1">This field is required.</p>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-ap-gray-100 bg-ap-gray-50 rounded-b-2xl flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={() => onReject(bill.billId)} className="ml-0">
            Reject Bill
          </Button>
          <Button variant="success" onClick={handleApprove} className="ml-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {cfg.approveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
