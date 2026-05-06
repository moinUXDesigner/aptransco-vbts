import { useState, useEffect, useRef } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { VMAT_DATA, VSVC_DATA, PO_DATA, FY_LABELS } from '../../data/mockData';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const FY_ORDER = ['20','21','22','23','24','25'];
const CHART_COLORS = ['#005FAD','#F5A623','#1A7A4A','#C0392B','#E67E22','#6172F3','#9B59B6','#1ABC9C'];

function fmtCr(v) { return (v / 10000000).toFixed(2); }
function fmtAmt(v) { return '₹' + Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function MgmtDashboard() {
  const [fyFilter, setFyFilter]   = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const matFiltered = VMAT_DATA.filter(r =>
    (fyFilter === 'all' || String(r.fiscalYear || '').includes(fyFilter)) &&
    (typeFilter === 'all' || typeFilter === 'Material')
  );
  const svcFiltered = VSVC_DATA.filter(r =>
    (fyFilter === 'all' || String(r.fiscalYear || '').includes(fyFilter)) &&
    (typeFilter === 'all' || typeFilter === 'Service')
  );

  const allRecs = [...matFiltered, ...svcFiltered];
  const totalGross = allRecs.reduce((s, r) => s + (r.grossInvAmt || r.grossAmt || 0), 0);
  const totalPaid  = allRecs.reduce((s, r) => s + (r.netAmt || r.netPaid || 0), 0);
  const totalPen   = allRecs.reduce((s, r) => s + (r.penalty || 0), 0);
  const totalRet   = allRecs.reduce((s, r) => s + (r.retention || 0), 0);

  // FY-wise data
  const fyGross = FY_ORDER.map(fy =>
    fmtCr([...VMAT_DATA, ...VSVC_DATA].filter(r => String(r.fiscalYear || '').includes(fy))
      .reduce((s, r) => s + (r.grossInvAmt || r.grossAmt || 0), 0))
  );
  const fyPaid = FY_ORDER.map(fy =>
    fmtCr([...VMAT_DATA, ...VSVC_DATA].filter(r => String(r.fiscalYear || '').includes(fy))
      .reduce((s, r) => s + (r.netAmt || r.netPaid || 0), 0))
  );

  // Status pie
  const statusCounts = allRecs.reduce((acc, r) => {
    const s = r.approvalStatus || r.status || 'Unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const statusKeys = Object.keys(statusCounts).slice(0, 6);

  // Project bar
  const projMap = {};
  allRecs.forEach(r => {
    const k = r.schemeDesc || r.projDesc || 'Other';
    projMap[k] = (projMap[k] || 0) + (r.netAmt || r.netPaid || 0);
  });
  const projEntries = Object.entries(projMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Vendor pie
  const vendorMap = {};
  allRecs.forEach(r => {
    const k = r.vendorName || 'Unknown';
    vendorMap[k] = (vendorMap[k] || 0) + (r.netAmt || r.netPaid || 0);
  });
  const vendorEntries = Object.entries(vendorMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const barOpts = { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { ticks: { font: { size: 11 } } } } };

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="font-sans text-xl font-bold text-ap-blue">📊 Management Dashboard</span>
        <div className="ml-auto flex gap-3 items-center">
          <label className="text-xs font-semibold text-ap-gray-600">FY:</label>
          <select value={fyFilter} onChange={e => setFyFilter(e.target.value)}
            className="px-3 py-1.5 border border-ap-gray-200 rounded text-sm bg-white">
            <option value="all">All Years</option>
            {FY_ORDER.map((fy, i) => <option key={fy} value={fy}>{FY_LABELS[i]}</option>)}
          </select>
          <label className="text-xs font-semibold text-ap-gray-600">Type:</label>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 border border-ap-gray-200 rounded text-sm bg-white">
            <option value="all">All</option>
            <option value="Material">Material</option>
            <option value="Service">Service</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="Gross Billed" value={`₹${fmtCr(totalGross)} Cr`} sub="Total invoiced amount" icon="💰" />
        <StatCard label="Net Paid" value={`₹${fmtCr(totalPaid)} Cr`} sub="After recoveries" icon="✅" accent="text-ap-green" />
        <StatCard label="Penalty Recovered" value={`₹${fmtCr(totalPen)} Cr`} sub="Deducted amounts" icon="⚠️" accent="text-ap-red" />
        <StatCard label="Retention Held" value={`₹${fmtCr(totalRet)} Cr`} sub="Security deposits" icon="🔒" accent="text-yellow-700" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2">
          <SectionCard title="📅 FY-wise Billing & Payment (₹ Cr)">
            <Bar data={{
              labels: FY_LABELS,
              datasets: [
                { label: 'Gross Billed', data: fyGross, backgroundColor: '#005FAD' },
                { label: 'Net Paid',     data: fyPaid,  backgroundColor: '#1A7A4A' },
              ]
            }} options={barOpts} height={210} />
          </SectionCard>
        </div>
        <SectionCard title="📌 Bill Status">
          <div className="flex flex-col items-center">
            <Pie data={{
              labels: statusKeys,
              datasets: [{ data: statusKeys.map(k => statusCounts[k]), backgroundColor: CHART_COLORS }]
            }} height={180} options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }} />
          </div>
        </SectionCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2">
          <SectionCard title="🏗️ Project-wise Net Paid (₹ Cr)">
            <Bar data={{
              labels: projEntries.map(([k]) => k.substring(0, 30)),
              datasets: [{ label: 'Net Paid (₹ Cr)', data: projEntries.map(([,v]) => fmtCr(v)), backgroundColor: CHART_COLORS }]
            }} options={{ ...barOpts, indexAxis: 'y' }} height={240} />
          </SectionCard>
        </div>
        <SectionCard title="🏭 Vendor Share">
          <div className="flex flex-col items-center">
            <Doughnut data={{
              labels: vendorEntries.map(([k]) => k.substring(0, 20)),
              datasets: [{ data: vendorEntries.map(([,v]) => fmtCr(v)), backgroundColor: CHART_COLORS }]
            }} height={190} options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }} />
          </div>
        </SectionCard>
      </div>

      {/* FY Summary Table */}
      <SectionCard title="📋 FY-wise Summary Table">
        <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                {['Financial Year','Material Bills','Service Bills','Gross Billed (₹ Cr)','Penalty (₹ Cr)','Retention (₹ Cr)','Net Paid (₹ Cr)'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FY_ORDER.map((fy, i) => {
                const mat = VMAT_DATA.filter(r => String(r.fiscalYear || '').includes(fy));
                const svc = VSVC_DATA.filter(r => String(r.fiscalYear || '').includes(fy));
                const gross = [...mat, ...svc].reduce((s, r) => s + (r.grossInvAmt || r.grossAmt || 0), 0);
                const pen   = [...mat, ...svc].reduce((s, r) => s + (r.penalty || 0), 0);
                const ret   = [...mat, ...svc].reduce((s, r) => s + (r.retention || 0), 0);
                const paid  = [...mat, ...svc].reduce((s, r) => s + (r.netAmt || r.netPaid || 0), 0);
                return (
                  <tr key={fy} className="border-b border-ap-gray-100 hover:bg-ap-gray-50">
                    <td className="px-3 py-2.5 font-semibold text-ap-blue">{FY_LABELS[i]}</td>
                    <td className="px-3 py-2.5">{mat.length}</td>
                    <td className="px-3 py-2.5">{svc.length}</td>
                    <td className="px-3 py-2.5 font-sans font-bold text-ap-blue">{fmtCr(gross)}</td>
                    <td className="px-3 py-2.5 text-ap-red">{fmtCr(pen)}</td>
                    <td className="px-3 py-2.5 text-yellow-700">{fmtCr(ret)}</td>
                    <td className="px-3 py-2.5 font-sans font-bold text-ap-green">{fmtCr(paid)}</td>
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
