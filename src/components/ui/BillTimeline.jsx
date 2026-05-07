import Badge from './Badge';

const FLOW_STEPS = [
  { status: 'Submitted',            label: 'Bill Submitted',       dept: 'Vendor Portal' },
  { status: 'Pending with AEE',     label: 'Pending with AEE',     dept: 'Technical Wing' },
  { status: 'Under Verification',   label: 'Under Verification',   dept: 'Accounts Department' },
  { status: 'Reviewed by Engineer', label: 'Reviewed by Engineer', dept: 'Engineering Section' },
  { status: 'Form13 Updated',       label: 'Form-13 Updated',      dept: 'Accounts Department' },
  { status: 'Form14 Updated',       label: 'Form-14 Updated',      dept: 'Accounts Department' },
  { status: 'Approved',             label: 'Approved',             dept: 'HOD / Management' },
  { status: 'Paid',                 label: 'Payment Released',     dept: 'Finance Department' },
];

const TERMINAL_NEG = ['Rejected', 'Sent Back by Accounts', 'Sent Back by HQ'];

function fmtAmt(v) {
  return '₹' + Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function stepState(bill, stepIdx) {
  const isNegTerminal = TERMINAL_NEG.includes(bill.status);
  const currentIdx = FLOW_STEPS.findIndex(s => s.status === bill.status);

  if (isNegTerminal) {
    // All steps up to and including where bill was before rejection are done
    const lastGoodIdx = currentIdx === -1 ? -1 : currentIdx - 1;
    if (stepIdx <= lastGoodIdx) return 'done';
    if (stepIdx === lastGoodIdx + 1) return 'rejected';
    return 'future';
  }

  if (currentIdx === -1) return 'future';
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'future';
}

function logEntryForStep(bill, step) {
  if (!bill.log) return null;
  return bill.log.find(l => l.status === step.status) || null;
}

function StepIcon({ state }) {
  if (state === 'done') {
    return (
      <div className="w-9 h-9 rounded-full bg-ap-green flex items-center justify-center flex-shrink-0 shadow-sm">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (state === 'active') {
    return (
      <div className="w-9 h-9 rounded-full bg-ap-blue-mid flex items-center justify-center flex-shrink-0 shadow-md ring-4 ring-ap-blue-light">
        <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
      </div>
    );
  }
  if (state === 'rejected') {
    return (
      <div className="w-9 h-9 rounded-full bg-ap-red flex items-center justify-center flex-shrink-0 shadow-sm">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  // future
  return (
    <div className="w-9 h-9 rounded-full border-2 border-dashed border-ap-gray-300 bg-white flex items-center justify-center flex-shrink-0">
      <div className="w-2.5 h-2.5 rounded-full bg-ap-gray-200" />
    </div>
  );
}

function ConnectorLine({ state }) {
  const color = state === 'done' ? 'bg-ap-green' : 'bg-ap-gray-200';
  return <div className={`w-0.5 h-6 mx-auto ${color} mt-0.5`} style={{ marginLeft: 18 }} />;
}

export default function BillTimeline({ bill }) {
  const isRejected = TERMINAL_NEG.includes(bill.status);

  return (
    <div className="bg-white rounded-lg">
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-5 py-4 bg-ap-gray-50 border-b border-ap-gray-200 rounded-t-lg">
        <div>
          <div className="text-xs text-ap-gray-400 uppercase tracking-wide font-semibold mb-0.5">Vendor ID</div>
          <div className="text-sm font-bold text-ap-blue">{bill.vendorId}</div>
        </div>
        <div>
          <div className="text-xs text-ap-gray-400 uppercase tracking-wide font-semibold mb-0.5">Submitted On</div>
          <div className="text-sm font-semibold text-ap-gray-800">{bill.date}</div>
        </div>
        <div>
          <div className="text-xs text-ap-gray-400 uppercase tracking-wide font-semibold mb-0.5">Bill Type</div>
          <Badge status={bill.type} />
        </div>
        <div>
          <div className="text-xs text-ap-gray-400 uppercase tracking-wide font-semibold mb-0.5">Gross Amount</div>
          <div className="text-sm font-bold text-ap-blue font-sans">{fmtAmt(bill.grossAmt)}</div>
        </div>
      </div>

      {/* Timeline body */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-ap-blue-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-sm font-bold text-ap-blue">Bill Processing Timeline</span>
          {isRejected && (
            <span className="ml-2 text-xs font-semibold text-ap-red bg-ap-red-light px-2 py-0.5 rounded-full">
              {bill.status}
            </span>
          )}
        </div>

        <div className="pl-1">
          {FLOW_STEPS.map((step, idx) => {
            const state = stepState(bill, idx);
            const logEntry = logEntryForStep(bill, step);
            const isLast = idx === FLOW_STEPS.length - 1;

            const labelColor =
              state === 'done'     ? 'text-ap-gray-800' :
              state === 'active'   ? 'text-ap-blue font-bold' :
              state === 'rejected' ? 'text-ap-red' :
              'text-ap-gray-400';

            const deptColor =
              state === 'done'   ? 'text-ap-green' :
              state === 'active' ? 'text-ap-blue-mid' :
              state === 'rejected' ? 'text-ap-red' :
              'text-ap-gray-300';

            return (
              <div key={step.status}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <StepIcon state={state} />
                    {!isLast && <ConnectorLine state={state} />}
                  </div>

                  <div className={`flex-1 pb-${isLast ? 0 : 2} pt-1`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <div className={`text-sm font-semibold ${labelColor}`}>{step.label}</div>
                        <div className={`text-xs font-medium ${deptColor} mt-0.5`}>{step.dept}</div>
                      </div>
                      {logEntry && (
                        <div className="text-right text-xs text-ap-gray-500 shrink-0">
                          <div className="font-semibold">{logEntry.date}</div>
                          {logEntry.by && <div className="text-ap-gray-400">{logEntry.by}</div>}
                        </div>
                      )}
                      {state === 'active' && !logEntry && (
                        <span className="text-xs text-ap-blue-mid font-semibold bg-ap-blue-light px-2 py-0.5 rounded-full animate-pulse">
                          In Progress
                        </span>
                      )}
                    </div>
                    {logEntry?.action && logEntry.action !== `Status → ${step.status}` && (
                      <div className="text-xs text-ap-gray-500 mt-1 italic">{logEntry.action}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
