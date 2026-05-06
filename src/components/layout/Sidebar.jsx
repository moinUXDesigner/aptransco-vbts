import { useState } from 'react';
import {
  LayoutDashboard, FilePlus, Receipt, ClipboardList, Inbox, Clock,
  BarChart2, Calendar, HardHat, Factory, FileText, CreditCard,
  Users, Link, ChevronLeft, ChevronRight, LogOut, FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import aptranscoLogo from '../../assets/aptransco-logo.png';

const ICON_MAP = {
  // Management
  dashboard:  BarChart2,
  fy:         Calendar,
  project:    HardHat,
  pending:    Clock,
  vendor:     Factory,
  // Vendor
  submit:     FilePlus,
  bills:      Receipt,
  pos:        ClipboardList,
  inbox:      Inbox,
  // Employee
  allbills:   FileText,
  payments:   CreditCard,
  form14:     FileCheck,
  employees:  Users,
  poassign:   Link,
};

function NavIcon({ id, size = 17 }) {
  const Icon = ICON_MAP[id] || LayoutDashboard;
  return <Icon size={size} strokeWidth={1.8} />;
}

export default function Sidebar({ nav, activePage, onNavigate, roleLabel, userName, userId, sidebarTitle = 'VBTS Portal', sidebarSubtitle = 'Vendor Bill Tracking System' }) {
  const { logout } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto bg-white border-r border-gray-200 transition-all duration-200"
      style={{ width: collapsed ? 64 : 220, fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      {/* ── Brand ── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-100">
          <img src={aptranscoLogo} alt="APTRANSCO" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div
              className="text-gray-900 leading-tight truncate"
              style={{ fontSize: 15, fontFamily: "'Segoe UI', sans-serif", fontWeight: 700 }}
            >
              {sidebarTitle}
            </div>
            <div
              className="text-gray-400 truncate leading-tight mt-0.5"
              style={{ fontSize: 11, fontFamily: "'Segoe UI', sans-serif" }}
            >
              {sidebarSubtitle}
            </div>
          </div>
        )}
      </div>

      {/* ── User info ── */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="text-xs text-gray-400 truncate">{userName}</div>
          {userId && <div className="text-xs text-blue-600 font-medium truncate mt-0.5">{userId}</div>}
        </div>
      )}

      {/* ── "Menu" heading + collapse toggle ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        {!collapsed && (
          <span
            className="text-xs font-semibold text-gray-400 uppercase tracking-widest select-none"
            style={{ fontFamily: "'Segoe UI', sans-serif", letterSpacing: '0.08em' }}
          >
            Menu
          </span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="ml-auto p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 pb-2 space-y-0.5">
        {nav.map((section, si) => (
          <div key={si}>
            {section.label && !collapsed && (
              <div
                className="px-3 pt-4 pb-1 text-gray-400 uppercase"
                style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', fontFamily: "'Segoe UI', sans-serif" }}
              >
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 rounded-md transition-all duration-150 text-left relative
                    ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}
                    ${active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                  style={{ fontFamily: "'Segoe UI', sans-serif" }}
                >
                  {/* Left blue bar on active */}
                  {active && (
                    <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-blue-600" />
                  )}

                  {/* Icon */}
                  <span className={`flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`}>
                    <NavIcon id={item.id} size={17} />
                  </span>

                  {/* Label */}
                  {!collapsed && (
                    <span
                      className="flex-1 truncate"
                      style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}
                    >
                      {item.label}
                    </span>
                  )}

                  {/* Badge */}
                  {!collapsed && item.badge ? (
                    <span className="ml-auto bg-red-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0"
                      style={{ fontSize: 10, minWidth: 18, height: 18, padding: '0 5px' }}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Logout ── */}
      <div className="px-2 pb-4 border-t border-gray-100 pt-3">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
          style={{ fontFamily: "'Segoe UI', sans-serif" }}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={17} strokeWidth={1.8} className="flex-shrink-0" />
          {!collapsed && (
            <span style={{ fontSize: 14, fontWeight: 500 }}>Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}
