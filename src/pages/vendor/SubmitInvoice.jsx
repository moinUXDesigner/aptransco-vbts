import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PO_DATA, VMAT_DATA, VSVC_DATA, EMPLOYEES } from '../../data/mockData';
import SectionCard from '../../components/ui/SectionCard';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const INVOICE_TYPES = [
  { value: 'Material',   label: '1. Material' },
  { value: 'Service',    label: '2. Service' },
  { value: 'Retention',  label: '3. Retention' },
  { value: 'Penalty',    label: '4. Penalty' },
  { value: 'Other',      label: '5. Other Recoveries' },
  { value: 'HR',         label: '6. HR (Hand Receipt)' },
];

const GST_RATES = ['5','12','18','28'];
const WINGS = ['Electrical','Civil','Telecom'];

let invoiceSerial = {};
function genBillId(poNo, type) {
  const typeCode = { Material:'MAT', Service:'SVC', Retention:'RET', Penalty:'PEN', Other:'OTH', HR:'HR' }[type] || 'GEN';
  const key = poNo + '_' + type;
  invoiceSerial[key] = (invoiceSerial[key] || 0) + 1;
  const seq = String(invoiceSerial[key]).padStart(3,'0');
  const dt  = new Date().toISOString().slice(2,10).replace(/-/g,'');
  return `VBTS-${poNo.slice(-6)}-${typeCode}-${dt}-${seq}`;
}

export default function SubmitInvoice() {
  const { user, showToast, submittedBills, setSubmittedBills } = useApp();
  const vendorId = String(user?.id);

  const myPOs = PO_DATA.filter(p => String(p.vendorCode) === vendorId);

  const [poNo,        setPo]       = useState('');
  const [eInvNo,      setEInv]     = useState('');
  const [invDate,     setDate]     = useState(new Date().toISOString().slice(0,10));
  const [invType,     setType]     = useState('Material');
  const [baseAmt,     setBase]     = useState('');
  const [gstRate,     setGst]      = useState('');
  const [labourCess,  setCess]     = useState('');
  const [wing,        setWing]     = useState('');
  const [engineer,    setEngineer] = useState('');
  const [hrAmt,       setHrAmt]    = useState('');

  const poInfo = myPOs.find(p => p.poNo === poNo);

  const base = parseFloat(baseAmt) || 0;
  const gst  = parseFloat(gstRate) || 0;
  const cess = parseFloat(labourCess) || 0;
  const cessAmt = base * cess / 100;
  const gstAmt  = (base + cessAmt) * gst / 100;
  const gross   = base + cessAmt + gstAmt;

  const engineers = EMPLOYEES.filter(e => {
    if (wing === 'Electrical') return e.subArea === 'Engineering-Ele';
    if (wing === 'Civil')      return e.subArea === 'Engineering-Civ';
    if (wing === 'Telecom')    return e.subArea === 'Engineering-Tel';
    return false;
  });

  const retentionInfo = (() => {
    if (!poNo || !['Retention','HR'].includes(invType)) return null;
    const mRet = VMAT_DATA.filter(r => r.poNo === poNo && String(r.vendorId) === vendorId).reduce((s,r) => s+r.retention,0);
    const sRet = VSVC_DATA.filter(r => r.poNo === poNo && String(r.vendorId) === vendorId).reduce((s,r) => s+r.retention,0);
    return mRet + sRet;
  })();

  function fmtAmt(v) { return '₹' + Number(v||0).toLocaleString('en-IN', {minimumFractionDigits:2}); }

  const handleSubmit = () => {
    if (!poNo)   { showToast('Please select a PO.', true); return; }
    if (!eInvNo) { showToast('Please enter an e-Invoice number.', true); return; }
    if (['Material','Service'].includes(invType) && (!base || !gstRate)) { showToast('Invoice amount and GST rate are required.', true); return; }
    if (!wing)     { showToast('Please select a wing.', true); return; }
    if (!engineer) { showToast('Please select an engineer.', true); return; }

    const eng = EMPLOYEES.find(e => String(e.id) === engineer);
    const billId = genBillId(poNo, invType);
    const bill = {
      billId, eInvNo, poNo, type: invType, vendorId,
      date: new Date().toLocaleDateString('en-IN'),
      status: 'Submitted',
      grossAmt: invType === 'HR' ? parseFloat(hrAmt)||0 : gross,
      pendingWith: eng?.name || engineer,
      pendingDesig: eng?.designation || '',
      wing,
      log: [
        { date: new Date().toLocaleDateString('en-IN'), action: 'Bill Submitted by Vendor', by: user?.name, status: 'Submitted' },
        { date: new Date().toLocaleDateString('en-IN'), action: `Forwarded to ${eng?.designation || ''} ${eng?.name || engineer} (${wing} Wing)`, by: 'System', status: 'Pending with AEE' }
      ]
    };
    setSubmittedBills(prev => [...prev, bill]);
    showToast(`✅ Bill submitted! ID: ${billId}`);
    setPo(''); setEInv(''); setBase(''); setGst(''); setCess(''); setWing(''); setEngineer(''); setHrAmt('');
  };

  return (
    <SectionCard title="New Submission">
      <div className="flex gap-6 flex-wrap">
        {/* Left: Main form */}
        <div className="flex-1 min-w-72 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">Purchase Order</label>
              <select value={poNo} onChange={e => setPo(e.target.value)}
                className="w-full border border-ap-gray-200 rounded px-3 py-2 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid">
                <option value="">— Select PO —</option>
                {myPOs.map(p => <option key={p.poNo} value={p.poNo}>{p.poNo} – {p.workName?.substring(0,40)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">e-Invoice Number</label>
              <input value={eInvNo} onChange={e => setEInv(e.target.value)} placeholder="Enter e-Invoice number"
                className="w-full border border-ap-gray-200 rounded px-3 py-2 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">Invoice Date</label>
              <input type="date" value={invDate} onChange={e => setDate(e.target.value)}
                className="w-full border border-ap-gray-200 rounded px-3 py-2 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid" />
            </div>
          </div>

          {poInfo && (
            <Alert variant="info">📋 <b>{poInfo.poNo}</b> | {poInfo.workName}<br />Scheme: {poInfo.schemeDesc} | Type: {poInfo.purchDocType}</Alert>
          )}

          {/* Amount section */}
          {['Material','Service'].includes(invType) && (
            <div>
              <div className="text-sm font-bold text-ap-blue mb-3">💰 Invoice Amount & Tax Calculation</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">Base Invoice Amount (₹)</label>
                  <input type="number" value={baseAmt} onChange={e => setBase(e.target.value)} placeholder="0.00"
                    className="w-full border border-ap-gray-200 rounded px-3 py-2 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">GST Rate</label>
                  <select value={gstRate} onChange={e => setGst(e.target.value)}
                    className="w-full border border-ap-gray-200 rounded px-3 py-2 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid">
                    <option value="">— Select GST % —</option>
                    {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
                {invType === 'Service' && (
                  <div>
                    <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">Labour Cess</label>
                    <select value={labourCess} onChange={e => setCess(e.target.value)}
                      className="w-full border border-ap-gray-200 rounded px-3 py-2 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid">
                      <option value="">— Select % —</option>
                      <option value="1">1%</option>
                      <option value="2">2%</option>
                    </select>
                  </div>
                )}
              </div>
              {base > 0 && gstRate && (
                <div className="bg-ap-gray-50 border border-ap-gray-200 rounded-md p-4">
                  <div className="text-xs font-bold text-ap-gray-600 uppercase tracking-wide mb-2">Tax Breakdown</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-ap-gray-600">Base Amount:</span><span className="font-semibold">{fmtAmt(base)}</span></div>
                    {cess > 0 && <div className="flex justify-between"><span className="text-ap-gray-600">Labour Cess ({cess}%):</span><span className="font-semibold">{fmtAmt(cessAmt)}</span></div>}
                    <div className="flex justify-between"><span className="text-ap-gray-600">GST ({gstRate}%):</span><span className="font-semibold">{fmtAmt(gstAmt)}</span></div>
                    <div className="h-px bg-ap-gray-200 my-1" />
                    <div className="flex justify-between"><span className="font-bold text-ap-blue">Gross Invoice Value:</span><span className="font-sans font-bold text-ap-blue text-base">{fmtAmt(gross)}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {invType === 'HR' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">HR Amount (₹)</label>
                <input type="number" value={hrAmt} onChange={e => setHrAmt(e.target.value)} placeholder="0.00"
                  className="w-full border border-ap-gray-200 rounded px-3 py-2 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid" />
              </div>
            </div>
          )}

          {retentionInfo !== null && (
            <div className="bg-ap-gray-50 border border-ap-gray-200 rounded-md p-4 grid grid-cols-3 gap-4">
              <div><div className="text-xs text-ap-gray-400 uppercase font-semibold">Total Recovered</div><div className="font-sans font-bold text-ap-blue text-lg">{fmtAmt(retentionInfo)}</div></div>
              <div><div className="text-xs text-ap-gray-400 uppercase font-semibold">Released So Far</div><div className="font-sans font-bold text-ap-blue text-lg">₹0.00</div></div>
              <div><div className="text-xs text-ap-gray-400 uppercase font-semibold">Balance Available</div><div className="font-sans font-bold text-ap-green text-lg">{fmtAmt(retentionInfo)}</div></div>
            </div>
          )}

          {/* Wing & Engineer */}
          <div>
            <div className="text-sm font-bold text-ap-blue mb-3">📡 Wing & Engineer Selection</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">Select Wing</label>
                <select value={wing} onChange={e => { setWing(e.target.value); setEngineer(''); }}
                  className="w-full border border-ap-gray-200 rounded px-3 py-2 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid">
                  <option value="">— Select Wing —</option>
                  {WINGS.map(w => <option key={w} value={w}>{w} Wing</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">Assigned Engineer</label>
                <select value={engineer} onChange={e => setEngineer(e.target.value)}
                  className="w-full border border-ap-gray-200 rounded px-3 py-2 text-sm bg-ap-gray-50 focus:outline-none focus:border-ap-blue-mid">
                  <option value="">— Select Engineer —</option>
                  {engineers.map(e => <option key={e.id} value={e.id}>{e.name} ({e.designation})</option>)}
                </select>
              </div>
            </div>
            <p className="text-xs text-ap-gray-400 mt-1.5">ℹ️ Only one wing and one engineer can be selected per submission.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => showToast(`💾 Draft saved for ${poNo || 'selected PO'}`)}>💾 Save Draft</Button>
            <Button variant="primary" onClick={handleSubmit}>📤 Submit Bill</Button>
          </div>
        </div>

        {/* Right: Type selector + preview */}
        <div className="min-w-56">
          <div className="bg-ap-blue-light border border-ap-blue-mid rounded-lg p-4 mb-3">
            <div className="text-xs font-bold text-ap-blue mb-3">📋 Select Invoice / HR Type</div>
            <select value={invType} onChange={e => setType(e.target.value)}
              className="w-full border border-ap-gray-200 rounded px-3 py-2 text-sm font-semibold bg-white focus:outline-none focus:border-ap-blue-mid">
              {INVOICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="bg-ap-gray-50 border border-ap-gray-200 rounded px-4 py-3">
            <div className="text-xs text-ap-gray-400 uppercase tracking-wide mb-1">System Generated ID</div>
            <div className="font-sans font-bold text-ap-blue-mid text-sm">
              {poNo ? genBillId(poNo, invType).replace(/\d+$/, '###') : '— Select PO & Type —'}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
