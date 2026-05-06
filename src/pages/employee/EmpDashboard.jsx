import { useApp } from '../../context/AppContext';
import { PO_DATA, VMAT_DATA, VSVC_DATA, VENDOR_MAP } from '../../data/mockData';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import Alert from '../../components/ui/Alert';

export default function EmpDashboard() {
  const { submittedBills } = useApp();

  const uniqueVendors = [...new Set(PO_DATA.map(p => String(p.vendorCode)).filter(Boolean))];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total POs (All Vendors)" value={PO_DATA.length} icon="📋" sub="Active purchase orders" />
        <StatCard label="Material Payment Records" value={VMAT_DATA.length} icon="📦" sub="From master data" />
        <StatCard label="Service Payment Records"  value={VSVC_DATA.length} icon="🔧" sub="From master data" />
        <StatCard label="Pending Bills (Submitted)" value={submittedBills.filter(b => !['Paid','Rejected'].includes(b.status)).length} icon="⏳" sub="Awaiting action" accent="text-ap-orange" />
      </div>

      <Alert variant="info" className="mb-5">
        ℹ️ All data loaded from master Excel files. Use the sidebar to navigate payment records, Form 14 data, and the employee directory.
      </Alert>

      <SectionCard title="Vendor Summary" noPad>
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {['Vendor Code','Vendor Name','POs Assigned','Material Payments','Service Payments'].map(h => (
                <th key={h} className="text-left px-3.5 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uniqueVendors.map((vid, i) => {
              const pos  = PO_DATA.filter(p => String(p.vendorCode) === vid);
              const mats = VMAT_DATA.filter(r => String(r.vendorId) === vid);
              const svcs = VSVC_DATA.filter(r => String(r.vendorId) === vid);
              const name = VENDOR_MAP[vid] || pos[0]?.vendorName || vid;
              return (
                <tr key={i} className="border-b border-ap-gray-100 hover:bg-ap-gray-50">
                  <td className="px-3.5 py-2.5 font-bold text-ap-blue-mid">{vid}</td>
                  <td className="px-3.5 py-2.5 font-medium">{name}</td>
                  <td className="px-3.5 py-2.5">{pos.length}</td>
                  <td className="px-3.5 py-2.5">{mats.length}</td>
                  <td className="px-3.5 py-2.5">{svcs.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}
