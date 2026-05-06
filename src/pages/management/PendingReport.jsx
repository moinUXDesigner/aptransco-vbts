import { Bar, Pie } from 'react-chartjs-2';
import { useApp } from '../../context/AppContext';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';

function fmtAmt(v) { return '₹' + Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }); }
function daysSince(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr.split('/').reverse().join('-'));
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

const AGING_BUCKETS = ['0-7 days','8-30 days','31-60 days','61-90 days','90+ days'];
function ageBucket(days) {
  if (days <= 7)  return '0-7 days';
  if (days <= 30) return '8-30 days';
  if (days <= 60) return '31-60 days';
  if (days <= 90) return '61-90 days';
  return '90+ days';
}

export default function PendingReport() {
  const { submittedBills } = useApp();
  const pending = submittedBills.filter(b => !['Paid','Rejected'].includes(b.status));

  const totalPendAmt = pending.reduce((s, b) => s + (b.grossAmt || 0), 0);

  // Aging
  const ageCounts = {};
  AGING_BUCKETS.forEach(k => ageCounts[k] = 0);
  pending.forEach(b => { const d = daysSince(b.date); ageCounts[ageBucket(d)]++; });

  // Pending with whom
  const whomMap = {};
  pending.forEach(b => { const k = b.pendingWith || 'Unknown'; whomMap[k] = (whomMap[k] || 0) + 1; });
  const whomEntries = Object.entries(whomMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const COLORS = ['#005FAD','#F5A623','#1A7A4A','#C0392B','#E67E22','#9B59B6'];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        <StatCard label="Total Pending Bills" value={pending.length} icon="⏳" />
        <StatCard label="Pending Amount" value={`₹${(totalPendAmt/10000000).toFixed(2)} Cr`} icon="💰" />
        <StatCard label="Urgent (30+ days)" value={pending.filter(b => daysSince(b.date) > 30).length} icon="🚨" accent="text-ap-red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <SectionCard title="Aging Distribution">
          <Bar data={{
            labels: AGING_BUCKETS,
            datasets: [{ label: 'Bills', data: AGING_BUCKETS.map(k => ageCounts[k]), backgroundColor: ['#1A7A4A','#F5A623','#E67E22','#C0392B','#6172F3'] }]
          }} height={200} />
        </SectionCard>
        <SectionCard title="Pending With Whom">
          {whomEntries.length > 0 ? (
            <div className="flex flex-col items-center">
              <Pie data={{
                labels: whomEntries.map(([k]) => k),
                datasets: [{ data: whomEntries.map(([,v]) => v), backgroundColor: COLORS }]
              }} height={200} options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }} />
            </div>
          ) : (
            <p className="text-ap-gray-400 text-sm py-10 text-center">No pending bills found. Submit bills via the Vendor portal.</p>
          )}
        </SectionCard>
      </div>

      <SectionCard title="All Pending Bills – Sorted by Days Pending">
        <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                {['System ID','Vendor','Invoice No.','PO No.','Type','Gross Amt (₹)','Submitted','Days','Status','Pending With'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10 text-ap-gray-400">No pending bills at this time.</td></tr>
              ) : [...pending].sort((a, b) => daysSince(b.date) - daysSince(a.date)).map((b, i) => {
                const days = daysSince(b.date);
                return (
                  <tr key={i} className="border-b border-ap-gray-100 hover:bg-ap-gray-50">
                    <td className="px-3 py-2.5 font-sans font-bold text-ap-blue-mid text-xs">{b.billId}</td>
                    <td className="px-3 py-2.5">{b.vendorId}</td>
                    <td className="px-3 py-2.5 text-xs">{b.eInvNo}</td>
                    <td className="px-3 py-2.5 text-xs">{b.poNo}</td>
                    <td className="px-3 py-2.5"><Badge status={b.type} /></td>
                    <td className="px-3 py-2.5 font-sans font-bold text-ap-blue">{fmtAmt(b.grossAmt)}</td>
                    <td className="px-3 py-2.5 text-xs text-ap-gray-600">{b.date}</td>
                    <td className={`px-3 py-2.5 font-bold ${days > 30 ? 'text-ap-red' : days > 7 ? 'text-ap-orange' : 'text-ap-green'}`}>{days}d</td>
                    <td className="px-3 py-2.5"><Badge status={b.status} /></td>
                    <td className="px-3 py-2.5 text-xs">{b.pendingWith || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
