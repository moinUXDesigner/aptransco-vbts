import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import TimelineSidebar from '../../components/ui/TimelineSidebar';

function fmtAmt(v) { return '₹' + Number(v||0).toLocaleString('en-IN', {minimumFractionDigits:2}); }

const TABS = [
  { id: 'action',   label: 'Action Required', icon: '⚠️' },
  { id: 'progress', label: 'In Progress',      icon: '📂' },
  { id: 'done',     label: 'Completed',        icon: '✅' },
];

export default function VendorInbox() {
  const { user, submittedBills } = useApp();
  const vendorId = String(user?.id);
  const myBills  = submittedBills.filter(b => String(b.vendorId) === vendorId);

  const [activeTab,    setActiveTab]   = useState('action');
  const [selectedBill, setSelectedBill] = useState(null);

  const actionReqd = myBills.filter(b => ['Sent Back by Accounts','Sent Back by HQ','Rejected'].includes(b.status));
  const inProgress = myBills.filter(b => !['Paid','Rejected','Sent Back by Accounts','Sent Back by HQ'].includes(b.status));
  const completed  = myBills.filter(b => b.status === 'Paid');

  const counts = { action: actionReqd.length, progress: inProgress.length, done: completed.length };

  const visibleBills = activeTab === 'action' ? actionReqd : activeTab === 'progress' ? inProgress : completed;

  const BillCard = ({ bill }) => {
    const isNeg    = ['Rejected','Sent Back by Accounts','Sent Back by HQ'].includes(bill.status);
    const isActive = selectedBill?.billId === bill.billId;
    return (
      <div className={`rounded-lg border p-4 transition-colors
        ${isNeg    ? 'border-l-4 border-l-ap-red bg-red-50 border-ap-red/30' :
          isActive ? 'border-ap-blue-mid bg-ap-blue-light' :
          'bg-white border-ap-gray-200 hover:border-ap-gray-300'}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono font-bold text-ap-blue-mid text-xs truncate">{bill.billId}</span>
              <Badge status={bill.status} />
              <Badge status={bill.type} />
            </div>
            {/* Details */}
            <div className="text-sm font-medium text-ap-gray-800">
              PO: {bill.poNo} &nbsp;·&nbsp; e-Invoice: {bill.eInvNo}
            </div>
            <div className="text-xs text-ap-gray-400 mt-0.5">
              Submitted: {bill.date} &nbsp;·&nbsp; Amount: <span className="font-semibold text-ap-gray-700">{fmtAmt(bill.grossAmt)}</span>
            </div>
            {bill.pendingWith && (
              <div className="text-xs text-ap-gray-600 mt-1">
                Pending with: <span className="font-semibold text-ap-blue">{bill.pendingWith}</span>
                {bill.pendingDesig ? ` · ${bill.pendingDesig}` : ''}
              </div>
            )}
            {/* Last log entry */}
            {bill.log?.length > 0 && (
              <div className="text-xs text-ap-gray-400 mt-1 italic">
                Last update: {bill.log[bill.log.length - 1].action}
              </div>
            )}
          </div>
          {/* Timeline button */}
          <Button
            size="xs"
            variant={isActive ? 'primary' : 'ghost'}
            className="flex-shrink-0 mt-0.5"
            onClick={() => setSelectedBill(isActive ? null : bill)}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Timeline
          </Button>
        </div>
      </div>
    );
  };

  const alertMap = {
    action:   <Alert variant="warning" className="mb-4">These bills have been sent back or rejected. Review and resubmit after making corrections.</Alert>,
    progress: <Alert variant="info"    className="mb-4">Bills currently being processed by APTRANSCO. They will move to <b>Completed</b> once payment is released by HQ SAO.</Alert>,
    done:     <Alert variant="success" className="mb-4">Bills fully processed and paid by APTRANSCO. These also appear in <b>My Bills</b>.</Alert>,
  };

  const emptyMap = {
    action:   'No bills require your action right now.',
    progress: 'No bills currently in progress.',
    done:     'No completed bills yet.',
  };

  return (
    <>
      <SectionCard noPad>
        {/* ── Tab bar ─────────────────────────────────────────── */}
        <div className="flex border-b border-ap-gray-200 px-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px mr-1 transition-colors flex items-center gap-2
                ${activeTab === t.id
                  ? 'text-ap-blue border-ap-blue-mid'
                  : 'text-ap-gray-400 border-transparent hover:text-ap-gray-800'}`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {counts[t.id] > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none
                  ${t.id === 'action'
                    ? 'bg-ap-red text-white'
                    : activeTab === t.id
                      ? 'bg-ap-blue-mid text-white'
                      : 'bg-ap-gray-200 text-ap-gray-600'}`}>
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ─────────────────────────────────────── */}
        <div className="p-5">
          {alertMap[activeTab]}
          {visibleBills.length === 0 ? (
            <p className="text-ap-gray-400 text-sm py-8 text-center">{emptyMap[activeTab]}</p>
          ) : (
            <div className="space-y-3">
              {[...visibleBills].reverse().map((b) => (
                <BillCard key={b.billId} bill={b} />
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      <TimelineSidebar bill={selectedBill} onClose={() => setSelectedBill(null)} />
    </>
  );
}
