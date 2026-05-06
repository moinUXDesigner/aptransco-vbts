import { useState } from 'react';
import { PO_DATA, EMPLOYEES, VENDOR_MAP } from '../../data/mockData';
import SectionCard from '../../components/ui/SectionCard';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

export default function POAssign() {
  const vendors = [...new Set(PO_DATA.map(p => String(p.vendorCode)).filter(Boolean))];
  const busAreas = [...new Set(EMPLOYEES.map(e => e.busArea).filter(Boolean))];
  const elecEngs = EMPLOYEES.filter(e => e.subArea === 'Engineering-Ele');
  const civilEngs = EMPLOYEES.filter(e => e.subArea === 'Engineering-Civ');
  const telecomEngs = EMPLOYEES.filter(e => e.subArea === 'Engineering-Tel');

  const [mappings, setMappings] = useState([
    { vendor: '101161', busArea: 'SE/O&M/VIJAYAWADA', elec: '1072543', civil: '', telecom: '' },
    { vendor: '100720', busArea: 'SE/O&M/VIJAYAWADA', elec: '1073008', civil: '', telecom: '' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMap, setNewMap]   = useState({ vendor: '', busArea: '', elec: '', civil: '', telecom: '' });

  const empName = (id) => EMPLOYEES.find(e => String(e.id) === id)?.name || '—';

  return (
    <div>
      <Alert variant="info" className="mb-4">
        📌 Assign Electrical, Civil, and Telecom engineers per Vendor + Business Area combination. Vendors will see assigned engineers when submitting invoices.
      </Alert>

      <SectionCard
        title="Engineer Mapping (Vendor + Business Area)"
        headerRight={<Button size="sm" variant="primary" onClick={() => setShowAdd(true)}>+ Add Mapping</Button>}
        noPad
      >
        <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                {['Vendor Code','Vendor Name','Business Area','Electrical Eng.','Civil Eng.','Telecom Eng.','Actions'].map(h => (
                  <th key={h} className="text-left px-3.5 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mappings.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-ap-gray-400">No mappings configured. Click Add Mapping to start.</td></tr>
              ) : mappings.map((m, i) => (
                <tr key={i} className="border-b border-ap-gray-100 hover:bg-ap-gray-50">
                  <td className="px-3.5 py-2.5 font-bold text-ap-blue-mid">{m.vendor}</td>
                  <td className="px-3.5 py-2.5 font-medium">{VENDOR_MAP[m.vendor] || m.vendor}</td>
                  <td className="px-3.5 py-2.5 text-xs">{m.busArea}</td>
                  <td className="px-3.5 py-2.5 text-xs">{m.elec ? empName(m.elec) : '—'}</td>
                  <td className="px-3.5 py-2.5 text-xs">{m.civil ? empName(m.civil) : '—'}</td>
                  <td className="px-3.5 py-2.5 text-xs">{m.telecom ? empName(m.telecom) : '—'}</td>
                  <td className="px-3.5 py-2.5">
                    <Button size="xs" variant="danger" onClick={() => setMappings(prev => prev.filter((_, j) => j !== i))}>Remove</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {showAdd && (
        <div className="fixed inset-0 bg-ap-blue/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b border-ap-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-ap-blue">Add Engineer Mapping</h3>
              <button onClick={() => setShowAdd(false)} className="text-ap-gray-400 hover:text-ap-gray-800">✕</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">Vendor</label>
                <select value={newMap.vendor} onChange={e => setNewMap({...newMap, vendor: e.target.value})}
                  className="w-full border border-ap-gray-200 rounded px-3 py-2 text-sm bg-ap-gray-50">
                  <option value="">— Select Vendor —</option>
                  {vendors.map(v => <option key={v} value={v}>{VENDOR_MAP[v] || v} ({v})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">Business Area</label>
                <select value={newMap.busArea} onChange={e => setNewMap({...newMap, busArea: e.target.value})}
                  className="w-full border border-ap-gray-200 rounded px-3 py-2 text-sm bg-ap-gray-50">
                  <option value="">— Select Business Area —</option>
                  {busAreas.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              {[['Electrical Engineer', 'elec', elecEngs], ['Civil Engineer', 'civil', civilEngs], ['Telecom Engineer', 'telecom', telecomEngs]].map(([label, key, engs]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-ap-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
                  <select value={newMap[key]} onChange={e => setNewMap({...newMap, [key]: e.target.value})}
                    className="w-full border border-ap-gray-200 rounded px-3 py-2 text-sm bg-ap-gray-50">
                    <option value="">— None —</option>
                    {engs.map(e => <option key={e.id} value={e.id}>{e.name} ({e.designation})</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-ap-gray-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => {
                if (!newMap.vendor || !newMap.busArea) return;
                setMappings(prev => [...prev, { ...newMap }]);
                setNewMap({ vendor:'', busArea:'', elec:'', civil:'', telecom:'' });
                setShowAdd(false);
              }}>Save Mapping</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
