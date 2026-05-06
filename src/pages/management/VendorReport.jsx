import { Bar, Pie } from 'react-chartjs-2';
import { VMAT_DATA, VSVC_DATA, VENDOR_MAP } from '../../data/mockData';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';

function fmtCr(v) { return (v / 10000000).toFixed(2); }

export default function VendorReport() {
  const allRecs = [...VMAT_DATA, ...VSVC_DATA];

  const vendorMap = {};
  allRecs.forEach(r => {
    const id   = String(r.vendorId || '');
    const name = r.vendorName || VENDOR_MAP[id] || id;
    if (!vendorMap[id]) vendorMap[id] = { name, mat: 0, svc: 0, gross: 0, paid: 0, pending: 0 };
    if (r.purchDocType === 'Material' || VMAT_DATA.includes(r)) vendorMap[id].mat++;
    else vendorMap[id].svc++;
    vendorMap[id].gross += r.grossInvAmt || r.grossAmt || 0;
    vendorMap[id].paid  += r.netAmt || r.netPaid || 0;
  });

  const vendors = Object.entries(vendorMap).sort((a, b) => b[1].paid - a[1].paid).slice(0, 8);
  const COLORS = ['#005FAD','#F5A623','#1A7A4A','#C0392B','#E67E22','#6172F3','#9B59B6','#1ABC9C'];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        <StatCard label="Total Vendors" value={Object.keys(vendorMap).length} icon="🏭" />
        <StatCard label="Total Paid" value={`₹${fmtCr(Object.values(vendorMap).reduce((s, v) => s + v.paid, 0))} Cr`} icon="✅" accent="text-ap-green" />
        <StatCard label="Total Records" value={allRecs.length} icon="📋" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <SectionCard title="Vendor-wise Net Paid (₹ Cr)">
          <Bar data={{
            labels: vendors.map(([, v]) => v.name.substring(0, 20)),
            datasets: [{ label: 'Net Paid (₹ Cr)', data: vendors.map(([, v]) => fmtCr(v.paid)), backgroundColor: COLORS }]
          }} height={200} />
        </SectionCard>
        <SectionCard title="Vendor Share of Total Billing">
          <div className="flex flex-col items-center">
            <Pie data={{
              labels: vendors.map(([, v]) => v.name.substring(0, 20)),
              datasets: [{ data: vendors.map(([, v]) => fmtCr(v.gross)), backgroundColor: COLORS }]
            }} height={200} options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }} />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Vendor Summary Table">
        <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                {['Vendor Code','Vendor Name','Mat. Records','Svc. Records','Total Gross (₹ Cr)','Total Paid (₹ Cr)'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map(([id, v]) => (
                <tr key={id} className="border-b border-ap-gray-100 hover:bg-ap-gray-50">
                  <td className="px-3 py-2.5 font-bold text-ap-blue-mid">{id}</td>
                  <td className="px-3 py-2.5 font-medium">{v.name}</td>
                  <td className="px-3 py-2.5">{v.mat}</td>
                  <td className="px-3 py-2.5">{v.svc}</td>
                  <td className="px-3 py-2.5 font-sans font-bold text-ap-blue">{fmtCr(v.gross)}</td>
                  <td className="px-3 py-2.5 font-sans font-bold text-ap-green">{fmtCr(v.paid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
