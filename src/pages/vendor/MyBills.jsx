import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import TimelineSidebar from '../../components/ui/TimelineSidebar';

function fmtAmt(v) { return '₹' + Number(v||0).toLocaleString('en-IN', {minimumFractionDigits:2}); }

/* Flowchart milestone statuses (M1–M10) */
const STATUSES = [
  'Submitted',
  'Pending with AEE',
  'Pending with DEE',
  'Pending with EE',
  'Invoice Posted',
  'Pending with Field SAO',
  'Pending with HQ SAO',
  'HQ LOA Processing',
  'LOA Processing',
  'Paid',
  'Rejected',
];

export default function MyBills() {
  const { user, submittedBills } = useApp();
  const vendorId = String(user?.id);
  const [typeTab, setTypeTab]       = useState('all');
  const [search, setSearch]         = useState('');
  const [status, setStatus]         = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  let bills = submittedBills.filter(b => String(b.vendorId) === vendorId);
  if (typeTab === 'Invoice') bills = bills.filter(b => b.type !== 'HR');
  if (typeTab === 'HR')      bills = bills.filter(b => b.type === 'HR');
  if (search) bills = bills.filter(b => JSON.stringify(b).toLowerCase().includes(search.toLowerCase()));
  if (status) bills = bills.filter(b => b.status === status);

  return (
    <>
      <SectionCard noPad>
        <div className="flex border-b border-ap-gray-200 px-6">
          {['all','Invoice','HR'].map(t => (
            <button key={t} onClick={() => setTypeTab(t)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px mr-1 transition-colors ${typeTab===t ? 'text-ap-blue border-ap-blue-mid' : 'text-ap-gray-400 border-transparent hover:text-ap-gray-800'}`}>
              {t === 'all' ? 'All' : t === 'Invoice' ? 'Invoices' : 'HR (Retention)'}
            </button>
          ))}
        </div>

        <div className="flex gap-3 px-6 py-4 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by PO / Invoice / Amount..."
            className="flex-1 min-w-48 border border-ap-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-ap-blue-mid" />
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="border border-ap-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-ap-blue-mid">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                {['Invoice ID','e-Invoice No.','PO No.','Type','Gross Amt (₹)','Status','Date','Pending With','Actions'].map(h => (
                  <th key={h} className="text-left px-3.5 py-2.5 text-xs font-bold text-ap-gray-600 uppercase tracking-wide bg-ap-gray-50 border-b border-ap-gray-200 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-ap-gray-400">No bills found.</td></tr>
              ) : [...bills].reverse().map((b) => (
                <tr
                  key={b.billId}
                  className={`border-b border-ap-gray-100 hover:bg-ap-gray-50 transition-colors ${selectedBill?.billId === b.billId ? 'bg-ap-blue-light' : ''}`}
                >
                  <td className="px-3.5 py-2.5 font-sans font-bold text-ap-blue-mid text-xs">{b.billId}</td>
                  <td className="px-3.5 py-2.5 text-xs">{b.eInvNo}</td>
                  <td className="px-3.5 py-2.5 text-xs">{b.poNo}</td>
                  <td className="px-3.5 py-2.5"><Badge status={b.type} /></td>
                  <td className="px-3.5 py-2.5 font-sans font-bold text-ap-blue">{fmtAmt(b.grossAmt)}</td>
                  <td className="px-3.5 py-2.5"><Badge status={b.status} /></td>
                  <td className="px-3.5 py-2.5 text-xs text-ap-gray-600">{b.date}</td>
                  <td className="px-3.5 py-2.5 text-xs">
                    {b.pendingWith
                      ? <span>{b.pendingWith}<br /><span className="text-ap-gray-400">{b.pendingDesig}</span></span>
                      : '—'}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <Button
                      size="xs"
                      variant={selectedBill?.billId === b.billId ? 'primary' : 'outline'}
                      onClick={() => setSelectedBill(selectedBill?.billId === b.billId ? null : b)}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Timeline
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <TimelineSidebar bill={selectedBill} onClose={() => setSelectedBill(null)} />
    </>
  );
}
