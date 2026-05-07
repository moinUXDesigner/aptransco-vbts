import { Bar, Pie } from 'react-chartjs-2';
import { VMAT_DATA, VSVC_DATA, VENDOR_MAP } from '../../data/mockData';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';

function fmtCr(v) { return (v / 10000000).toFixed(2); }

const COLORS = ['#005FAD','#F5A623','#1A7A4A','#C0392B','#E67E22','#6172F3','#9B59B6','#1ABC9C'];
const barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } } };
const compactLegend = { plugins: { legend: { position: 'bottom', labels: { font: { size: 9 }, boxWidth: 10, padding: 5 } } } };

export default function VendorReport() {
  const allRecs = [...VMAT_DATA, ...VSVC_DATA];

  const vendorMap = {};
  allRecs.forEach(r => {
    const id   = String(r.vendorId || '');
    const name = r.vendorName || VENDOR_MAP[id] || id;
    if (!vendorMap[id]) vendorMap[id] = { name, mat: 0, svc: 0, gross: 0, paid: 0 };
    if (VMAT_DATA.includes(r)) vendorMap[id].mat++; else vendorMap[id].svc++;
    vendorMap[id].gross += r.grossInvAmt || r.grossAmt || 0;
    vendorMap[id].paid  += r.netAmt || r.netPaid || 0;
  });

  const vendors = Object.entries(vendorMap).sort((a, b) => b[1].paid - a[1].paid).slice(0, 8);
  const totalPaid = Object.values(vendorMap).reduce((s, v) => s + v.paid, 0);

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-shrink-0">
        <StatCard label="Total Vendors"  value={Object.keys(vendorMap).length}  icon="🏭" />
        <StatCard label="Total Paid"     value={`₹${fmtCr(totalPaid)} Cr`}      icon="✅" accent="text-ap-green" />
        <StatCard label="Total Records"  value={allRecs.length}                  icon="📋" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-shrink-0">
        <SectionCard title="Vendor-wise Net Paid (₹ Cr)">
          <div style={{ height: 148 }}>
            <Bar
              data={{
                labels: vendors.map(([, v]) => v.name.substring(0, 18)),
                datasets: [{ label: 'Net Paid (₹ Cr)', data: vendors.map(([, v]) => fmtCr(v.paid)), backgroundColor: COLORS }]
              }}
              options={barOpts}
            />
          </div>
        </SectionCard>
        <SectionCard title="Vendor Share of Total Billing">
          <div className="flex items-center justify-center" style={{ height: 148 }}>
            <Pie
              data={{
                labels: vendors.map(([, v]) => v.name.substring(0, 18)),
                datasets: [{ data: vendors.map(([, v]) => fmtCr(v.gross)), backgroundColor: COLORS }]
              }}
              options={{ ...compactLegend, maintainAspectRatio: false }}
            />
          </div>
        </SectionCard>
      </div>

      {/* Table – fills remaining height */}
      <div className="flex-1 min-h-0 bg-white rounded-lg border border-ap-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-2.5 border-b border-ap-gray-100 flex-shrink-0">
          <h3 className="text-xs font-bold text-ap-blue uppercase tracking-wide">Vendor Summary</h3>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                {['Code','Vendor Name','Mat. Records','Svc. Records','Total Gross (₹ Cr)','Total Paid (₹ Cr)'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map(([id, v]) => (
                <tr key={id} className="border-b border-ap-gray-100 hover:bg-ap-gray-50">
                  <td className="px-3 py-2 font-bold text-ap-blue-mid text-xs">{id}</td>
                  <td className="px-3 py-2 font-medium text-xs">{v.name}</td>
                  <td className="px-3 py-2 text-xs">{v.mat}</td>
                  <td className="px-3 py-2 text-xs">{v.svc}</td>
                  <td className="px-3 py-2 font-sans font-bold text-ap-blue text-xs">{fmtCr(v.gross)}</td>
                  <td className="px-3 py-2 font-sans font-bold text-ap-green text-xs">{fmtCr(v.paid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
