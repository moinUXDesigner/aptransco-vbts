import { useState } from 'react';
import { VMAT_DATA, VSVC_DATA, VENDOR_MAP } from '../../data/mockData';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';

function fmtAmt(v) { return '₹' + Number(v||0).toLocaleString('en-IN', {minimumFractionDigits:2}); }

export default function AllBills() {
  const [search, setSearch]   = useState('');
  const [type, setType]       = useState('');
  const [vendor, setVendor]   = useState('');

  const vendors = [...new Set([...VMAT_DATA, ...VSVC_DATA].map(r => String(r.vendorId)).filter(Boolean))];

  const allRecs = [
    ...VMAT_DATA.map(r => ({ ...r, _type: 'Material' })),
    ...VSVC_DATA.map(r => ({ ...r, _type: 'Service' })),
  ].filter(r =>
    (!search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase())) &&
    (!type   || r._type === type) &&
    (!vendor || String(r.vendorId) === vendor)
  );

  return (
    <SectionCard title="All Bills – Payment Details (Material + Service)" noPad>
      <div className="flex gap-3 px-6 py-4 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search Vendor / PO / LOA..."
          className="flex-1 min-w-48 border border-ap-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-ap-blue-mid" />
        <select value={type} onChange={e => setType(e.target.value)}
          className="border border-ap-gray-200 rounded px-3 py-2 text-sm bg-white">
          <option value="">All Types</option>
          <option>Material</option>
          <option>Service</option>
        </select>
        <select value={vendor} onChange={e => setVendor(e.target.value)}
          className="border border-ap-gray-200 rounded px-3 py-2 text-sm bg-white">
          <option value="">All Vendors</option>
          {vendors.map(v => <option key={v} value={v}>{VENDOR_MAP[v] || v}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {['Vendor','PO No.','Type','Gross Inv Amt (₹)','Penalty (₹)','Retention (₹)','Other Rec (₹)','Net Paid (₹)','LOA No.','Payment Date'].map(h => (
                <th key={h} className="text-left px-3.5 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allRecs.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-12 text-ap-gray-400">No records match the filters.</td></tr>
            ) : allRecs.slice(0, 150).map((r, i) => (
              <tr key={i} className="border-b border-ap-gray-100 hover:bg-ap-gray-50">
                <td className="px-3.5 py-2.5 text-xs font-medium">{r.vendorName || VENDOR_MAP[String(r.vendorId)]}</td>
                <td className="px-3.5 py-2.5 text-xs">{r.poNo}</td>
                <td className="px-3.5 py-2.5"><Badge status={r._type} /></td>
                <td className="px-3.5 py-2.5 font-sans font-bold text-ap-blue">{fmtAmt(r.grossInvAmt || r.grossAmt)}</td>
                <td className="px-3.5 py-2.5 text-ap-red">{fmtAmt(r.penalty)}</td>
                <td className="px-3.5 py-2.5 text-yellow-700">{fmtAmt(r.retention)}</td>
                <td className="px-3.5 py-2.5">{fmtAmt(r.otherRecovery)}</td>
                <td className="px-3.5 py-2.5 font-sans font-bold text-ap-green">{fmtAmt(r.netAmt || r.netPaid)}</td>
                <td className="px-3.5 py-2.5 text-xs text-ap-blue-mid font-bold">{r.loaNo}</td>
                <td className="px-3.5 py-2.5 text-xs text-ap-gray-600">{r.paymentDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {allRecs.length > 150 && <p className="text-xs text-ap-gray-400 px-6 py-3">Showing 150 of {allRecs.length} records</p>}
      </div>
    </SectionCard>
  );
}
