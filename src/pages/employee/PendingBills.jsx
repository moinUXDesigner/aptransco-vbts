import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import TimelineSidebar from '../../components/ui/TimelineSidebar';
import BillReviewModal from '../../components/ui/BillReviewModal';

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

/* Build a human-readable log note from the review form values */
function buildLogNote(status, values) {
  const parts = [];
  if (values.grSeNo)       parts.push(`GR/SE: ${values.grSeNo}`);
  if (values.form13Ref)    parts.push(`Form-13: ${values.form13Ref}`);
  if (values.form14Ref)    parts.push(`Form-14: ${values.form14Ref}`);
  if (values.invoiceDocNo) parts.push(`SAP Invoice: ${values.invoiceDocNo}`);
  if (values.loaNo)        parts.push(`LOA No: ${values.loaNo}`);
  if (values.transRef)     parts.push(`Txn Ref: ${values.transRef}`);
  if (values.recoveriesOk) parts.push('Recoveries: ✓');
  if (values.docsOk)       parts.push('Documents: ✓');
  if (values.loaVerified)  parts.push('LOA Verified: ✓');
  if (values.loaApproved)  parts.push('LOA Approved: ✓');
  if (values.eeApproved)   parts.push('EE Approval: ✓');
  if (values.m9aLoans)     parts.push('M9a Loans: ✓');
  if (values.m9bBnR)       parts.push('M9b B&R: ✓');
  const detail = parts.join(' · ');
  const remark = values.remarks ? ` | Remarks: ${values.remarks}` : '';
  return `${detail}${remark}`.trim() || `Reviewed & approved at ${status}`;
}

export default function PendingBills() {
  const { submittedBills, setSubmittedBills, showToast } = useApp();
  const [selectedBill, setSelectedBill] = useState(null);  // timeline sidebar
  const [reviewBill,   setReviewBill]   = useState(null);  // review modal

  const pending = submittedBills.filter(b => !['Paid','Rejected'].includes(b.status));

  /* Called by modal on Approve */
  const handleApprove = (billId, formValues, nextStatus) => {
    setSubmittedBills(prev => prev.map(b => {
      if (b.billId !== billId) return b;

      const next = nextStatus || FLOW[Math.min(FLOW.indexOf(b.status) + 1, FLOW.length - 1)];
      const dept = STAGE_DEPT[next];
      const logNote = buildLogNote(b.status, formValues);

      const newLog = [...(b.log || []), {
        date:   new Date().toLocaleDateString('en-IN'),
        action: logNote,
        by:     'Employee',
        status: next,
      }];

      /* If advancing to HQ LOA Processing (log-only), immediately add the auto-log entry */
      let finalLog = newLog;
      let finalStatus = next;
      let finalDept = dept;
      if (next === 'HQ LOA Processing') {
        finalLog = [...newLog, {
          date:   new Date().toLocaleDateString('en-IN'),
          action: 'HQ SAO sends to subordinates — HQ LOA Processing (auto log)',
          by:     'System',
          status: 'HQ LOA Processing',
        }];
      }

      const updated = {
        ...b,
        status:      finalStatus,
        pendingWith: finalDept || null,
        pendingDesig: '',
        log: finalLog,
      };

      showToast(`Bill ${billId} → ${next}`);
      if (selectedBill?.billId === billId) setSelectedBill(updated);
      return updated;
    }));
    setReviewBill(null);
  };

  const handleReject = (billId) => {
    setSubmittedBills(prev => prev.map(b =>
      b.billId === billId
        ? { ...b, status: 'Rejected', pendingWith: null, log: [...(b.log||[]), { date: new Date().toLocaleDateString('en-IN'), action: 'Bill Rejected by Employee', by: 'Employee', status: 'Rejected' }] }
        : b
    ));
    showToast(`Bill ${billId} rejected.`, true);
    if (selectedBill?.billId === billId) setSelectedBill(null);
    setReviewBill(null);
  };

  return (
    <>
      <SectionCard title="Pending Bills – Submitted by Vendors" noPad>
        {pending.length === 0 ? (
          <div className="py-12 text-center text-ap-gray-400">
            No submitted bills pending at this time. Bills submitted by vendors will appear here.
          </div>
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
                {pending.map((b) => {
                  const isReviewing = reviewBill?.billId === b.billId;
                  const isTimeline  = selectedBill?.billId === b.billId;
                  return (
                    <tr
                      key={b.billId}
                      className={`border-b border-ap-gray-100 hover:bg-ap-gray-50 transition-colors
                        ${isReviewing ? 'bg-yellow-50' : isTimeline ? 'bg-ap-blue-light' : ''}`}
                    >
                      <td className="px-3.5 py-2.5 font-mono font-bold text-ap-blue-mid text-xs">{b.billId}</td>
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
                          {/* Timeline */}
                          <Button
                            size="xs"
                            variant={isTimeline ? 'primary' : 'outline'}
                            onClick={() => setSelectedBill(isTimeline ? null : b)}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Timeline
                          </Button>
                          {/* Review – opens the stage-specific form */}
                          <Button
                            size="xs"
                            variant="warning"
                            onClick={() => setReviewBill(b)}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Review
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <TimelineSidebar bill={selectedBill} onClose={() => setSelectedBill(null)} />

      <BillReviewModal
        bill={reviewBill}
        onClose={() => setReviewBill(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  );
}
