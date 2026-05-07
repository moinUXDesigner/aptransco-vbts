import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import TimelineSidebar from '../../components/ui/TimelineSidebar';

function fmtAmt(v) { return '₹' + Number(v||0).toLocaleString('en-IN', {minimumFractionDigits:2}); }

/* Flowchart milestone sequence (M1 → M10) */
const FLOW = [
  'Submitted',              // M1  – Vendor
  'Pending with AEE',       // M2  – AEE (GR/SE, Form-13/14)
  'Pending with DEE',       // M3  – DEE (recoveries & docs)
  'Pending with EE',        // M4  – EE (forwards to Field Accounts)
  'Invoice Posted',         // M5+M6 – Field AOs (simultaneous)
  'Pending with Field SAO', // M7  – Field SAO (LOA review)
  'Pending with HQ SAO',    // M8  – HQ SAO (LOA approval)
  'HQ LOA Processing',      // Log only – auto after M8
  'LOA Processing',         // M9a+M9b – Loans & B&R (parallel)
  'Paid',                   // M10 – HQ SAO (final payment)
];

/* Department label automatically set on each advance */
const STAGE_DEPT = {
  'Submitted':              'AEE – Technical Wing',
  'Pending with AEE':       'AEE – Technical Wing',
  'Pending with DEE':       'DEE – Engineering Division',
  'Pending with EE':        'EE – Executive Engineer',
  'Invoice Posted':         'Field Accounts (AAO/JAO)',
  'Pending with Field SAO': 'Field SAO – Field Office',
  'Pending with HQ SAO':    'HQ SAO – Headquarters',
  'HQ LOA Processing':      'HQ Subordinates',
  'LOA Processing':         'Loans & B&R Section (HQ)',
  'Paid':                   null,
};

export default function PendingBills() {
  const { submittedBills, setSubmittedBills, showToast } = useApp();
  const [selectedBill, setSelectedBill] = useState(null);
  const pending = submittedBills.filter(b => !['Paid','Rejected'].includes(b.status));

  const advance = (billId) => {
    setSubmittedBills(prev => prev.map(b => {
      if (b.billId !== billId) return b;
      const idx  = FLOW.indexOf(b.status);
      const next = FLOW[Math.min(idx + 1, FLOW.length - 1)];
      const dept = STAGE_DEPT[next];
      const logNote = next === 'HQ LOA Processing'
        ? 'HQ SAO sends to subordinates — status auto-updated (log only)'
        : `Status advanced to ${next}`;
      const updated = {
        ...b,
        status:      next,
        pendingWith: dept || null,
        pendingDesig:'',
        log: [...(b.log||[]), {
          date:   new Date().toLocaleDateString('en-IN'),
          action: logNote,
          by:     'Employee',
          status: next,
        }],
      };
      showToast(`Bill ${billId} → ${next}`);
      if (selectedBill?.billId === billId) setSelectedBill(updated);
      return updated;
    }));
  };

  const reject = (billId) => {
    setSubmittedBills(prev => prev.map(b =>
      b.billId === billId
        ? { ...b, status: 'Rejected', pendingWith: null, log: [...(b.log||[]), { date: new Date().toLocaleDateString('en-IN'), action: 'Bill Rejected', by: 'Employee', status: 'Rejected' }] }
        : b
    ));
    showToast(`Bill ${billId} rejected.`, true);
    if (selectedBill?.billId === billId) setSelectedBill(null);
  };

  return (
    <>
      <SectionCard title="Pending Bills – Submitted by Vendors" noPad>
        {pending.length === 0 ? (
          <div className="py-12 text-center text-ap-gray-400">No submitted bills pending at this time. Bills submitted by vendors will appear here.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr>
                  {['System ID','Vendor ID','Invoice No.','PO No.','Type','Gross Amt (₹)','Date','Status','Pending With','Actions'].map(h => (
                    <th key={h} className={`${h.includes('₹') ? 'text-right' : 'text-left'} px-3.5 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200 whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map((b) => (
                  <tr
                    key={b.billId}
                    className={`border-b border-ap-gray-100 hover:bg-ap-gray-50 transition-colors ${selectedBill?.billId === b.billId ? 'bg-ap-blue-light' : ''}`}
                  >
                    <td className="px-3.5 py-2.5 font-sans font-bold text-ap-blue-mid text-xs">{b.billId}</td>
                    <td className="px-3.5 py-2.5 text-xs">{b.vendorId}</td>
                    <td className="px-3.5 py-2.5 text-xs">{b.eInvNo}</td>
                    <td className="px-3.5 py-2.5 text-xs">{b.poNo}</td>
                    <td className="px-3.5 py-2.5"><Badge status={b.type} /></td>
                    <td className="px-3.5 py-2.5 font-sans font-bold text-ap-blue text-right">{fmtAmt(b.grossAmt)}</td>
                    <td className="px-3.5 py-2.5 text-xs text-ap-gray-600">{b.date}</td>
                    <td className="px-3.5 py-2.5"><Badge status={b.status} /></td>
                    <td className="px-3.5 py-2.5 text-xs">{b.pendingWith || '—'}</td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex gap-1 flex-wrap">
                        <Button size="xs" variant="outline" onClick={() => setSelectedBill(selectedBill?.billId === b.billId ? null : b)}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          Timeline
                        </Button>
                        <Button size="xs" variant="primary" onClick={() => advance(b.billId)}>Advance →</Button>
                        <Button size="xs" variant="danger"  onClick={() => reject(b.billId)}>Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <TimelineSidebar bill={selectedBill} onClose={() => setSelectedBill(null)} />
    </>
  );
}
