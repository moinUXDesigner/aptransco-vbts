import { Bar, Doughnut } from 'react-chartjs-2';
import { VMAT_DATA, VSVC_DATA, PO_DATA } from '../../data/mockData';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';

function fmtCr(v) { return (v / 10000000).toFixed(2); }

const COLORS = ['#005FAD','#F5A623','#1A7A4A','#C0392B','#E67E22','#6172F3','#9B59B6','#1ABC9C','#2ECC71','#E91E63'];
const barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { size: 10 }, boxWidth: 10 } } }, scales: { y: { ticks: { font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } } };
const compactLegend = { plugins: { legend: { position: 'bottom', labels: { font: { size: 9 }, boxWidth: 10, padding: 5 } } } };

export default function ProjectReport() {
  const allRecs = [...VMAT_DATA, ...VSVC_DATA];

  const projMap = {};
  allRecs.forEach(r => {
    const k = r.schemeDesc || 'Other';
    if (!projMap[k]) projMap[k] = { gross: 0, paid: 0, count: 0 };
    projMap[k].gross += r.grossInvAmt || r.grossAmt || 0;
    projMap[k].paid  += r.netAmt || r.netPaid || 0;
    projMap[k].count++;
  });

  const projEntries = Object.entries(projMap).sort((a, b) => b[1].gross - a[1].gross).slice(0, 8);
  const totalGross  = allRecs.reduce((s, r) => s + (r.grossInvAmt || r.grossAmt || 0), 0);
  const totalPaid   = allRecs.reduce((s, r) => s + (r.netAmt || r.netPaid || 0), 0);

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-shrink-0">
        <StatCard label="Total POs"   value={PO_DATA.length}              icon="📋" />
        <StatCard label="Total Gross" value={`₹${fmtCr(totalGross)} Cr`} icon="💰" />
        <StatCard label="Total Paid"  value={`₹${fmtCr(totalPaid)} Cr`}  icon="✅" accent="text-ap-green" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-shrink-0">
        <div className="lg:col-span-2">
          <SectionCard title="Project-wise Gross vs Paid (₹ Cr)">
            <div style={{ height: 160 }}>
              <Bar
                data={{
                  labels: projEntries.map(([k]) => k.substring(0, 32)),
                  datasets: [
                    { label: 'Gross (₹ Cr)', data: projEntries.map(([,v]) => fmtCr(v.gross)), backgroundColor: '#005FAD' },
                    { label: 'Paid (₹ Cr)',  data: projEntries.map(([,v]) => fmtCr(v.paid)),  backgroundColor: '#1A7A4A' },
                  ]
                }}
                options={{ ...barOpts, indexAxis: 'y' }}
              />
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Project Share">
          <div className="flex items-center justify-center" style={{ height: 160 }}>
            <Doughnut
              data={{
                labels: projEntries.map(([k]) => k.substring(0, 18)),
                datasets: [{ data: projEntries.map(([,v]) => fmtCr(v.gross)), backgroundColor: COLORS }]
              }}
              options={{ ...compactLegend, maintainAspectRatio: false }}
            />
          </div>
        </SectionCard>
      </div>

      {/* Table – fills remaining height */}
      <div className="flex-1 min-h-0 bg-white rounded-lg border border-ap-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-2.5 border-b border-ap-gray-100 flex-shrink-0">
          <h3 className="text-xs font-bold text-ap-blue uppercase tracking-wide">Project Summary</h3>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                {['Scheme','Records','Gross Billed (₹ Cr)','Net Paid (₹ Cr)','% Paid'].map(h => (
                  <th key={h} className={`${h.includes('₹') || h === '% Paid' ? 'text-right' : 'text-left'} px-3 py-2 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projEntries.map(([k, v]) => (
                <tr key={k} className="border-b border-ap-gray-100 hover:bg-ap-gray-50">
                  <td className="px-3 py-2 font-medium text-ap-gray-800 text-xs">{k}</td>
                  <td className="px-3 py-2 text-xs">{v.count}</td>
                  <td className="px-3 py-2 font-sans font-bold text-ap-blue text-xs text-right">{fmtCr(v.gross)}</td>
                  <td className="px-3 py-2 font-sans font-bold text-ap-green text-xs text-right">{fmtCr(v.paid)}</td>
                  <td className="px-3 py-2 text-xs text-right">{v.gross > 0 ? ((v.paid / v.gross) * 100).toFixed(1) + '%' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
