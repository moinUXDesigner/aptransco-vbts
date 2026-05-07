import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PO_DATA, VMAT_DATA, VSVC_DATA, EMPLOYEES } from '../../data/mockData';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

/* ─── Constants ──────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Bill Type',   desc: 'Select invoice category' },
  { id: 2, label: 'PO Details',  desc: 'Purchase order & invoice info' },
  { id: 3, label: 'Amount',      desc: 'Invoice amount & tax' },
  { id: 4, label: 'Assignment',  desc: 'Wing & engineer' },
  { id: 5, label: 'Review',      desc: 'Confirm & submit' },
];

const INVOICE_TYPES = [
  { value: 'Material',  label: 'Material Invoice',    desc: 'Supply of materials / equipment',      icon: '🏗️',  color: 'border-ap-blue-mid bg-ap-blue-light text-ap-blue' },
  { value: 'Service',   label: 'Service Invoice',     desc: 'Labour & service work charges',         icon: '🔧',  color: 'border-ap-green bg-ap-green-light text-ap-green' },
  { value: 'Retention', label: 'Retention Release',   desc: 'Release of withheld security deposit',  icon: '🔓',  color: 'border-yellow-500 bg-yellow-50 text-yellow-700' },
  { value: 'Penalty',   label: 'Penalty Invoice',     desc: 'LD / penalty deduction claim',          icon: '⚠️',  color: 'border-ap-red bg-ap-red-light text-ap-red' },
  { value: 'Other',     label: 'Other Recoveries',    desc: 'Miscellaneous deductions / recoveries', icon: '📎',  color: 'border-ap-gray-400 bg-ap-gray-50 text-ap-gray-600' },
  { value: 'HR',        label: 'HR (Hand Receipt)',   desc: 'Hand receipt for retention release',    icon: '🧾',  color: 'border-purple-500 bg-purple-50 text-purple-700' },
];

const GST_RATES = ['5', '12', '18', '28'];
const WINGS     = ['Electrical', 'Civil', 'Telecom'];

let _serial = {};
function genBillId(poNo, type) {
  const code = { Material:'MAT', Service:'SVC', Retention:'RET', Penalty:'PEN', Other:'OTH', HR:'HR' }[type] || 'GEN';
  const key  = poNo + '_' + type;
  _serial[key] = (_serial[key] || 0) + 1;
  const seq  = String(_serial[key]).padStart(3, '0');
  const dt   = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `VBTS-${poNo.slice(-6)}-${code}-${dt}-${seq}`;
}

function fmtAmt(v) { return '₹' + Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }); }

/* ─── Stepper bar ─────────────────────────────────────────────────── */
function StepperBar({ current }) {
  return (
    <div className="flex items-center mb-6 px-1 select-none">
      {STEPS.map((s, i) => {
        const done    = current > s.id;
        const active  = current === s.id;
        const future  = current < s.id;
        const isLast  = i === STEPS.length - 1;

        return (
          <div key={s.id} className="flex items-center flex-1 min-w-0">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300
                ${done   ? 'bg-ap-green border-ap-green text-white shadow-sm'                   : ''}
                ${active ? 'bg-ap-blue-mid border-ap-blue-mid text-white shadow-md ring-4 ring-ap-blue-light' : ''}
                ${future ? 'bg-white border-ap-gray-300 text-ap-gray-400'                       : ''}`}
              >
                {done
                  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  : s.id}
              </div>
              <div className={`text-xs font-semibold leading-none whitespace-nowrap hidden sm:block transition-colors duration-300
                ${done ? 'text-ap-green' : active ? 'text-ap-blue-mid' : 'text-ap-gray-400'}`}>
                {s.label}
              </div>
            </div>

            {/* Connector */}
            {!isLast && (
              <div className="flex-1 mx-2 mt-[-14px]">
                <div className={`h-0.5 w-full transition-all duration-500 ${done ? 'bg-ap-green' : 'bg-ap-gray-200'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Step 1: Bill Type ───────────────────────────────────────────── */
function Step1Type({ invType, setType }) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-bold text-ap-blue mb-1">Select Invoice / HR Type</h2>
        <p className="text-xs text-ap-gray-500">Choose the category that best describes this bill submission.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {INVOICE_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`relative text-left rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md
              ${invType === t.value
                ? `${t.color} shadow-md ring-2 ring-offset-1 ring-ap-blue-mid`
                : 'border-ap-gray-200 bg-white text-ap-gray-700 hover:border-ap-gray-300'}`}
          >
            {invType === t.value && (
              <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-ap-blue-mid flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </span>
            )}
            <div className="text-2xl mb-2 leading-none">{t.icon}</div>
            <div className="font-bold text-sm mb-0.5">{t.label}</div>
            <div className="text-xs leading-snug opacity-75">{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 2: PO Details ──────────────────────────────────────────── */
function Step2PO({ poNo, setPo, eInvNo, setEInv, invDate, setDate, myPOs, poInfo }) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-bold text-ap-blue mb-1">Purchase Order & Invoice Details</h2>
        <p className="text-xs text-ap-gray-500">Select the PO linked to this bill and enter the e-Invoice reference.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">Purchase Order *</label>
          <select value={poNo} onChange={e => setPo(e.target.value)}
            className="w-full border border-ap-gray-200 rounded-lg px-3 py-2.5 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid focus:ring-2 focus:ring-ap-blue-light">
            <option value="">— Select PO —</option>
            {myPOs.map(p => <option key={p.poNo} value={p.poNo}>{p.poNo} – {p.workName?.substring(0, 50)}</option>)}
          </select>
        </div>

        {poInfo && (
          <div className="md:col-span-2">
            <Alert variant="info">
              <div className="text-xs">
                <span className="font-bold">{poInfo.poNo}</span> · {poInfo.workName}<br />
                <span className="text-ap-gray-500">Scheme: {poInfo.schemeDesc} · Type: {poInfo.purchDocType}</span>
              </div>
            </Alert>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">e-Invoice Number *</label>
          <input value={eInvNo} onChange={e => setEInv(e.target.value)} placeholder="e.g. INV/2025-26/001"
            className="w-full border border-ap-gray-200 rounded-lg px-3 py-2.5 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid focus:ring-2 focus:ring-ap-blue-light" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">Invoice Date *</label>
          <input type="date" value={invDate} onChange={e => setDate(e.target.value)}
            className="w-full border border-ap-gray-200 rounded-lg px-3 py-2.5 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid focus:ring-2 focus:ring-ap-blue-light" />
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3: Amount ──────────────────────────────────────────────── */
function Step3Amount({ invType, poNo, vendorId, baseAmt, setBase, gstRate, setGst, labourCess, setCess, hrAmt, setHrAmt }) {
  const base  = parseFloat(baseAmt) || 0;
  const gst   = parseFloat(gstRate) || 0;
  const cess  = parseFloat(labourCess) || 0;
  const cessAmt  = base * cess / 100;
  const gstAmt   = (base + cessAmt) * gst / 100;
  const gross    = base + cessAmt + gstAmt;

  const retentionInfo = (() => {
    if (!poNo || !['Retention','HR'].includes(invType)) return null;
    const mRet = VMAT_DATA.filter(r => r.poNo === poNo && String(r.vendorId) === vendorId).reduce((s,r) => s+r.retention,0);
    const sRet = VSVC_DATA.filter(r => r.poNo === poNo && String(r.vendorId) === vendorId).reduce((s,r) => s+r.retention,0);
    return mRet + sRet;
  })();

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-bold text-ap-blue mb-1">Amount & Tax Details</h2>
        <p className="text-xs text-ap-gray-500">
          {invType === 'HR' ? 'Enter the hand receipt amount.' : invType === 'Retention' ? 'Review available retention balance.' : 'Enter base amount and applicable tax rates.'}
        </p>
      </div>

      {/* Material / Service */}
      {['Material','Service'].includes(invType) && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">Base Invoice Amount (₹) *</label>
              <input type="number" value={baseAmt} onChange={e => setBase(e.target.value)} placeholder="0.00"
                className="w-full border border-ap-gray-200 rounded-lg px-3 py-2.5 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid focus:ring-2 focus:ring-ap-blue-light" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">GST Rate *</label>
              <select value={gstRate} onChange={e => setGst(e.target.value)}
                className="w-full border border-ap-gray-200 rounded-lg px-3 py-2.5 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid focus:ring-2 focus:ring-ap-blue-light">
                <option value="">— Select GST % —</option>
                {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
            {invType === 'Service' && (
              <div>
                <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">Labour Cess</label>
                <select value={labourCess} onChange={e => setCess(e.target.value)}
                  className="w-full border border-ap-gray-200 rounded-lg px-3 py-2.5 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid focus:ring-2 focus:ring-ap-blue-light">
                  <option value="">— None —</option>
                  <option value="1">1%</option>
                  <option value="2">2%</option>
                </select>
              </div>
            )}
          </div>

          {base > 0 && gstRate && (
            <div className="bg-ap-gray-50 border border-ap-gray-200 rounded-xl p-4">
              <div className="text-xs font-bold text-ap-gray-600 uppercase tracking-wide mb-3">Tax Breakdown</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ap-gray-600">Base Amount</span>
                  <span className="font-semibold">{fmtAmt(base)}</span>
                </div>
                {cess > 0 && (
                  <div className="flex justify-between">
                    <span className="text-ap-gray-600">Labour Cess ({cess}%)</span>
                    <span className="font-semibold">{fmtAmt(cessAmt)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-ap-gray-600">GST ({gstRate}%)</span>
                  <span className="font-semibold">{fmtAmt(gstAmt)}</span>
                </div>
                <div className="h-px bg-ap-gray-200" />
                <div className="flex justify-between">
                  <span className="font-bold text-ap-blue">Gross Invoice Value</span>
                  <span className="font-sans font-bold text-ap-blue text-base">{fmtAmt(gross)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HR */}
      {invType === 'HR' && (
        <div className="space-y-4">
          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">HR Amount (₹) *</label>
            <input type="number" value={hrAmt} onChange={e => setHrAmt(e.target.value)} placeholder="0.00"
              className="w-full border border-ap-gray-200 rounded-lg px-3 py-2.5 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid focus:ring-2 focus:ring-ap-blue-light" />
          </div>
          {retentionInfo !== null && <RetentionSummary value={retentionInfo} />}
        </div>
      )}

      {/* Retention */}
      {invType === 'Retention' && (
        <div className="space-y-4">
          {retentionInfo !== null && <RetentionSummary value={retentionInfo} />}
          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">Amount to Claim (₹)</label>
            <input type="number" value={baseAmt} onChange={e => setBase(e.target.value)} placeholder="0.00"
              className="w-full border border-ap-gray-200 rounded-lg px-3 py-2.5 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid focus:ring-2 focus:ring-ap-blue-light" />
          </div>
        </div>
      )}

      {/* Penalty / Other */}
      {['Penalty','Other'].includes(invType) && (
        <div className="max-w-xs">
          <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">Invoice Amount (₹)</label>
          <input type="number" value={baseAmt} onChange={e => setBase(e.target.value)} placeholder="0.00"
            className="w-full border border-ap-gray-200 rounded-lg px-3 py-2.5 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid focus:ring-2 focus:ring-ap-blue-light" />
          <p className="text-xs text-ap-gray-400 mt-1.5">Optional – enter 0 if amount is to be determined later.</p>
        </div>
      )}
    </div>
  );
}

function RetentionSummary({ value }) {
  return (
    <div className="bg-ap-gray-50 border border-ap-gray-200 rounded-xl p-4 grid grid-cols-3 gap-4">
      <div><div className="text-xs text-ap-gray-400 uppercase font-semibold mb-1">Total Recovered</div><div className="font-sans font-bold text-ap-blue text-lg">{fmtAmt(value)}</div></div>
      <div><div className="text-xs text-ap-gray-400 uppercase font-semibold mb-1">Released So Far</div><div className="font-sans font-bold text-ap-blue text-lg">₹0.00</div></div>
      <div><div className="text-xs text-ap-gray-400 uppercase font-semibold mb-1">Balance Available</div><div className="font-sans font-bold text-ap-green text-lg">{fmtAmt(value)}</div></div>
    </div>
  );
}

/* ─── Step 4: Assignment ──────────────────────────────────────────── */
function Step4Assignment({ wing, setWing, engineer, setEngineer }) {
  const engineers = EMPLOYEES.filter(e => {
    if (wing === 'Electrical') return e.subArea === 'Engineering-Ele';
    if (wing === 'Civil')      return e.subArea === 'Engineering-Civ';
    if (wing === 'Telecom')    return e.subArea === 'Engineering-Tel';
    return false;
  });

  const eng = EMPLOYEES.find(e => String(e.id) === engineer);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-bold text-ap-blue mb-1">Wing & Engineer Assignment</h2>
        <p className="text-xs text-ap-gray-500">Select the wing responsible for this work and assign the supervising engineer.</p>
      </div>

      {/* Wing cards */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-3">Select Wing *</label>
        <div className="grid grid-cols-3 gap-3">
          {WINGS.map(w => {
            const icons = { Electrical: '⚡', Civil: '🏗️', Telecom: '📡' };
            const active = wing === w;
            return (
              <button key={w} onClick={() => { setWing(w); setEngineer(''); }}
                className={`rounded-xl border-2 py-4 px-3 flex flex-col items-center gap-2 transition-all duration-200
                  ${active ? 'border-ap-blue-mid bg-ap-blue-light shadow-md ring-2 ring-ap-blue-light' : 'border-ap-gray-200 bg-white hover:border-ap-gray-300 hover:shadow-sm'}`}>
                <span className="text-2xl">{icons[w]}</span>
                <span className={`text-sm font-bold ${active ? 'text-ap-blue' : 'text-ap-gray-700'}`}>{w} Wing</span>
                {active && <span className="text-xs text-ap-blue-mid">{engineers.length} engineers</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Engineer */}
      {wing && (
        <div>
          <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-2">Assigned Engineer *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {engineers.length === 0 ? (
              <p className="text-xs text-ap-gray-400 col-span-2">No engineers available for this wing.</p>
            ) : engineers.map(e => (
              <button key={e.id} onClick={() => setEngineer(String(e.id))}
                className={`text-left rounded-lg border-2 px-3 py-2.5 transition-all duration-200
                  ${engineer === String(e.id) ? 'border-ap-blue-mid bg-ap-blue-light' : 'border-ap-gray-200 bg-white hover:border-ap-gray-300'}`}>
                <div className={`text-sm font-semibold ${engineer === String(e.id) ? 'text-ap-blue' : 'text-ap-gray-800'}`}>{e.name}</div>
                <div className="text-xs text-ap-gray-400">{e.designation}</div>
              </button>
            ))}
          </div>
          {eng && (
            <div className="mt-3 flex items-center gap-2 bg-ap-green-light border border-ap-green rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-ap-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span className="text-xs font-semibold text-ap-green">Assigned: {eng.name} · {eng.designation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Step 5: Review ──────────────────────────────────────────────── */
function Step5Review({ invType, poNo, eInvNo, invDate, baseAmt, gstRate, labourCess, hrAmt, wing, engineer, billIdPreview }) {
  const base  = parseFloat(baseAmt) || 0;
  const gst   = parseFloat(gstRate) || 0;
  const cess  = parseFloat(labourCess) || 0;
  const cessAmt = base * cess / 100;
  const gstAmt  = (base + cessAmt) * gst / 100;
  const gross   = invType === 'HR'
    ? parseFloat(hrAmt) || 0
    : ['Retention','Penalty','Other'].includes(invType)
      ? parseFloat(baseAmt) || 0
      : base + cessAmt + gstAmt;

  const eng = EMPLOYEES.find(e => String(e.id) === engineer);
  const typeInfo = INVOICE_TYPES.find(t => t.value === invType);

  const Row = ({ label, value, highlight }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-ap-gray-100 last:border-0">
      <span className="text-xs font-semibold text-ap-gray-500 uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-semibold text-right max-w-[60%] ${highlight ? 'font-bold text-ap-blue font-sans text-base' : 'text-ap-gray-800'}`}>{value}</span>
    </div>
  );

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-bold text-ap-blue mb-1">Review & Confirm Submission</h2>
        <p className="text-xs text-ap-gray-500">Please verify all details before submitting. This action cannot be undone.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bill info */}
        <div className="bg-white border border-ap-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-ap-gray-50 border-b border-ap-gray-200">
            <div className="text-xs font-bold text-ap-blue uppercase tracking-wide">Bill Information</div>
          </div>
          <div className="px-4">
            <Row label="Bill Type"     value={`${typeInfo?.icon} ${typeInfo?.label}`} />
            <Row label="PO Number"     value={poNo} />
            <Row label="e-Invoice No." value={eInvNo} />
            <Row label="Invoice Date"  value={invDate} />
          </div>
        </div>

        {/* Amount info */}
        <div className="bg-white border border-ap-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-ap-gray-50 border-b border-ap-gray-200">
            <div className="text-xs font-bold text-ap-blue uppercase tracking-wide">Amount & Assignment</div>
          </div>
          <div className="px-4">
            {['Material','Service'].includes(invType) && (
              <>
                <Row label="Base Amount" value={fmtAmt(base)} />
                {cess > 0 && <Row label={`Labour Cess (${cess}%)`} value={fmtAmt(cessAmt)} />}
                <Row label={`GST (${gstRate}%)`} value={fmtAmt(gstAmt)} />
              </>
            )}
            <Row label="Gross Invoice Value" value={fmtAmt(gross)} highlight />
            <Row label="Wing" value={`${wing} Wing`} />
            <Row label="Engineer" value={eng ? `${eng.name} (${eng.designation})` : '—'} />
          </div>
        </div>
      </div>

      {/* System ID preview */}
      <div className="mt-4 bg-ap-blue-light border border-ap-blue-mid rounded-xl px-5 py-3 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-0.5">System Bill ID (Preview)</div>
          <div className="font-mono text-sm font-bold text-ap-blue-mid">{billIdPreview}</div>
        </div>
        <div className="text-ap-blue-mid text-xl">🔖</div>
      </div>
    </div>
  );
}

/* ─── Success Screen ──────────────────────────────────────────────── */
function SuccessScreen({ billId, onMyBills, onNewBill }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-ap-green flex items-center justify-center shadow-lg mb-5">
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-ap-gray-800 mb-1.5">Bill Submitted Successfully!</h2>
      <p className="text-sm text-ap-gray-500 mb-5 max-w-sm">Your bill has been submitted and forwarded to the assigned engineer for verification.</p>

      {/* Bill ID badge */}
      <div className="bg-ap-gray-50 border border-ap-gray-200 rounded-xl px-6 py-4 mb-6 w-full max-w-md">
        <div className="text-xs font-semibold text-ap-gray-400 uppercase tracking-wide mb-1.5">Your Bill ID</div>
        <div className="font-mono font-bold text-ap-blue-mid text-base break-all">{billId}</div>
        <p className="text-xs text-ap-gray-400 mt-2">Use this ID to track your bill status in <strong>My Bills</strong>.</p>
      </div>

      {/* Mini circle timeline */}
      {(() => {
        /* Flowchart milestones M1–M10 (HQ LOA Processing is log-only, omitted) */
        const stages = [
          { label: 'Submitted',  done: true },  // M1
          { label: 'AEE'        },              // M2
          { label: 'DEE'        },              // M3
          { label: 'EE'         },              // M4
          { label: 'Posted'     },              // M5+M6
          { label: 'Field SAO'  },              // M7
          { label: 'HQ SAO'     },              // M8
          { label: 'Loans/B&R'  },              // M9a+M9b
          { label: 'Paid'       },              // M10
        ];
        return (
          <div className="w-full max-w-md mb-6">
            <p className="text-[10px] font-semibold text-ap-gray-400 uppercase tracking-widest text-center mb-3">
              Processing Pipeline
            </p>
            <div className="flex items-start">
              {stages.map((s, i) => (
                <div key={s.label} className="flex items-start flex-1 last:flex-none">
                  {/* Node */}
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors
                      ${s.done ? 'bg-ap-green shadow-sm' : 'bg-white border-2 border-ap-gray-200'}`}>
                      {s.done && (
                        <svg className="w-[7px] h-[7px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-[8px] leading-none font-medium"
                      style={{ color: s.done ? '#1A7A4A' : '#C0C8D4' }}>
                      {s.label}
                    </span>
                  </div>
                  {/* Connector */}
                  {i < stages.length - 1 && (
                    <div className={`flex-1 h-px mt-[5px] mx-0.5 ${s.done ? 'bg-ap-green' : 'bg-ap-gray-100'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* CTAs */}
      <div className="flex gap-3 w-full max-w-sm">
        <Button variant="secondary" className="flex-1" onClick={onMyBills}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          My Bills
        </Button>
        <Button variant="primary" className="flex-1" onClick={onNewBill}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          New Bill
        </Button>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────── */
export default function SubmitInvoice({ onNavigate }) {
  const { user, showToast, submittedBills, setSubmittedBills } = useApp();
  const vendorId = String(user?.id);
  const myPOs    = PO_DATA.filter(p => String(p.vendorCode) === vendorId);

  // Form state
  const [step,       setStep]    = useState(1);
  const [submitted,  setSubmit]  = useState(false);
  const [doneId,     setDoneId]  = useState('');

  const [invType,    setType]    = useState('Material');
  const [poNo,       setPo]      = useState('');
  const [eInvNo,     setEInv]    = useState('');
  const [invDate,    setDate]    = useState(new Date().toISOString().slice(0, 10));
  const [baseAmt,    setBase]    = useState('');
  const [gstRate,    setGst]     = useState('');
  const [labourCess, setCess]    = useState('');
  const [hrAmt,      setHrAmt]   = useState('');
  const [wing,       setWing]    = useState('');
  const [engineer,   setEngineer]= useState('');

  const poInfo      = myPOs.find(p => p.poNo === poNo);
  const base        = parseFloat(baseAmt) || 0;
  const gst         = parseFloat(gstRate) || 0;
  const cess        = parseFloat(labourCess) || 0;
  const cessAmt     = base * cess / 100;
  const gstAmt      = (base + cessAmt) * gst / 100;
  const gross       = invType === 'HR'
    ? parseFloat(hrAmt) || 0
    : ['Retention','Penalty','Other'].includes(invType)
      ? parseFloat(baseAmt) || 0
      : base + cessAmt + gstAmt;

  const billIdPreview = poNo
    ? genBillId(poNo, invType).replace(/\d{3}$/, '###')
    : 'VBTS-XXXXXX-???-XXXXXX-###';

  const validate = () => {
    if (step === 1) return true;
    if (step === 2) {
      if (!poNo)   { showToast('Please select a Purchase Order.', true); return false; }
      if (!eInvNo) { showToast('Please enter an e-Invoice number.', true); return false; }
      return true;
    }
    if (step === 3) {
      if (['Material','Service'].includes(invType) && (!base || !gstRate)) {
        showToast('Base amount and GST rate are required.', true); return false;
      }
      if (invType === 'HR' && !parseFloat(hrAmt)) {
        showToast('Please enter the HR amount.', true); return false;
      }
      return true;
    }
    if (step === 4) {
      if (!wing)     { showToast('Please select a wing.', true); return false; }
      if (!engineer) { showToast('Please select an engineer.', true); return false; }
      return true;
    }
    return true;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, STEPS.length)); };
  const back = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = () => {
    const eng    = EMPLOYEES.find(e => String(e.id) === engineer);
    const billId = genBillId(poNo, invType);
    const bill   = {
      billId, eInvNo, poNo, type: invType, vendorId,
      date: new Date().toLocaleDateString('en-IN'),
      status: 'Submitted',
      grossAmt: gross,
      pendingWith: eng?.name || engineer,
      pendingDesig: eng?.designation || '',
      wing,
      log: [
        { date: new Date().toLocaleDateString('en-IN'), action: 'Bill Submitted by Vendor', by: user?.name, status: 'Submitted' },
        { date: new Date().toLocaleDateString('en-IN'), action: `Forwarded to ${eng?.designation || ''} ${eng?.name || engineer} (${wing} Wing)`, by: 'System', status: 'Pending with AEE' },
      ],
    };
    setSubmittedBills(prev => [...prev, bill]);
    setDoneId(billId);
    setSubmit(true);
  };

  const resetForm = () => {
    setStep(1); setSubmit(false); setDoneId('');
    setType('Material'); setPo(''); setEInv('');
    setDate(new Date().toISOString().slice(0, 10));
    setBase(''); setGst(''); setCess(''); setHrAmt('');
    setWing(''); setEngineer('');
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-ap-gray-200 shadow-sm p-8">
          <SuccessScreen
            billId={doneId}
            onMyBills={() => onNavigate?.('bills')}
            onNewBill={resetForm}
          />
        </div>
      </div>
    );
  }

  /* ── Wizard ── */
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-ap-gray-200 shadow-sm p-6">

        {/* Stepper */}
        <StepperBar current={step} />

        {/* Step content */}
        <div className="min-h-[340px]">
          {step === 1 && <Step1Type invType={invType} setType={setType} />}
          {step === 2 && <Step2PO poNo={poNo} setPo={setPo} eInvNo={eInvNo} setEInv={setEInv} invDate={invDate} setDate={setDate} myPOs={myPOs} poInfo={poInfo} />}
          {step === 3 && <Step3Amount invType={invType} poNo={poNo} vendorId={vendorId} baseAmt={baseAmt} setBase={setBase} gstRate={gstRate} setGst={setGst} labourCess={labourCess} setCess={setCess} hrAmt={hrAmt} setHrAmt={setHrAmt} />}
          {step === 4 && <Step4Assignment wing={wing} setWing={setWing} engineer={engineer} setEngineer={setEngineer} />}
          {step === 5 && <Step5Review invType={invType} poNo={poNo} eInvNo={eInvNo} invDate={invDate} baseAmt={baseAmt} gstRate={gstRate} labourCess={labourCess} hrAmt={hrAmt} wing={wing} engineer={engineer} billIdPreview={billIdPreview} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-ap-gray-100">
          <div>
            {step > 1 && (
              <Button variant="ghost" onClick={back}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-ap-gray-400">Step {step} of {STEPS.length}</span>
            {step < STEPS.length ? (
              <Button variant="primary" onClick={next}>
                Continue
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </Button>
            ) : (
              <Button variant="success" onClick={handleSubmit}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Submit Bill
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
