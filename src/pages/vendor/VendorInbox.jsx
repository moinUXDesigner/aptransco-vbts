import { useApp } from '../../context/AppContext';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';

function fmtAmt(v) { return '₹' + Number(v||0).toLocaleString('en-IN', {minimumFractionDigits:2}); }

export default function VendorInbox() {
  const { user, submittedBills } = useApp();
  const vendorId = String(user?.id);
  const myBills  = submittedBills.filter(b => String(b.vendorId) === vendorId);

  const actionReqd = myBills.filter(b => ['Sent Back by Accounts','Sent Back by HQ','Rejected'].includes(b.status));
  const inProgress = myBills.filter(b => !['Paid','Rejected','Sent Back by Accounts','Sent Back by HQ'].includes(b.status));
  const completed  = myBills.filter(b => b.status === 'Paid');

  const BillCard = ({ bill }) => (
    <div className={`border rounded-lg p-4 mb-3 flex gap-3 ${['Rejected','Sent Back by Accounts','Sent Back by HQ'].includes(bill.status) ? 'border-l-4 border-l-ap-red bg-ap-red-light/50' : 'bg-white border-ap-gray-200'}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-sans font-bold text-ap-blue-mid text-xs">{bill.billId}</span>
          <Badge status={bill.status} />
          <Badge status={bill.type} />
        </div>
        <div className="text-sm font-medium text-ap-gray-800">PO: {bill.poNo} · e-Invoice: {bill.eInvNo}</div>
        <div className="text-xs text-ap-gray-400 mt-0.5">Submitted: {bill.date} · Amount: {fmtAmt(bill.grossAmt)}</div>
        {bill.pendingWith && <div className="text-xs text-ap-gray-600 mt-0.5">Pending with: <b>{bill.pendingWith}</b> ({bill.pendingDesig})</div>}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <SectionCard title="📬 Action Required">
        {actionReqd.length === 0 ? (
          <p className="text-ap-gray-400 text-sm py-6 text-center">No bills require your action right now.</p>
        ) : (
          <>
            <Alert variant="warning" className="mb-3">⚠️ These bills have been sent back or rejected. Please review and resubmit after making corrections.</Alert>
            {actionReqd.map((b, i) => <BillCard key={i} bill={b} />)}
          </>
        )}
      </SectionCard>

      <SectionCard title="📂 In Progress">
        <Alert variant="info" className="mb-3">Bills currently being processed by APTRANSCO. They will move to <b>Completed</b> once posted by HQ wing.</Alert>
        {inProgress.length === 0
          ? <p className="text-ap-gray-400 text-sm py-4 text-center">No bills currently in progress.</p>
          : inProgress.map((b, i) => <BillCard key={i} bill={b} />)}
      </SectionCard>

      <SectionCard title="✅ Completed">
        <Alert variant="success" className="mb-3">Bills fully processed and paid. These also appear in <b>My Bills</b>.</Alert>
        {completed.length === 0
          ? <p className="text-ap-gray-400 text-sm py-4 text-center">No completed bills yet.</p>
          : completed.map((b, i) => <BillCard key={i} bill={b} />)}
      </SectionCard>
    </div>
  );
}
