import Badge from './Badge';

/* ── Flowchart milestones (M1 – M10) ──────────────────────────────────
   Ref: VBTS Milestone Flow Diagram v1.4, April 2026
   M5 & M6 are simultaneous (done together by Field AOs in SAP).
   M9a (Loans) and M9b (B&R) run in parallel before M10.
   "HQ LOA Processing" is a log-only entry — no user milestone.
──────────────────────────────────────────────────────────────────────── */
const FLOW_STEPS = [
  {
    status: 'Submitted',
    label:  'Bill Submitted',
    dept:   'Vendor Portal',
    milestone: 'M1',
    note:   'Vendor raises invoice in VBTS app',
  },
  {
    status: 'Pending with AEE',
    label:  'AEE Processing',
    dept:   'AEE – Technical Wing',
    milestone: 'M2',
    note:   'GR/SE raised in SAP · Form-13 / Form-14 generated',
  },
  {
    status: 'Pending with DEE',
    label:  'DEE Review',
    dept:   'DEE – Engineering Division',
    milestone: 'M3',
    note:   'DEE verifies recoveries & supporting documents',
  },
  {
    status: 'Pending with EE',
    label:  'EE Approval',
    dept:   'EE – Executive Engineer',
    milestone: 'M4',
    note:   'EE verifies & forwards to Field Accounts',
  },
  {
    status: 'Invoice Posted',
    label:  'Invoice Posted & LOA Generated',
    dept:   'Field Accounts – AAO / JAO',
    milestone: 'M5 + M6',
    note:   'Invoice posting + LOA generation done simultaneously in SAP by Field AOs',
  },
  {
    status: 'Pending with Field SAO',
    label:  'Field SAO Verification',
    dept:   'Field SAO – Field Office',
    milestone: 'M7',
    note:   'Field SAO reviews in VBTS app & approves LOA in SAP',
  },
  {
    status: 'Pending with HQ SAO',
    label:  'HQ SAO Approval',
    dept:   'HQ SAO – Headquarters',
    milestone: 'M8',
    note:   'HQ SAO approves after subordinate review in SAP',
  },
  {
    status: 'HQ LOA Processing',
    label:  'HQ LOA Processing',
    dept:   'HQ Subordinates',
    milestone: null,            // log-only — no user milestone
    note:   'HQ SAO sends to subordinates · Status auto-updated (log only)',
    logOnly: true,
  },
  {
    status: 'LOA Processing',
    label:  'LOA / LOC Processing',
    dept:   'Loans (M9a)  &  B&R (M9b)',
    milestone: 'M9a + M9b',
    note:   'Parallel: Loans section approves LOA · B&R section approves LOC',
    parallel: true,
  },
  {
    status: 'Paid',
    label:  'Payment Released',
    dept:   'HQ SAO – Finance',
    milestone: 'M10',
    note:   'Final payment made to vendor by HQ SAO',
  },
];

const TERMINAL_NEG = ['Rejected', 'Sent Back by Accounts', 'Sent Back by HQ'];

function fmtAmt(v) {
  return '₹' + Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function stepState(bill, stepIdx) {
  const isNeg     = TERMINAL_NEG.includes(bill.status);
  const currentIdx = FLOW_STEPS.findIndex(s => s.status === bill.status);

  if (isNeg) {
    const lastGood = currentIdx === -1 ? -1 : currentIdx - 1;
    if (stepIdx <= lastGood)       return 'done';
    if (stepIdx === lastGood + 1)  return 'rejected';
    return 'future';
  }

  if (currentIdx === -1) return 'future';
  if (stepIdx < currentIdx)  return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'future';
}

function logEntryForStep(bill, step) {
  if (!bill.log) return null;
  return bill.log.find(l => l.status === step.status) || null;
}

/* ── Step icon ─────────────────────────────────────────────────────── */
function StepIcon({ state, logOnly }) {
  if (state === 'done') return (
    <div className="w-8 h-8 rounded-full bg-ap-green flex items-center justify-center flex-shrink-0 shadow-sm">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
  if (state === 'active') return (
    <div className="w-8 h-8 rounded-full bg-ap-blue-mid flex items-center justify-center flex-shrink-0 shadow-md ring-4 ring-ap-blue-light">
      <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
    </div>
  );
  if (state === 'rejected') return (
    <div className="w-8 h-8 rounded-full bg-ap-red flex items-center justify-center flex-shrink-0 shadow-sm">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );
  // future
  return logOnly ? (
    <div className="w-8 h-8 rounded-full border-2 border-dashed border-ap-gray-300 bg-ap-gray-50 flex items-center justify-center flex-shrink-0">
      <svg className="w-3 h-3 text-ap-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
      </svg>
    </div>
  ) : (
    <div className="w-8 h-8 rounded-full border-2 border-dashed border-ap-gray-300 bg-white flex items-center justify-center flex-shrink-0">
      <div className="w-2 h-2 rounded-full bg-ap-gray-200" />
    </div>
  );
}

function Connector({ state }) {
  return (
    <div className={`flex-1 w-0.5 min-h-6 ${state === 'done' ? 'bg-ap-green' : 'bg-ap-gray-200'}`} />
  );
}

/* ── Parallel branch display (M9a + M9b) ─────────────────────────── */
function ParallelBranches({ state }) {
  const done   = state === 'done';
  const active = state === 'active';
  const branchCls = done
    ? 'border-ap-green bg-ap-green-light'
    : active
      ? 'border-ap-blue-mid bg-ap-blue-light'
      : 'border-ap-gray-200 bg-ap-gray-50';
  const textCls = done ? 'text-ap-green' : active ? 'text-ap-blue-mid' : 'text-ap-gray-400';

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {[
        { id: 'M9a', title: 'Loans Section', desc: 'LOA Approval',  tag: 'Loans' },
        { id: 'M9b', title: 'B&R Section',   desc: 'LOC Approval',  tag: 'B&R' },
      ].map(b => (
        <div key={b.id} className={`rounded-lg border p-2.5 ${branchCls}`}>
          <div className="flex items-center gap-1.5 mb-1">
            {done
              ? <svg className="w-3 h-3 text-ap-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              : active
                ? <div className="w-2 h-2 rounded-full bg-ap-blue-mid animate-pulse" />
                : <div className="w-2 h-2 rounded-full border border-ap-gray-300" />}
            <span className={`text-xs font-bold ${textCls}`}>{b.id}</span>
            <span className={`text-xs font-semibold ${textCls}`}>· {b.tag}</span>
          </div>
          <div className="text-xs font-semibold text-ap-gray-700">{b.title}</div>
          <div className="text-xs text-ap-gray-500">{b.desc}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Main BillTimeline component ──────────────────────────────────── */
export default function BillTimeline({ bill }) {
  const isNeg = TERMINAL_NEG.includes(bill.status);

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

      {/* Timeline */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-ap-blue-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-sm font-bold text-ap-blue">Bill Processing Timeline</span>
          {isNeg && (
            <span className="ml-2 text-xs font-semibold text-ap-red bg-ap-red-light px-2 py-0.5 rounded-full">
              {bill.status}
            </span>
          )}
        </div>

        <div className="pl-1">
          {FLOW_STEPS.map((step, idx) => {
            const state    = stepState(bill, idx);
            const logEntry = logEntryForStep(bill, step);
            const isLast   = idx === FLOW_STEPS.length - 1;

            const labelColor =
              state === 'done'     ? 'text-ap-gray-800' :
              state === 'active'   ? 'text-ap-blue font-bold' :
              state === 'rejected' ? 'text-ap-red' :
              step.logOnly         ? 'text-ap-gray-400 italic' :
              'text-ap-gray-400';

            const deptColor =
              state === 'done'     ? 'text-ap-green' :
              state === 'active'   ? 'text-ap-blue-mid' :
              state === 'rejected' ? 'text-ap-red' :
              'text-ap-gray-300';

            return (
              <div key={step.status} className="flex gap-3">
                  <div className="flex flex-col items-center flex-shrink-0 w-8">
                    <StepIcon state={state} logOnly={step.logOnly} />
                    {!isLast && <Connector state={state} />}
                  </div>

                  <div className="flex-1 min-w-0 pt-1 pb-5">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        {/* Milestone tag + label */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {step.milestone && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none
                              ${state === 'done'   ? 'bg-ap-green text-white'     :
                                state === 'active' ? 'bg-ap-blue-mid text-white'  :
                                'bg-ap-gray-200 text-ap-gray-500'}`}>
                              {step.milestone}
                            </span>
                          )}
                          {step.logOnly && (
                            <span className="text-[9px] font-semibold bg-ap-gray-100 text-ap-gray-400 px-1.5 py-0.5 rounded leading-none">
                              LOG ONLY
                            </span>
                          )}
                          <span className={`text-sm font-semibold ${labelColor}`}>{step.label}</span>
                        </div>
                        {/* Department */}
                        <div className={`text-xs font-medium mt-0.5 ${deptColor}`}>{step.dept}</div>
                        {/* Note (shown for done/active) */}
                        {(state === 'done' || state === 'active') && step.note && (
                          <div className="text-xs text-ap-gray-400 mt-0.5 leading-snug">{step.note}</div>
                        )}
                        {/* Parallel branches (M9a + M9b) */}
                        {step.parallel && (state === 'done' || state === 'active') && (
                          <ParallelBranches state={state} />
                        )}
                        {/* Log action */}
                        {logEntry?.action && logEntry.action !== `Status → ${step.status}` && (
                          <div className="text-xs text-ap-gray-500 mt-1 italic">{logEntry.action}</div>
                        )}
                      </div>
                      {/* Timestamp */}
                      {logEntry && (
                        <div className="text-right text-xs text-ap-gray-500 shrink-0">
                          <div className="font-semibold">{logEntry.date}</div>
                          {logEntry.by && <div className="text-ap-gray-400">{logEntry.by}</div>}
                        </div>
                      )}
                      {state === 'active' && !logEntry && (
                        <span className="text-xs text-ap-blue-mid font-semibold bg-ap-blue-light px-2 py-0.5 rounded-full animate-pulse shrink-0">
                          In Progress
                        </span>
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
