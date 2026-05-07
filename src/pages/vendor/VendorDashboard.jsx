import { useApp } from '../../context/AppContext';
import { PO_DATA, VMAT_DATA, VSVC_DATA } from '../../data/mockData';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

function fmtAmt(v) { return '₹' + Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }); }

export default function VendorDashboard({ onNavigate }) {
  const { user, submittedBills } = useApp();
  const vendorId = String(user?.id);

  const myBills    = submittedBills.filter(b => String(b.vendorId) === vendorId);
  const myPOs      = PO_DATA.filter(p => String(p.vendorCode) === vendorId);
  const matRecs    = VMAT_DATA.filter(r => String(r.vendorId) === vendorId);
  const svcRecs    = VSVC_DATA.filter(r => String(r.vendorId) === vendorId);
  const totalPaid  = [...matRecs, ...svcRecs].reduce((s, r) => s + (r.netAmt || r.netPaid || 0), 0);
  const pending    = myBills.filter(b => !['Paid','Rejected'].includes(b.status));
  const actionReqd = myBills.filter(b => ['Sent Back by Accounts','Sent Back by HQ','Rejected'].includes(b.status));

  const STATUS_GROUPS = [
    { label: 'Submitted', count: myBills.filter(b => b.status === 'Submitted').length, color: 'bg-ap-blue-light', tc: 'text-ap-blue-mid' },
    { label: 'In Progress', count: pending.filter(b => !['Submitted'].includes(b.status)).length, color: 'bg-ap-orange-light', tc: 'text-ap-orange' },
    { label: 'Paid', count: myBills.filter(b => b.status === 'Paid').length, color: 'bg-ap-green-light', tc: 'text-ap-green' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="My POs" value={myPOs.length} icon="📋" sub="Assigned purchase orders" />
        <StatCard label="Total Bills" value={myBills.length} icon="🧾" sub="All time submitted" />
        <StatCard label="Pending Action" value={actionReqd.length} icon="⚠️" accent="text-ap-red" sub="Requires your attention" />
        <StatCard label="Total Paid" value={`₹${(totalPaid/10000000).toFixed(2)} Cr`} icon="✅" accent="text-ap-green" sub="Net amount received" />
      </div>

      {/* Bill Status Summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {STATUS_GROUPS.map(g => (
          <div key={g.label} className={`${g.color} rounded-lg p-4 border border-white/50`}>
            <div className={`text-2xl font-bold font-sans ${g.tc}`}>{g.count}</div>
            <div className={`text-sm font-medium ${g.tc}`}>{g.label}</div>
          </div>
        ))}
      </div>

      {/* Action Required Alert */}
      {actionReqd.length > 0 && (
        <div className="bg-ap-red-light border-l-4 border-ap-red rounded text-sm px-4 py-3 mb-5 flex items-center justify-between">
          <span className="text-ap-red font-medium">⚠️ {actionReqd.length} bill(s) need your attention (sent back or rejected)</span>
          <Button size="sm" variant="danger" onClick={() => onNavigate('inbox')}>View Inbox</Button>
        </div>
      )}

      {/* Recent Submissions */}
      <SectionCard
        title="Recent Submissions"
        headerRight={<Button size="sm" variant="outline" onClick={() => onNavigate('bills')}>View All →</Button>}
        noPad
      >
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {['Invoice ID','e-Invoice No.','PO No.','Gross Amt (₹)','Status','Date'].map(h => (
                <th key={h} className={`${h.includes('₹') ? 'text-right' : 'text-left'} px-3.5 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myBills.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-ap-gray-400">No bills submitted yet. <Button size="sm" variant="primary" onClick={() => onNavigate('submit')}>Submit your first bill</Button></td></tr>
            ) : [...myBills].reverse().slice(0, 8).map((b, i) => (
              <tr key={i} className="border-b border-ap-gray-100 hover:bg-ap-gray-50">
                <td className="px-3.5 py-2.5 font-sans font-bold text-ap-blue-mid text-xs">{b.billId}</td>
                <td className="px-3.5 py-2.5 text-xs">{b.eInvNo}</td>
                <td className="px-3.5 py-2.5 text-xs">{b.poNo}</td>
                <td className="px-3.5 py-2.5 font-sans font-bold text-ap-blue text-right">{fmtAmt(b.grossAmt)}</td>
                <td className="px-3.5 py-2.5"><Badge status={b.status} /></td>
                <td className="px-3.5 py-2.5 text-xs text-ap-gray-600">{b.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}
