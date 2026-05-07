import { useState } from 'react';
import { AppContext } from './context/AppContext';
import Login from './pages/Login';
import ManagementApp from './pages/management/ManagementApp';
import VendorApp from './pages/vendor/VendorApp';
import EmployeeApp from './pages/employee/EmployeeApp';
import Toast from './components/ui/Toast';

/* ── Seed bills covering all 10 flowchart milestones (M1–M10) ─────────
   Ref: VBTS Milestone Flow Diagram v1.4, April 2026
──────────────────────────────────────────────────────────────────────── */
const SEED_BILLS = [
  /* M1 – Submitted */
  {
    billId: 'VBTS-001234-MAT-260501-001', eInvNo: 'INV/2025-26/M/0041', poNo: '4500001234',
    type: 'Material', vendorId: '101161', date: '01/05/2026', status: 'Submitted',
    grossAmt: 1180000, pendingWith: 'AEE – Technical Wing', pendingDesig: '', wing: 'Electrical',
    log: [
      { date: '01/05/2026', action: 'Bill Submitted by Vendor', by: 'KMV Projects Limited', status: 'Submitted' },
    ],
  },
  /* M2 – Pending with AEE (GR/SE raised in SAP, Form-13/Form-14 generated) */
  {
    billId: 'VBTS-005678-SVC-260425-001', eInvNo: 'INV/2025-26/S/0088', poNo: '4500005678',
    type: 'Service', vendorId: '101161', date: '25/04/2026', status: 'Pending with AEE',
    grossAmt: 590000, pendingWith: 'AEE – Technical Wing', pendingDesig: '', wing: 'Civil',
    log: [
      { date: '25/04/2026', action: 'Bill Submitted by Vendor', by: 'KMV Projects Limited', status: 'Submitted' },
      { date: '26/04/2026', action: 'Forwarded to AEE – GR/SE to be raised in SAP · Form-13/14 pending', by: 'System', status: 'Pending with AEE' },
    ],
  },
  /* M3 – Pending with DEE (recoveries & documents verified) */
  {
    billId: 'VBTS-009012-MAT-260420-001', eInvNo: 'INV/2025-26/M/0103', poNo: '4500009012',
    type: 'Material', vendorId: '100720', date: '20/04/2026', status: 'Pending with DEE',
    grossAmt: 2360000, pendingWith: 'DEE – Engineering Division', pendingDesig: '', wing: 'Electrical',
    log: [
      { date: '20/04/2026', action: 'Bill Submitted by Vendor', by: 'G.V.Pratap Reddy', status: 'Submitted' },
      { date: '21/04/2026', action: 'AEE processed: GR/SE raised, Form-13/14 generated in SAP', by: 'AEE Office', status: 'Pending with AEE' },
      { date: '23/04/2026', action: 'Forwarded to DEE for recoveries & document verification', by: 'AEE Office', status: 'Pending with DEE' },
    ],
  },
  /* M4 – Pending with EE (EE forwards to Field Accounts) */
  {
    billId: 'VBTS-003456-SVC-260418-001', eInvNo: 'INV/2025-26/S/0122', poNo: '4500003456',
    type: 'Service', vendorId: '101992', date: '18/04/2026', status: 'Pending with EE',
    grossAmt: 885000, pendingWith: 'EE – Executive Engineer', pendingDesig: '', wing: 'Electrical',
    log: [
      { date: '18/04/2026', action: 'Bill Submitted by Vendor', by: 'S & S Electricals', status: 'Submitted' },
      { date: '19/04/2026', action: 'AEE processed: GR/SE & Form-13/14 raised in SAP', by: 'AEE Office', status: 'Pending with AEE' },
      { date: '20/04/2026', action: 'DEE verified recoveries & documents', by: 'DEE Office', status: 'Pending with DEE' },
      { date: '22/04/2026', action: 'Forwarded to EE for approval before Field Accounts', by: 'DEE Office', status: 'Pending with EE' },
    ],
  },
  /* M5+M6 – Invoice Posted (Field AOs — simultaneous invoice posting + LOA generation in SAP) */
  {
    billId: 'VBTS-007890-MAT-260415-001', eInvNo: 'INV/2025-26/M/0144', poNo: '4500007890',
    type: 'Material', vendorId: '102984', date: '15/04/2026', status: 'Invoice Posted',
    grossAmt: 3540000, pendingWith: 'Field Accounts (AAO/JAO)', pendingDesig: '', wing: 'Civil',
    log: [
      { date: '15/04/2026', action: 'Bill Submitted by Vendor', by: 'Vertex Engineers', status: 'Submitted' },
      { date: '16/04/2026', action: 'AEE: GR/SE raised, Form-13/14 generated in SAP', by: 'AEE Office', status: 'Pending with AEE' },
      { date: '17/04/2026', action: 'DEE verified recoveries', by: 'DEE Office', status: 'Pending with DEE' },
      { date: '18/04/2026', action: 'EE approved & forwarded to Field Accounts', by: 'EE Office', status: 'Pending with EE' },
      { date: '20/04/2026', action: 'M5+M6: Invoice posted & LOA generated simultaneously in SAP by Field AAO/JAO', by: 'Field Accounts', status: 'Invoice Posted' },
    ],
  },
  /* M7 – Pending with Field SAO (LOA review & approval in SAP) */
  {
    billId: 'VBTS-002345-HR-260410-001', eInvNo: 'INV/2025-26/H/0011', poNo: '4500002345',
    type: 'HR', vendorId: '101161', date: '10/04/2026', status: 'Pending with Field SAO',
    grossAmt: 420000, pendingWith: 'Field SAO – Field Office', pendingDesig: '', wing: 'Electrical',
    log: [
      { date: '10/04/2026', action: 'Bill Submitted by Vendor', by: 'KMV Projects Limited', status: 'Submitted' },
      { date: '11/04/2026', action: 'AEE: GR/SE raised, Form-13/14 generated', by: 'AEE Office', status: 'Pending with AEE' },
      { date: '12/04/2026', action: 'DEE verified documents', by: 'DEE Office', status: 'Pending with DEE' },
      { date: '13/04/2026', action: 'EE approved & forwarded to Field Accounts', by: 'EE Office', status: 'Pending with EE' },
      { date: '14/04/2026', action: 'Invoice posted & LOA generated in SAP (M5+M6)', by: 'Field Accounts', status: 'Invoice Posted' },
      { date: '16/04/2026', action: 'Forwarded to Field SAO for LOA verification & SAP approval', by: 'Field Accounts', status: 'Pending with Field SAO' },
    ],
  },
  /* M8 – Pending with HQ SAO (after subordinate review in SAP) */
  {
    billId: 'VBTS-006789-MAT-260405-001', eInvNo: 'INV/2025-26/M/0167', poNo: '4500006789',
    type: 'Material', vendorId: '100720', date: '05/04/2026', status: 'Pending with HQ SAO',
    grossAmt: 1770000, pendingWith: 'HQ SAO – Headquarters', pendingDesig: '', wing: 'Electrical',
    log: [
      { date: '05/04/2026', action: 'Bill Submitted by Vendor', by: 'G.V.Pratap Reddy', status: 'Submitted' },
      { date: '06/04/2026', action: 'AEE: GR/SE & Form-13/14 raised in SAP', by: 'AEE Office', status: 'Pending with AEE' },
      { date: '07/04/2026', action: 'DEE verified recoveries & documents', by: 'DEE Office', status: 'Pending with DEE' },
      { date: '08/04/2026', action: 'EE approved', by: 'EE Office', status: 'Pending with EE' },
      { date: '09/04/2026', action: 'Invoice posted & LOA generated in SAP (M5+M6)', by: 'Field Accounts', status: 'Invoice Posted' },
      { date: '10/04/2026', action: 'Field SAO reviewed & approved LOA in SAP', by: 'Field SAO', status: 'Pending with Field SAO' },
      { date: '12/04/2026', action: 'Escalated to HQ SAO for final LOA approval', by: 'Field SAO', status: 'Pending with HQ SAO' },
    ],
  },
  /* M9a+M9b – LOA Processing (Loans & B&R parallel) */
  {
    billId: 'VBTS-004567-SVC-260401-001', eInvNo: 'INV/2025-26/S/0189', poNo: '4500004567',
    type: 'Service', vendorId: '101992', date: '01/04/2026', status: 'LOA Processing',
    grossAmt: 708000, pendingWith: 'Loans & B&R Section (HQ)', pendingDesig: '', wing: 'Civil',
    log: [
      { date: '01/04/2026', action: 'Bill Submitted by Vendor', by: 'S & S Electricals', status: 'Submitted' },
      { date: '02/04/2026', action: 'AEE processed in SAP', by: 'AEE Office', status: 'Pending with AEE' },
      { date: '03/04/2026', action: 'DEE verified', by: 'DEE Office', status: 'Pending with DEE' },
      { date: '04/04/2026', action: 'EE approved', by: 'EE Office', status: 'Pending with EE' },
      { date: '05/04/2026', action: 'Invoice posted & LOA generated (M5+M6)', by: 'Field Accounts', status: 'Invoice Posted' },
      { date: '06/04/2026', action: 'Field SAO approved LOA in SAP', by: 'Field SAO', status: 'Pending with Field SAO' },
      { date: '07/04/2026', action: 'HQ SAO approved after subordinate review', by: 'HQ SAO', status: 'Pending with HQ SAO' },
      { date: '08/04/2026', action: 'HQ SAO sends to subordinates — HQ LOA Processing (auto log)', by: 'System', status: 'HQ LOA Processing' },
      { date: '09/04/2026', action: 'M9a (Loans): LOA sent to Loans section · M9b (B&R): LOC sent to B&R section — parallel processing', by: 'HQ SAO', status: 'LOA Processing' },
    ],
  },
  /* M10 – Paid */
  {
    billId: 'VBTS-008901-MAT-260325-001', eInvNo: 'INV/2025-26/M/0201', poNo: '4500008901',
    type: 'Material', vendorId: '102984', date: '25/03/2026', status: 'Paid',
    grossAmt: 944000, pendingWith: null, pendingDesig: null, wing: 'Telecom',
    log: [
      { date: '25/03/2026', action: 'Bill Submitted by Vendor', by: 'Vertex Engineers', status: 'Submitted' },
      { date: '26/03/2026', action: 'AEE processed in SAP', by: 'AEE Office', status: 'Pending with AEE' },
      { date: '27/03/2026', action: 'DEE verified recoveries & documents', by: 'DEE Office', status: 'Pending with DEE' },
      { date: '28/03/2026', action: 'EE approved & forwarded', by: 'EE Office', status: 'Pending with EE' },
      { date: '29/03/2026', action: 'Invoice posted & LOA generated in SAP (M5+M6)', by: 'Field Accounts', status: 'Invoice Posted' },
      { date: '30/03/2026', action: 'Field SAO approved LOA', by: 'Field SAO', status: 'Pending with Field SAO' },
      { date: '31/03/2026', action: 'HQ SAO approved after subordinate review', by: 'HQ SAO', status: 'Pending with HQ SAO' },
      { date: '01/04/2026', action: 'HQ SAO sends to subordinates (auto log)', by: 'System', status: 'HQ LOA Processing' },
      { date: '02/04/2026', action: 'M9a+M9b: Loans & B&R both approved (parallel processing complete)', by: 'Loans & B&R', status: 'LOA Processing' },
      { date: '03/04/2026', action: 'Final payment transferred via RTGS by HQ SAO', by: 'HQ SAO', status: 'Paid' },
    ],
  },
  /* Rejected */
  {
    billId: 'VBTS-007777-SVC-260428-001', eInvNo: 'INV/2025-26/S/0210', poNo: '4500007777',
    type: 'Service', vendorId: '101161', date: '28/04/2026', status: 'Rejected',
    grossAmt: 325000, pendingWith: null, pendingDesig: null, wing: 'Electrical',
    log: [
      { date: '28/04/2026', action: 'Bill Submitted by Vendor', by: 'KMV Projects Limited', status: 'Submitted' },
      { date: '29/04/2026', action: 'AEE forwarded to DEE', by: 'AEE Office', status: 'Pending with AEE' },
      { date: '30/04/2026', action: 'Rejected by DEE — Invoice amount mismatch with PO value', by: 'DEE Office', status: 'Rejected' },
    ],
  },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [submittedBills, setSubmittedBills] = useState(SEED_BILLS);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  const ctx = { user, login, logout, showToast, submittedBills, setSubmittedBills };

  return (
    <AppContext.Provider value={ctx}>
      <div className="min-h-screen">
        {!user && <Login />}
        {user?.role === 'management' && <ManagementApp />}
        {user?.role === 'vendor'     && <VendorApp />}
        {user?.role === 'employee'   && <EmployeeApp />}
      </div>
      {toast && <Toast msg={toast.msg} isError={toast.isError} />}
    </AppContext.Provider>
  );
}
