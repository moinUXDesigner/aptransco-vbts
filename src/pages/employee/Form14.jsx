import { useState } from 'react';
import { VSVC_DATA } from '../../data/mockData';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';

function fmtAmt(v) { return '₹' + Number(v||0).toLocaleString('en-IN', {minimumFractionDigits:2}); }

export default function Form14() {
  const [search, setSearch] = useState('');

  const recs = VSVC_DATA.filter(r =>
    !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SectionCard title="Form 14 Records" noPad>
      <div className="px-6 py-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search PO / Scheme / Vendor..."
          className="w-full max-w-md border border-ap-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-ap-blue-mid" />
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {['SE No.','Scheme','PO No.','Vendor','Billing Amt (₹)','Retention (₹)','Penalty (₹)','Net Paid (₹)','LOA No.'].map(h => (
                <th key={h} className={`${h.includes('₹') ? 'text-right' : 'text-left'} px-3.5 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200 whitespace-nowrap`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recs.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-ap-gray-400">No records found.</td></tr>
            ) : recs.slice(0, 150).map((r, i) => (
              <tr key={i} className="border-b border-ap-gray-100 hover:bg-ap-gray-50">
                <td className="px-3.5 py-2.5 text-xs font-bold text-ap-blue-mid">{r.seNo}</td>
                <td className="px-3.5 py-2.5 text-xs max-w-40 truncate">{r.schemeDesc || r.projDesc}</td>
                <td className="px-3.5 py-2.5 text-xs">{r.poNo}</td>
                <td className="px-3.5 py-2.5 text-xs font-medium">{r.vendorName}</td>
                <td className="px-3.5 py-2.5 font-sans font-bold text-ap-blue text-right">{fmtAmt(r.grossInvAmt || r.grossAmt)}</td>
                <td className="px-3.5 py-2.5 text-yellow-700 text-right">{fmtAmt(r.retention)}</td>
                <td className="px-3.5 py-2.5 text-ap-red text-right">{fmtAmt(r.penalty)}</td>
                <td className="px-3.5 py-2.5 font-sans font-bold text-ap-green text-right">{fmtAmt(r.netAmt || r.netPaid)}</td>
                <td className="px-3.5 py-2.5 text-xs text-ap-blue-mid">{r.loaNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {recs.length > 150 && <p className="text-xs text-ap-gray-400 px-6 py-3">Showing 150 of {recs.length} records</p>}
      </div>
    </SectionCard>
  );
}
