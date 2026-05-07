import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell({ nav, activePage, onNavigate, pageTitle, roleLabel, userName, userId,
  avatarLabel, avatarBg, onNotif, notifCount, topActions, children }) {
  return (
    <div className="flex h-screen" style={{ background: '#f8f9fb' }}>
      <Sidebar
        nav={nav}
        activePage={activePage}
        onNavigate={onNavigate}
        roleLabel={roleLabel}
        userName={userName}
        userId={userId}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar
          userName={userName}
          roleLabel={roleLabel}
          avatarLabel={avatarLabel}
          avatarBg={avatarBg}
          onNotif={onNotif}
          notifCount={notifCount}
          actions={topActions}
        />
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
