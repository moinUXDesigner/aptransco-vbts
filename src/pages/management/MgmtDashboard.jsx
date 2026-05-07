import { useState } from 'react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
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

const compactLegend = { plugins: { legend: { position: 'bottom', labels: { font: { size: 9 }, boxWidth: 10, padding: 6 } } } };
const barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { size: 10 }, boxWidth: 10 } } }, scales: { y: { ticks: { font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } } };

export default function MgmtDashboard() {
  const [fyFilter, setFyFilter]     = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const matFiltered = VMAT_DATA.filter(r =>
    (fyFilter === 'all' || String(r.fiscalYear || '').includes(fyFilter)) &&
    (typeFilter === 'all' || typeFilter === 'Material')
  );
  const svcFiltered = VSVC_DATA.filter(r =>
    (fyFilter === 'all' || String(r.fiscalYear || '').includes(fyFilter)) &&
    (typeFilter === 'all' || typeFilter === 'Service')
  );

  const allRecs    = [...matFiltered, ...svcFiltered];
  const totalGross = allRecs.reduce((s, r) => s + (r.grossInvAmt || r.grossAmt || 0), 0);
  const totalPaid  = allRecs.reduce((s, r) => s + (r.netAmt || r.netPaid || 0), 0);
  const totalPen   = allRecs.reduce((s, r) => s + (r.penalty || 0), 0);
  const totalRet   = allRecs.reduce((s, r) => s + (r.retention || 0), 0);

  // FY-wise
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
  const projEntries = Object.entries(projMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Vendor donut
  const vendorMap = {};
  allRecs.forEach(r => {
    const k = r.vendorName || 'Unknown';
    vendorMap[k] = (vendorMap[k] || 0) + (r.netAmt || r.netPaid || 0);
  });
  const vendorEntries = Object.entries(vendorMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* Filters */}
      <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-ap-gray-600">FY:</label>
          <select value={fyFilter} onChange={e => setFyFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-ap-gray-200 rounded text-xs bg-white">
            <option value="all">All Years</option>
            {FY_ORDER.map((fy, i) => <option key={fy} value={fy}>{FY_LABELS[i]}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-ap-gray-600">Type:</label>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-ap-gray-200 rounded text-xs bg-white">
            <option value="all">All</option>
            <option value="Material">Material</option>
            <option value="Service">Service</option>
          </select>
        </div>
        <div className="ml-auto text-xs text-ap-gray-400 font-semibold">
          {allRecs.length} records &nbsp;·&nbsp; {matFiltered.length} material &nbsp;·&nbsp; {svcFiltered.length} service
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
        <StatCard label="Gross Billed"      value={`₹${fmtCr(totalGross)} Cr`} sub="Total invoiced" icon="💰" />
        <StatCard label="Net Paid"           value={`₹${fmtCr(totalPaid)} Cr`}  sub="After recoveries" icon="✅" accent="text-ap-green" />
        <StatCard label="Penalty Recovered" value={`₹${fmtCr(totalPen)} Cr`}   sub="Deducted" icon="⚠️" accent="text-ap-red" />
        <StatCard label="Retention Held"    value={`₹${fmtCr(totalRet)} Cr`}   sub="Security deposits" icon="🔒" accent="text-yellow-700" />
      </div>

      {/* Charts – Row 1: FY Bar + Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-shrink-0">
        <div className="lg:col-span-2">
          <SectionCard title="📅 FY-wise Billing & Payment (₹ Cr)">
            <div style={{ height: 148 }}>
              <Bar
                data={{
                  labels: FY_LABELS,
                  datasets: [
                    { label: 'Gross Billed', data: fyGross, backgroundColor: '#005FAD' },
                    { label: 'Net Paid',     data: fyPaid,  backgroundColor: '#1A7A4A' },
                  ]
                }}
                options={barOpts}
              />
            </div>
          </SectionCard>
        </div>
        <SectionCard title="📌 Bill Status">
          <div className="flex items-center justify-center" style={{ height: 148 }}>
            <Pie
              data={{
                labels: statusKeys,
                datasets: [{ data: statusKeys.map(k => statusCounts[k]), backgroundColor: CHART_COLORS }]
              }}
              options={{ ...compactLegend, maintainAspectRatio: false }}
            />
          </div>
        </SectionCard>
      </div>

      {/* Charts – Row 2: Project Bar + Vendor Doughnut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-shrink-0">
        <div className="lg:col-span-2">
          <SectionCard title="🏗️ Project-wise Net Paid (₹ Cr)">
            <div style={{ height: 148 }}>
              <Bar
                data={{
                  labels: projEntries.map(([k]) => k.substring(0, 28)),
                  datasets: [{ label: 'Net Paid (₹ Cr)', data: projEntries.map(([, v]) => fmtCr(v)), backgroundColor: CHART_COLORS }]
                }}
                options={{ ...barOpts, indexAxis: 'y' }}
              />
            </div>
          </SectionCard>
        </div>
        <SectionCard title="🏭 Vendor Share">
          <div className="flex items-center justify-center" style={{ height: 148 }}>
            <Doughnut
              data={{
                labels: vendorEntries.map(([k]) => k.substring(0, 18)),
                datasets: [{ data: vendorEntries.map(([, v]) => fmtCr(v)), backgroundColor: CHART_COLORS }]
              }}
              options={{ ...compactLegend, maintainAspectRatio: false }}
            />
          </div>
        </SectionCard>
      </div>

    </div>
  );
}
