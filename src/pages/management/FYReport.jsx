import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { VMAT_DATA, VSVC_DATA, FY_LABELS } from '../../data/mockData';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import DataTable from '../../components/ui/DataTable';

const FY_ORDER = ['20','21','22','23','24','25'];
function fmtCr(v) { return (v / 10000000).toFixed(2); }
function fmtAmt(v) { return '₹' + Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }); }

export default function FYReport() {
  const [fy, setFy]     = useState('all');
  const [type, setType] = useState('all');

  const allData = [
    ...VMAT_DATA.map(r => ({ ...r, _type: 'Material' })),
    ...VSVC_DATA.map(r => ({ ...r, _type: 'Service' })),
  ].filter(r =>
    (fy === 'all' || String(r.fiscalYear || '').includes(fy)) &&
    (type === 'all' || r._type === type)
  );

  const gross = allData.reduce((s, r) => s + (r.grossInvAmt || r.grossAmt || 0), 0);
  const paid  = allData.reduce((s, r) => s + (r.netAmt || r.netPaid || 0), 0);
  const pen   = allData.reduce((s, r) => s + (r.penalty || 0), 0);
  const ret   = allData.reduce((s, r) => s + (r.retention || 0), 0);

  const fyGross = FY_ORDER.map(f => fmtCr(allData.filter(r => String(r.fiscalYear || '').includes(f)).reduce((s,r) => s+(r.grossInvAmt||r.grossAmt||0), 0)));
  const fyPaid  = FY_ORDER.map(f => fmtCr(allData.filter(r => String(r.fiscalYear || '').includes(f)).reduce((s,r) => s+(r.netAmt||r.netPaid||0), 0)));

  const columns = [
    { header: 'Vendor', key: 'vendorName' },
    { header: 'PO No.', key: 'poNo' },
    { header: 'Type', key: '_type' },
    { header: 'Gross (₹)', render: r => <span className="font-sans font-bold text-ap-blue">{fmtAmt(r.grossInvAmt || r.grossAmt)}</span> },
    { header: 'Penalty (₹)', render: r => fmtAmt(r.penalty) },
    { header: 'Retention (₹)', render: r => fmtAmt(r.retention) },
    { header: 'Net Paid (₹)', render: r => <span className="font-sans font-bold text-ap-green">{fmtAmt(r.netAmt || r.netPaid)}</span> },
    { header: 'LOA No.', key: 'loaNo' },
    { header: 'Paid Date', key: 'paymentDate' },
  ];

  return (
    <div>
      <div className="flex gap-3 mb-5 flex-wrap">
        <select value={fy} onChange={e => setFy(e.target.value)}
          className="px-3 py-2 border border-ap-gray-200 rounded text-sm bg-white">
          <option value="all">All Years</option>
          {FY_ORDER.map((f, i) => <option key={f} value={f}>{FY_LABELS[i]}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)}
          className="px-3 py-2 border border-ap-gray-200 rounded text-sm bg-white">
          <option value="all">All Types</option>
          <option>Material</option>
          <option>Service</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="Gross Billed" value={`₹${fmtCr(gross)} Cr`} icon="💰" />
        <StatCard label="Net Paid"     value={`₹${fmtCr(paid)} Cr`}  icon="✅" accent="text-ap-green" />
        <StatCard label="Penalty"      value={`₹${fmtCr(pen)} Cr`}   icon="⚠️" accent="text-ap-red" />
        <StatCard label="Retention"    value={`₹${fmtCr(ret)} Cr`}   icon="🔒" accent="text-yellow-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <SectionCard title="FY Comparison – Gross vs Paid">
          <Bar data={{
            labels: FY_LABELS,
            datasets: [
              { label: 'Gross (₹ Cr)', data: fyGross, backgroundColor: '#005FAD' },
              { label: 'Paid (₹ Cr)',  data: fyPaid,  backgroundColor: '#1A7A4A' },
            ]
          }} height={220} />
        </SectionCard>
        <SectionCard title="Recovery Components">
          <Bar data={{
            labels: FY_LABELS,
            datasets: [
              { label: 'Penalty', data: FY_ORDER.map(f => fmtCr(allData.filter(r => String(r.fiscalYear || '').includes(f)).reduce((s,r) => s+(r.penalty||0),0))), backgroundColor: '#C0392B' },
              { label: 'Retention', data: FY_ORDER.map(f => fmtCr(allData.filter(r => String(r.fiscalYear || '').includes(f)).reduce((s,r) => s+(r.retention||0),0))), backgroundColor: '#F5A623' },
            ]
          }} height={220} />
        </SectionCard>
      </div>

      <SectionCard title="Detailed Records">
        <DataTable columns={columns} rows={allData.slice(0, 100)} emptyMsg="No records match the selected filters." />
        {allData.length > 100 && <p className="text-xs text-ap-gray-400 mt-2">Showing 100 of {allData.length} records</p>}
      </SectionCard>
    </div>
  );
}
