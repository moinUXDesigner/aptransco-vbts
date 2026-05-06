import { useApp } from '../../context/AppContext';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

function fmtAmt(v) { return '₹' + Number(v||0).toLocaleString('en-IN', {minimumFractionDigits:2}); }

export default function PendingBills() {
  const { submittedBills, setSubmittedBills, showToast } = useApp();
  const pending = submittedBills.filter(b => !['Paid','Rejected'].includes(b.status));

  const advance = (billId) => {
    const FLOW = ['Submitted','Pending with AEE','Under Verification','Reviewed by Engineer','Form13 Updated','Form14 Updated','Approved','Paid'];
    setSubmittedBills(prev => prev.map(b => {
      if (b.billId !== billId) return b;
      const idx = FLOW.indexOf(b.status);
      const next = FLOW[Math.min(idx + 1, FLOW.length - 1)];
      showToast(`Bill ${billId} → ${next}`);
      return { ...b, status: next, log: [...(b.log||[]), { date: new Date().toLocaleDateString('en-IN'), action: `Status → ${next}`, by: 'Employee', status: next }] };
    }));
  };

  const reject = (billId) => {
    setSubmittedBills(prev => prev.map(b => b.billId === billId ? { ...b, status: 'Rejected' } : b));
    showToast(`Bill ${billId} rejected.`, true);
  };

  return (
    <SectionCard title="Pending Bills – Submitted by Vendors" noPad>
      {pending.length === 0 ? (
        <div className="py-12 text-center text-ap-gray-400">No submitted bills pending at this time. Bills submitted by vendors will appear here.</div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {['System ID','Vendor ID','Invoice No.','PO No.','Type','Gross Amt (₹)','Date','Status','Pending With','Actions'].map(h => (
                <th key={h} className="text-left px-3.5 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pending.map((b, i) => (
              <tr key={i} className="border-b border-ap-gray-100 hover:bg-ap-gray-50">
                <td className="px-3.5 py-2.5 font-sans font-bold text-ap-blue-mid text-xs">{b.billId}</td>
                <td className="px-3.5 py-2.5 text-xs">{b.vendorId}</td>
                <td className="px-3.5 py-2.5 text-xs">{b.eInvNo}</td>
                <td className="px-3.5 py-2.5 text-xs">{b.poNo}</td>
                <td className="px-3.5 py-2.5"><Badge status={b.type} /></td>
                <td className="px-3.5 py-2.5 font-sans font-bold text-ap-blue">{fmtAmt(b.grossAmt)}</td>
                <td className="px-3.5 py-2.5 text-xs text-ap-gray-600">{b.date}</td>
                <td className="px-3.5 py-2.5"><Badge status={b.status} /></td>
                <td className="px-3.5 py-2.5 text-xs">{b.pendingWith || '—'}</td>
                <td className="px-3.5 py-2.5">
                  <div className="flex gap-1">
                    <Button size="xs" variant="primary" onClick={() => advance(b.billId)}>Advance →</Button>
                    <Button size="xs" variant="danger"  onClick={() => reject(b.billId)}>Reject</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}
