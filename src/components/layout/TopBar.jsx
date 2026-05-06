import { Bell, ChevronDown } from 'lucide-react';

export default function TopBar({ title, userName, roleLabel, avatarLabel, avatarBg, onNotif, notifCount, actions }) {
  return (
    <div
      className="bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-40"
      style={{ height: 56, fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      {/* Left: page title is shown in the content area, topbar is clean */}
      <div style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}>{actions}</div>

      {/* Right: bell + user */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notification bell */}
        {onNotif && (
          <button
            onClick={onNotif}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} strokeWidth={1.8} className="text-gray-500" />
            {notifCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center font-bold border-2 border-white"
                style={{ fontSize: 9 }}
              >
                {notifCount}
              </span>
            )}
          </button>
        )}

        {/* User pill */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarBg || 'bg-blue-600'}`}
          >
            {avatarLabel}
          </div>
          <div className="hidden sm:block leading-tight">
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', fontFamily: "'Segoe UI', sans-serif" }}>
              {userName}
            </div>
            {roleLabel && (
              <div style={{ fontSize: 11, color: '#6b7280', fontFamily: "'Segoe UI', sans-serif" }}>
                {roleLabel}
              </div>
            )}
          </div>
          <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
