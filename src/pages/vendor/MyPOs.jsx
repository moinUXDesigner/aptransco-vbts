import { useApp } from '../../context/AppContext';
import { PO_DATA, VMAT_DATA, VSVC_DATA } from '../../data/mockData';
import SectionCard from '../../components/ui/SectionCard';

function fmtAmt(v) { return '₹' + Number(v||0).toLocaleString('en-IN', {minimumFractionDigits:2}); }

export default function MyPOs() {
  const { user } = useApp();
  const vendorId  = String(user?.id);
  const myPOs     = PO_DATA.filter(p => String(p.vendorCode) === vendorId);

  return (
    <SectionCard title="My Purchase Orders" noPad>
      <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {[
                { label: 'PO No.',                align: 'left'  },
                { label: 'Work Name',             align: 'left'  },
                { label: 'Scheme',                align: 'left'  },
                { label: 'Type',                  align: 'left'  },
                { label: 'PO Value Inc.Tax (₹)',  align: 'right' },
                { label: 'GR/SE Value (₹)',       align: 'right' },
                { label: 'Invoice Value (₹)',     align: 'right' },
              ].map(h => (
                <th key={h.label} className={`text-${h.align} px-3.5 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200 whitespace-nowrap`}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myPOs.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-ap-gray-400">No purchase orders found for your vendor code.</td></tr>
            ) : myPOs.map((po, i) => {
              const matRecs = VMAT_DATA.filter(r => r.poNo === po.poNo && String(r.vendorId) === vendorId);
              const svcRecs = VSVC_DATA.filter(r => r.poNo === po.poNo && String(r.vendorId) === vendorId);
              const invoiceVal = [...matRecs, ...svcRecs].reduce((s, r) => s + (r.grossInvAmt || r.grossAmt || 0), 0);
              return (
                <tr key={i} className="border-b border-ap-gray-100 hover:bg-ap-gray-50">
                  <td className="px-3.5 py-2.5 font-sans font-bold text-ap-blue-mid text-xs">{po.poNo}</td>
                  <td className="px-3.5 py-2.5 font-medium text-ap-gray-800 max-w-48 truncate">{po.workName}</td>
                  <td className="px-3.5 py-2.5 text-xs">{po.schemeDesc?.substring(0, 30)}</td>
                  <td className="px-3.5 py-2.5 text-xs">{po.purchDocType}</td>
                  <td className="px-3.5 py-2.5 font-sans font-bold text-ap-blue text-right">{fmtAmt(po.poValueIncTax || po.poValue)}</td>
                  <td className="px-3.5 py-2.5 text-right">{fmtAmt(po.valueGRSE)}</td>
                  <td className="px-3.5 py-2.5 font-sans font-bold text-ap-green text-right">{fmtAmt(invoiceVal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
