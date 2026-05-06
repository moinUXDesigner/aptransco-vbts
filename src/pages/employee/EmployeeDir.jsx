import { useState } from 'react';
import { EMPLOYEES } from '../../data/mockData';
import SectionCard from '../../components/ui/SectionCard';

export default function EmployeeDir() {
  const [search, setSearch]   = useState('');
  const [sgFilter, setSg]     = useState('');

  const subGroups = [...new Set(EMPLOYEES.map(e => e.subGroup).filter(Boolean))];

  const recs = EMPLOYEES.filter(e =>
    (!sgFilter || e.subGroup === sgFilter) &&
    (!search   || JSON.stringify(e).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SectionCard title="Employee Directory" noPad>
      <div className="px-6 py-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSg('')} className={`px-3 py-1 rounded-full text-xs border transition-colors ${!sgFilter ? 'bg-ap-blue-mid text-white border-ap-blue-mid' : 'bg-white text-ap-gray-600 border-ap-gray-200'}`}>All</button>
          {subGroups.map(sg => (
            <button key={sg} onClick={() => setSg(sg)} className={`px-3 py-1 rounded-full text-xs border transition-colors ${sgFilter===sg ? 'bg-ap-blue-mid text-white border-ap-blue-mid' : 'bg-white text-ap-gray-600 border-ap-gray-200'}`}>{sg}</button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search name / ID / designation..."
          className="w-full max-w-md border border-ap-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-ap-blue-mid" />
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {['Emp ID','Name','Designation','Sub Group','Business Area','Org Unit','Email','Mobile'].map(h => (
                <th key={h} className="text-left px-3.5 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recs.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-ap-gray-400">No employees found.</td></tr>
            ) : recs.map((e, i) => (
              <tr key={i} className="border-b border-ap-gray-100 hover:bg-ap-gray-50">
                <td className="px-3.5 py-2.5 font-bold text-ap-blue-mid">{e.id}</td>
                <td className="px-3.5 py-2.5 font-medium">{e.name}</td>
                <td className="px-3.5 py-2.5 text-xs text-ap-gray-600">{e.designation}</td>
                <td className="px-3.5 py-2.5"><span className="bg-ap-blue-light text-ap-blue-mid text-xs font-bold px-2 py-0.5 rounded">{e.subGroup}</span></td>
                <td className="px-3.5 py-2.5 text-xs">{e.busArea}</td>
                <td className="px-3.5 py-2.5 text-xs">{e.orgUnit}</td>
                <td className="px-3.5 py-2.5 text-xs lowercase text-ap-blue-mid">{e.email && e.email !== 'nan' ? e.email.toLowerCase() : '—'}</td>
                <td className="px-3.5 py-2.5 text-xs">{e.tel && e.tel !== 'nan' ? e.tel : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
