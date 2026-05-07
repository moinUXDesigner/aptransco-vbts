import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { VMAT_DATA, VSVC_DATA, FY_LABELS } from '../../data/mockData';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import DataTable from '../../components/ui/DataTable';

const FY_ORDER = ['20','21','22','23','24','25'];
function fmtCr(v) { return (v / 10000000).toFixed(2); }
function fmtAmt(v) { return '₹' + Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }); }

const barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { size: 10 }, boxWidth: 10 } } }, scales: { y: { ticks: { font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } } };

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
    { header: 'Vendor',        key: 'vendorName' },
    { header: 'PO No.',        key: 'poNo' },
    { header: 'Type',          key: '_type' },
    { header: 'Gross (₹)',     right: true, render: r => <span className="font-sans font-bold text-ap-blue">{fmtAmt(r.grossInvAmt || r.grossAmt)}</span> },
    { header: 'Penalty (₹)',   right: true, render: r => fmtAmt(r.penalty) },
    { header: 'Retention (₹)', right: true, render: r => fmtAmt(r.retention) },
    { header: 'Net Paid (₹)',  right: true, render: r => <span className="font-sans font-bold text-ap-green">{fmtAmt(r.netAmt || r.netPaid)}</span> },
    { header: 'LOA No.',       key: 'loaNo' },
    { header: 'Paid Date',     key: 'paymentDate' },
  ];

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* Filters */}
      <div className="flex gap-3 flex-shrink-0 flex-wrap">
        <select value={fy} onChange={e => setFy(e.target.value)}
          className="px-2.5 py-1.5 border border-ap-gray-200 rounded text-xs bg-white">
          <option value="all">All Years</option>
          {FY_ORDER.map((f, i) => <option key={f} value={f}>{FY_LABELS[i]}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)}
          className="px-2.5 py-1.5 border border-ap-gray-200 rounded text-xs bg-white">
          <option value="all">All Types</option>
          <option>Material</option>
          <option>Service</option>
        </select>
        <span className="ml-auto text-xs text-ap-gray-400 self-center">{allData.length} records</span>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
        <StatCard label="Gross Billed" value={`₹${fmtCr(gross)} Cr`} icon="💰" />
        <StatCard label="Net Paid"     value={`₹${fmtCr(paid)} Cr`}  icon="✅" accent="text-ap-green" />
        <StatCard label="Penalty"      value={`₹${fmtCr(pen)} Cr`}   icon="⚠️" accent="text-ap-red" />
        <StatCard label="Retention"    value={`₹${fmtCr(ret)} Cr`}   icon="🔒" accent="text-yellow-700" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-shrink-0">
        <SectionCard title="FY Comparison – Gross vs Paid">
          <div style={{ height: 148 }}>
            <Bar data={{
              labels: FY_LABELS,
              datasets: [
                { label: 'Gross (₹ Cr)', data: fyGross, backgroundColor: '#005FAD' },
                { label: 'Paid (₹ Cr)',  data: fyPaid,  backgroundColor: '#1A7A4A' },
              ]
            }} options={barOpts} />
          </div>
        </SectionCard>
        <SectionCard title="Recovery Components">
          <div style={{ height: 148 }}>
            <Bar data={{
              labels: FY_LABELS,
              datasets: [
                { label: 'Penalty',   data: FY_ORDER.map(f => fmtCr(allData.filter(r => String(r.fiscalYear || '').includes(f)).reduce((s,r) => s+(r.penalty||0),0))),   backgroundColor: '#C0392B' },
                { label: 'Retention', data: FY_ORDER.map(f => fmtCr(allData.filter(r => String(r.fiscalYear || '').includes(f)).reduce((s,r) => s+(r.retention||0),0))), backgroundColor: '#F5A623' },
              ]
            }} options={barOpts} />
          </div>
        </SectionCard>
      </div>

      {/* Table – fills remaining height */}
      <div className="flex-1 min-h-0 bg-white rounded-lg border border-ap-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-2.5 border-b border-ap-gray-100 flex-shrink-0">
          <h3 className="text-xs font-bold text-ap-blue uppercase tracking-wide">Detailed Records</h3>
        </div>
        <div className="flex-1 overflow-auto">
          <DataTable columns={columns} rows={allData.slice(0, 200)} emptyMsg="No records match the selected filters." />
          {allData.length > 200 && <p className="text-xs text-ap-gray-400 px-4 py-2">Showing 200 of {allData.length} records</p>}
        </div>
      </div>

    </div>
  );
}
