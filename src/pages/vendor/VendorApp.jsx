import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import AppShell from '../../components/layout/AppShell';
import VendorDashboard from './VendorDashboard';
import SubmitInvoice from './SubmitInvoice';
import MyBills from './MyBills';
import MyPOs from './MyPOs';
import VendorInbox from './VendorInbox';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  submit:    'Submit Invoice / HR',
  bills:     'My Bills',
  pos:       'My Purchase Orders',
  inbox:     'Inbox & Notifications',
};

export default function VendorApp() {
  const { user, submittedBills } = useApp();
  const [page, setPage] = useState('dashboard');

  const myBills    = submittedBills.filter(b => String(b.vendorId) === String(user?.id));
  const actionReqd = myBills.filter(b => ['Sent Back by Accounts','Sent Back by HQ','Rejected'].includes(b.status));

  const nav = [{
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard',           icon: '⊞' },
      { id: 'submit',    label: 'Submit Invoice / HR', icon: '📄' },
      { id: 'bills',     label: 'My Bills',            icon: '🧾' },
      { id: 'pos',       label: 'My Purchase Orders',  icon: '📋' },
      { id: 'inbox',     label: 'Inbox',               icon: '📬', badge: actionReqd.length || null },
    ]
  }];

  const avatarLabel = (user?.name || 'VD').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  return (
    <AppShell
      nav={nav}
      activePage={page}
      onNavigate={setPage}
      pageTitle={PAGE_TITLES[page]}
      roleLabel={user?.name}
      userName={user?.name}
      userId={`Vendor ID: ${user?.id}`}
      avatarLabel={avatarLabel}
      avatarBg="bg-green-600"
      onNotif={() => setPage('inbox')}
      notifCount={actionReqd.length}
    >
      {page === 'dashboard' && <VendorDashboard onNavigate={setPage} />}
      {page === 'submit'    && <SubmitInvoice />}
      {page === 'bills'     && <MyBills />}
      {page === 'pos'       && <MyPOs />}
      {page === 'inbox'     && <VendorInbox />}
    </AppShell>
  );
}
