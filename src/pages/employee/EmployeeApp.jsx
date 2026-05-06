import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import AppShell from '../../components/layout/AppShell';
import EmpDashboard from './EmpDashboard';
import PendingBills from './PendingBills';
import AllBills from './AllBills';
import Payments from './Payments';
import Form14 from './Form14';
import EmployeeDir from './EmployeeDir';
import POAssign from './POAssign';

const PAGE_TITLES = {
  dashboard:  'Dashboard',
  pending:    'Pending Bills',
  allbills:   'All Bills',
  payments:   'Payment Records',
  form14:     'Form 14 Records',
  employees:  'Employee Directory',
  poassign:   'Engineer PO Mapping',
};

export default function EmployeeApp() {
  const { user, submittedBills } = useApp();
  const [page, setPage] = useState('dashboard');

  const pendingCount = submittedBills.filter(b => !['Paid','Rejected'].includes(b.status)).length;

  const nav = [
    {
      label: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard',         icon: '⊞' },
        { id: 'pending',   label: 'Pending Bills',     icon: '⏳', badge: pendingCount || null },
        { id: 'allbills',  label: 'All Bills',         icon: '🧾' },
        { id: 'payments',  label: 'Payment Records',   icon: '💳' },
        { id: 'form14',    label: 'Form 14 Records',   icon: '📄' },
      ]
    },
    {
      label: 'Admin',
      items: [
        { id: 'employees', label: 'Employee Directory', icon: '👥' },
        { id: 'poassign',  label: 'PO-Engineer Mapping', icon: '🔗' },
      ]
    }
  ];

  const initials = (user?.name || 'EP').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  return (
    <AppShell
      nav={nav}
      activePage={page}
      onNavigate={setPage}
      pageTitle={PAGE_TITLES[page]}
      roleLabel="APTRANSCO"
      userName={user?.name}
      userId={`ID: ${user?.id}`}
      avatarLabel={initials}
      avatarBg="bg-blue-700"
    >
      {page === 'dashboard' && <EmpDashboard />}
      {page === 'pending'   && <PendingBills />}
      {page === 'allbills'  && <AllBills />}
      {page === 'payments'  && <Payments />}
      {page === 'form14'    && <Form14 />}
      {page === 'employees' && <EmployeeDir />}
      {page === 'poassign'  && <POAssign />}
    </AppShell>
  );
}
