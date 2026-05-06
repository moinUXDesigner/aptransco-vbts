import { Bar, Doughnut } from 'react-chartjs-2';
import { VMAT_DATA, VSVC_DATA, PO_DATA } from '../../data/mockData';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';

function fmtCr(v) { return (v / 10000000).toFixed(2); }

export default function ProjectReport() {
  const allRecs = [...VMAT_DATA, ...VSVC_DATA];

  // Project-wise aggregation
  const projMap = {};
  allRecs.forEach(r => {
    const k = r.schemeDesc || 'Other';
    if (!projMap[k]) projMap[k] = { gross: 0, paid: 0, count: 0 };
    projMap[k].gross += r.grossInvAmt || r.grossAmt || 0;
    projMap[k].paid  += r.netAmt || r.netPaid || 0;
    projMap[k].count++;
  });

  const projEntries = Object.entries(projMap).sort((a, b) => b[1].gross - a[1].gross).slice(0, 10);
  const colors = ['#005FAD','#F5A623','#1A7A4A','#C0392B','#E67E22','#6172F3','#9B59B6','#1ABC9C','#2ECC71','#E91E63'];

  const totalGross = allRecs.reduce((s, r) => s + (r.grossInvAmt || r.grossAmt || 0), 0);
  const totalPaid  = allRecs.reduce((s, r) => s + (r.netAmt || r.netPaid || 0), 0);
  const poCount    = PO_DATA.length;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        <StatCard label="Total POs" value={poCount} icon="📋" />
        <StatCard label="Total Gross" value={`₹${fmtCr(totalGross)} Cr`} icon="💰" />
        <StatCard label="Total Paid"  value={`₹${fmtCr(totalPaid)} Cr`} icon="✅" accent="text-ap-green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2">
          <SectionCard title="Project-wise Gross vs Paid (₹ Cr)">
            <Bar data={{
              labels: projEntries.map(([k]) => k.substring(0, 35)),
              datasets: [
                { label: 'Gross (₹ Cr)', data: projEntries.map(([,v]) => fmtCr(v.gross)), backgroundColor: '#005FAD' },
                { label: 'Paid (₹ Cr)',  data: projEntries.map(([,v]) => fmtCr(v.paid)),  backgroundColor: '#1A7A4A' },
              ]
            }} options={{ indexAxis: 'y', responsive: true, plugins: { legend: { position: 'top' } } }} height={260} />
          </SectionCard>
        </div>
        <SectionCard title="Project Share">
          <Doughnut data={{
            labels: projEntries.map(([k]) => k.substring(0, 20)),
            datasets: [{ data: projEntries.map(([,v]) => fmtCr(v.gross)), backgroundColor: colors }]
          }} options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 9 } } } } }} height={220} />
        </SectionCard>
      </div>

      <SectionCard title="Project Summary Table">
        <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                {['Scheme','Records','Gross Billed (₹ Cr)','Net Paid (₹ Cr)','% Paid'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projEntries.map(([k, v]) => (
                <tr key={k} className="border-b border-ap-gray-100 hover:bg-ap-gray-50">
                  <td className="px-3 py-2.5 font-medium text-ap-gray-800">{k}</td>
                  <td className="px-3 py-2.5">{v.count}</td>
                  <td className="px-3 py-2.5 font-sans font-bold text-ap-blue">{fmtCr(v.gross)}</td>
                  <td className="px-3 py-2.5 font-sans font-bold text-ap-green">{fmtCr(v.paid)}</td>
                  <td className="px-3 py-2.5">{v.gross > 0 ? ((v.paid / v.gross) * 100).toFixed(1) + '%' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
