import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import AppShell from '../../components/layout/AppShell';
import MgmtDashboard from './MgmtDashboard';
import FYReport from './FYReport';
import ProjectReport from './ProjectReport';
import PendingReport from './PendingReport';
import VendorReport from './VendorReport';

const NAV = [{
  label: 'Reports',
  items: [
    { id: 'dashboard',  label: 'Management Dashboard', icon: '📊' },
    { id: 'fy',         label: 'FY-wise Report',        icon: '📅' },
    { id: 'project',    label: 'Project-wise Report',   icon: '🏗️' },
    { id: 'pending',    label: 'Pending Bills Report',  icon: '⏳' },
    { id: 'vendor',     label: 'Vendor-wise Report',    icon: '🏭' },
  ]
}];

const PAGE_TITLES = {
  dashboard: 'Management Dashboard',
  fy:        'FY-wise Report',
  project:   'Project-wise Report',
  pending:   'Pending Bills – Aging Report',
  vendor:    'Vendor-wise Report',
};

export default function ManagementApp() {
  const { user } = useApp();
  const [page, setPage] = useState('dashboard');

  return (
    <AppShell
      nav={NAV}
      activePage={page}
      onNavigate={setPage}
      pageTitle={PAGE_TITLES[page]}
      roleLabel="APTRANSCO"
      userName={user?.name || 'Director'}
      userId="Senior Officer"
      avatarLabel="MD"
      avatarBg="bg-yellow-500"
    >
      {page === 'dashboard' && <MgmtDashboard />}
      {page === 'fy'        && <FYReport />}
      {page === 'project'   && <ProjectReport />}
      {page === 'pending'   && <PendingReport />}
      {page === 'vendor'    && <VendorReport />}
    </AppShell>
  );
}
