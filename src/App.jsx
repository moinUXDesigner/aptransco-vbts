import { useState } from 'react';
import { AppContext } from './context/AppContext';
import Login from './pages/Login';
import ManagementApp from './pages/management/ManagementApp';
import VendorApp from './pages/vendor/VendorApp';
import EmployeeApp from './pages/employee/EmployeeApp';
import Toast from './components/ui/Toast';

const SEED_BILLS = [
  {
    billId: 'VBTS-001234-MAT-260101-001', eInvNo: 'INV/2025-26/M/0041', poNo: '4500001234',
    type: 'Material', vendorId: '101161', date: '01/04/2026', status: 'Submitted',
    grossAmt: 1180000, pendingWith: 'K. Ravi Kumar', pendingDesig: 'AEE (Electrical)', wing: 'Electrical',
    log: [
      { date: '01/04/2026', action: 'Bill Submitted by Vendor', by: 'KMV Projects Limited', status: 'Submitted' },
    ],
  },
  {
    billId: 'VBTS-005678-SVC-260110-001', eInvNo: 'INV/2025-26/S/0088', poNo: '4500005678',
    type: 'Service', vendorId: '101161', date: '10/04/2026', status: 'Pending with AEE',
    grossAmt: 590000, pendingWith: 'S. Nagarjuna', pendingDesig: 'AEE (Civil)', wing: 'Civil',
    log: [
      { date: '10/04/2026', action: 'Bill Submitted by Vendor', by: 'KMV Projects Limited', status: 'Submitted' },
      { date: '11/04/2026', action: 'Forwarded to AEE (Civil) S. Nagarjuna', by: 'System', status: 'Pending with AEE' },
    ],
  },
  {
    billId: 'VBTS-009012-MAT-260115-001', eInvNo: 'INV/2025-26/M/0103', poNo: '4500009012',
    type: 'Material', vendorId: '100720', date: '15/04/2026', status: 'Under Verification',
    grossAmt: 2360000, pendingWith: 'P. Suresh Babu', pendingDesig: 'AAO (Accounts)', wing: 'Electrical',
    log: [
      { date: '15/04/2026', action: 'Bill Submitted by Vendor', by: 'G.V.Pratap Reddy', status: 'Submitted' },
      { date: '16/04/2026', action: 'Forwarded to AEE for verification', by: 'System', status: 'Pending with AEE' },
      { date: '18/04/2026', action: 'Moved to Accounts for verification', by: 'Employee', status: 'Under Verification' },
    ],
  },
  {
    billId: 'VBTS-003456-SVC-260118-001', eInvNo: 'INV/2025-26/S/0122', poNo: '4500003456',
    type: 'Service', vendorId: '101992', date: '18/04/2026', status: 'Reviewed by Engineer',
    grossAmt: 885000, pendingWith: 'M. Hari Babu', pendingDesig: 'AE (Electrical)', wing: 'Electrical',
    log: [
      { date: '18/04/2026', action: 'Bill Submitted by Vendor', by: 'S & S Electricals', status: 'Submitted' },
      { date: '19/04/2026', action: 'Sent to AEE', by: 'System', status: 'Pending with AEE' },
      { date: '20/04/2026', action: 'Under Accounts verification', by: 'Employee', status: 'Under Verification' },
      { date: '22/04/2026', action: 'Engineer reviewed and cleared', by: 'M. Hari Babu', status: 'Reviewed by Engineer' },
    ],
  },
  {
    billId: 'VBTS-007890-MAT-260420-001', eInvNo: 'INV/2025-26/M/0144', poNo: '4500007890',
    type: 'Material', vendorId: '102984', date: '20/04/2026', status: 'Form13 Updated',
    grossAmt: 3540000, pendingWith: 'V. Lakshmi Devi', pendingDesig: 'AAO (Accounts)', wing: 'Civil',
    log: [
      { date: '20/04/2026', action: 'Bill Submitted by Vendor', by: 'Vertex Engineers', status: 'Submitted' },
      { date: '21/04/2026', action: 'Sent to AEE', by: 'System', status: 'Pending with AEE' },
      { date: '22/04/2026', action: 'Verification started', by: 'Employee', status: 'Under Verification' },
      { date: '23/04/2026', action: 'Engineer review complete', by: 'Employee', status: 'Reviewed by Engineer' },
      { date: '25/04/2026', action: 'Form-13 entry updated in SAP', by: 'V. Lakshmi Devi', status: 'Form13 Updated' },
    ],
  },
  {
    billId: 'VBTS-002345-HR-260422-001', eInvNo: 'INV/2025-26/H/0011', poNo: '4500002345',
    type: 'HR', vendorId: '101161', date: '22/04/2026', status: 'Form14 Updated',
    grossAmt: 420000, pendingWith: 'T. Ramakrishna', pendingDesig: 'SAO (HQ)', wing: 'Electrical',
    log: [
      { date: '22/04/2026', action: 'Bill Submitted by Vendor', by: 'KMV Projects Limited', status: 'Submitted' },
      { date: '23/04/2026', action: 'Sent to AEE', by: 'System', status: 'Pending with AEE' },
      { date: '24/04/2026', action: 'Accounts verification', by: 'Employee', status: 'Under Verification' },
      { date: '25/04/2026', action: 'Engineer reviewed', by: 'Employee', status: 'Reviewed by Engineer' },
      { date: '26/04/2026', action: 'Form-13 updated', by: 'Employee', status: 'Form13 Updated' },
      { date: '28/04/2026', action: 'Form-14 payment order generated', by: 'T. Ramakrishna', status: 'Form14 Updated' },
    ],
  },
  {
    billId: 'VBTS-006789-MAT-260425-001', eInvNo: 'INV/2025-26/M/0167', poNo: '4500006789',
    type: 'Material', vendorId: '100720', date: '25/04/2026', status: 'Approved',
    grossAmt: 1770000, pendingWith: 'Director (Finance)', pendingDesig: 'Director', wing: 'Electrical',
    log: [
      { date: '25/04/2026', action: 'Bill Submitted by Vendor', by: 'G.V.Pratap Reddy', status: 'Submitted' },
      { date: '26/04/2026', action: 'Forwarded', by: 'System', status: 'Pending with AEE' },
      { date: '27/04/2026', action: 'Verification done', by: 'Employee', status: 'Under Verification' },
      { date: '28/04/2026', action: 'Reviewed', by: 'Employee', status: 'Reviewed by Engineer' },
      { date: '29/04/2026', action: 'Form-13 done', by: 'Employee', status: 'Form13 Updated' },
      { date: '30/04/2026', action: 'Form-14 done', by: 'Employee', status: 'Form14 Updated' },
      { date: '01/05/2026', action: 'Approved by HOD', by: 'Director', status: 'Approved' },
    ],
  },
  {
    billId: 'VBTS-004567-SVC-260428-001', eInvNo: 'INV/2025-26/S/0189', poNo: '4500004567',
    type: 'Service', vendorId: '101992', date: '28/04/2026', status: 'Paid',
    grossAmt: 708000, pendingWith: null, pendingDesig: null, wing: 'Civil',
    log: [
      { date: '28/04/2026', action: 'Bill Submitted by Vendor', by: 'S & S Electricals', status: 'Submitted' },
      { date: '29/04/2026', action: 'Forwarded', by: 'System', status: 'Pending with AEE' },
      { date: '30/04/2026', action: 'Verified', by: 'Employee', status: 'Under Verification' },
      { date: '01/05/2026', action: 'Reviewed', by: 'Employee', status: 'Reviewed by Engineer' },
      { date: '02/05/2026', action: 'Form-13 done', by: 'Employee', status: 'Form13 Updated' },
      { date: '03/05/2026', action: 'Form-14 done', by: 'Employee', status: 'Form14 Updated' },
      { date: '04/05/2026', action: 'Approved', by: 'Director', status: 'Approved' },
      { date: '05/05/2026', action: 'Payment transferred via RTGS', by: 'Finance Dept', status: 'Paid' },
    ],
  },
  {
    billId: 'VBTS-008901-MAT-260430-001', eInvNo: 'INV/2025-26/M/0201', poNo: '4500008901',
    type: 'Material', vendorId: '102984', date: '30/04/2026', status: 'Rejected',
    grossAmt: 944000, pendingWith: null, pendingDesig: null, wing: 'Telecom',
    log: [
      { date: '30/04/2026', action: 'Bill Submitted by Vendor', by: 'Vertex Engineers', status: 'Submitted' },
      { date: '01/05/2026', action: 'Forwarded', by: 'System', status: 'Pending with AEE' },
      { date: '02/05/2026', action: 'Rejected – Invoice mismatch with PO', by: 'Employee', status: 'Rejected' },
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
