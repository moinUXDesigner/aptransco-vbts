import { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { useApp } from '../../context/AppContext';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import TimelineSidebar from '../../components/ui/TimelineSidebar';

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

const barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } } };
const compactLegend = { plugins: { legend: { position: 'bottom', labels: { font: { size: 9 }, boxWidth: 10, padding: 5 } } } };
const COLORS = ['#005FAD','#F5A623','#1A7A4A','#C0392B','#E67E22','#9B59B6'];

export default function PendingReport() {
  const { submittedBills } = useApp();
  const [selectedBill, setSelectedBill] = useState(null);
  const pending = submittedBills.filter(b => !['Paid','Rejected'].includes(b.status));

  const totalPendAmt = pending.reduce((s, b) => s + (b.grossAmt || 0), 0);

  const ageCounts = {};
  AGING_BUCKETS.forEach(k => ageCounts[k] = 0);
  pending.forEach(b => { const d = daysSince(b.date); ageCounts[ageBucket(d)]++; });

  const whomMap = {};
  pending.forEach(b => { const k = b.pendingWith || 'Unknown'; whomMap[k] = (whomMap[k] || 0) + 1; });
  const whomEntries = Object.entries(whomMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <>
      <div className="flex flex-col gap-3 h-full">

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-shrink-0">
          <StatCard label="Total Pending Bills" value={pending.length} icon="⏳" />
          <StatCard label="Pending Amount" value={`₹${(totalPendAmt/10000000).toFixed(2)} Cr`} icon="💰" />
          <StatCard label="Urgent (30+ days)" value={pending.filter(b => daysSince(b.date) > 30).length} icon="🚨" accent="text-ap-red" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-shrink-0">
          <SectionCard title="Aging Distribution">
            <div style={{ height: 140 }}>
              <Bar
                data={{
                  labels: AGING_BUCKETS,
                  datasets: [{ label: 'Bills', data: AGING_BUCKETS.map(k => ageCounts[k]), backgroundColor: ['#1A7A4A','#F5A623','#E67E22','#C0392B','#6172F3'] }]
                }}
                options={barOpts}
              />
            </div>
          </SectionCard>
          <SectionCard title="Pending With Whom">
            {whomEntries.length > 0 ? (
              <div className="flex items-center justify-center" style={{ height: 140 }}>
                <Pie
                  data={{
                    labels: whomEntries.map(([k]) => k),
                    datasets: [{ data: whomEntries.map(([,v]) => v), backgroundColor: COLORS }]
                  }}
                  options={{ ...compactLegend, maintainAspectRatio: false }}
                />
              </div>
            ) : (
              <p className="text-ap-gray-400 text-xs py-6 text-center">No pending bills found.</p>
            )}
          </SectionCard>
        </div>

        {/* Table – fills remaining height */}
        <div className="flex-1 min-h-0 bg-white rounded-lg border border-ap-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-2.5 border-b border-ap-gray-100 flex-shrink-0">
            <h3 className="text-xs font-bold text-ap-blue uppercase tracking-wide">All Pending Bills – Sorted by Days Pending</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr>
                  {['System ID','Vendor','Invoice No.','PO No.','Type','Gross Amt (₹)','Submitted','Days','Status','Pending With','Actions'].map(h => (
                    <th key={h} className={`${h.includes('₹') ? 'text-right' : 'text-left'} px-3 py-2 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200 whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <tr><td colSpan={11} className="text-center py-8 text-ap-gray-400 text-sm">No pending bills at this time.</td></tr>
                ) : [...pending].sort((a, b) => daysSince(b.date) - daysSince(a.date)).map((b) => {
                  const days = daysSince(b.date);
                  return (
                    <tr
                      key={b.billId}
                      className={`border-b border-ap-gray-100 hover:bg-ap-gray-50 transition-colors ${selectedBill?.billId === b.billId ? 'bg-ap-blue-light' : ''}`}
                    >
                      <td className="px-3 py-2 font-sans font-bold text-ap-blue-mid text-xs">{b.billId}</td>
                      <td className="px-3 py-2 text-xs">{b.vendorId}</td>
                      <td className="px-3 py-2 text-xs">{b.eInvNo}</td>
                      <td className="px-3 py-2 text-xs">{b.poNo}</td>
                      <td className="px-3 py-2"><Badge status={b.type} /></td>
                      <td className="px-3 py-2 font-sans font-bold text-ap-blue text-xs text-right">{fmtAmt(b.grossAmt)}</td>
                      <td className="px-3 py-2 text-xs text-ap-gray-600">{b.date}</td>
                      <td className={`px-3 py-2 font-bold text-xs ${days > 30 ? 'text-ap-red' : days > 7 ? 'text-ap-orange' : 'text-ap-green'}`}>{days}d</td>
                      <td className="px-3 py-2"><Badge status={b.status} /></td>
                      <td className="px-3 py-2 text-xs">{b.pendingWith || '—'}</td>
                      <td className="px-3 py-2">
                        <Button
                          size="xs"
                          variant={selectedBill?.billId === b.billId ? 'primary' : 'outline'}
                          onClick={() => setSelectedBill(selectedBill?.billId === b.billId ? null : b)}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Timeline
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <TimelineSidebar bill={selectedBill} onClose={() => setSelectedBill(null)} />
    </>
  );
}
