import { useState } from 'react';
import { User, Lock, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import aptranscoLogo from '../assets/aptransco-logo.png';
import { DEMO_CREDENTIALS, EMPLOYEES } from '../data/mockData';

const ROLES = [
  { value: 'employee',   label: 'Employee (Engineer / Accounts / Admin)' },
  { value: 'management', label: 'Management / Senior Officer' },
  { value: 'vendor',     label: 'Vendor (Contractor)' },
];

export default function Login() {
  const { login, showToast } = useApp();
  const [role, setRole]     = useState('employee');
  const [userId, setUserId] = useState('');
  const [password, setPass] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const creds = DEMO_CREDENTIALS;

    if (role === 'employee') {
      if (!userId.trim()) { showToast('Please enter Employee ID', true); return; }
      if (password !== creds.employee.password) { showToast('Invalid password. Default: abc123', true); return; }
      const emp = EMPLOYEES.find(e => String(e.id) === userId.trim()) ||
                  { name: 'Employee', designation: 'Officer', id: userId };
      login({ role: 'employee', id: userId, name: emp.name, designation: emp.designation });
    } else if (role === 'management') {
      if (userId !== creds.management.id || password !== creds.management.password) {
        showToast('Invalid credentials. User: director / Pass: mgmt123', true); return;
      }
      login({ role: 'management', id: 'director', name: 'Director' });
    } else if (role === 'vendor') {
      const vendorName = creds.vendor.ids[userId];
      if (!vendorName) { showToast('Vendor ID not found. Try: 101161, 100720, 101992, 102984', true); return; }
      if (password !== creds.vendor.password) { showToast('Invalid password. Default: abc123', true); return; }
      login({ role: 'vendor', id: userId, name: vendorName });
    }
  };

  const hintMap = {
    employee:   'Employee ID e.g. 1016309 · Password: abc123',
    management: 'User: director · Password: mgmt123',
    vendor:     'Vendor IDs: 101161, 100720, 101992, 102984 · Password: abc123',
  };

  const placeholderMap = {
    employee:   'Employee ID (e.g. 1016309)',
    management: 'Username (e.g. director)',
    vendor:     'Vendor Code (e.g. 101161)',
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #001F3F 0%, #003A70 40%, #005FAD 100%)',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Decorative glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full -top-36 -right-24 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)' }}
      />

      {/* ── Top header: logo + organisation name ── */}
      <div className="relative z-10 flex items-center gap-4 mb-8">
        {/* Logo box */}
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 p-1.5">
          <img
            src={aptranscoLogo}
            alt="APTRANSCO Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Org name */}
        <div className="text-left">
          <div
            className="text-white leading-snug tracking-wide"
            style={{ fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, fontSize: 18 }}
          >
            TRANSMISSION CORPORATION OF<br />ANDHRA PRADESH LIMITED
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
            Government of Andhra Pradesh Undertaking
          </div>
        </div>
      </div>

      {/* ── Login card ── */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Card header */}
          <div className="px-8 pt-8 pb-6">

            {/* Logo circle inside card */}
            <div className="flex justify-center mb-5">
              <div
                className="rounded-full bg-blue-600 flex items-center justify-center shadow-lg overflow-hidden"
                style={{ width: 64, height: 64, padding: 6 }}
              >
                <img
                  src={aptranscoLogo}
                  alt="APTRANSCO"
                  className="w-full h-full object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
            </div>

            <h2
              className="text-center text-gray-900 mb-1"
              style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Segoe UI', sans-serif" }}
            >
              VBTS Portal
            </h2>
            <p
              className="text-center mb-6"
              style={{ fontSize: 13, color: '#F5A623', fontFamily: "'Segoe UI', sans-serif" }}
            >
              Vendor Bill Tracking System
            </p>

            <form onSubmit={handleLogin} className="space-y-4">

              {/* Login As */}
              <div>
                <label
                  className="flex items-center gap-1.5 mb-1.5"
                  style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}
                >
                  <User size={14} style={{ color: '#005FAD' }} />
                  Login As
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full appearance-none border rounded-md px-3 pr-8 bg-white focus:outline-none transition-all"
                    style={{
                      borderColor: '#D8DBE2', paddingTop: 10, paddingBottom: 10,
                      fontSize: 13, color: '#2C3349',
                      fontFamily: "'Segoe UI', sans-serif",
                    }}
                    onFocus={e => e.target.style.borderColor = '#005FAD'}
                    onBlur={e => e.target.style.borderColor = '#D8DBE2'}
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: '#9EA7B8' }}
                  />
                </div>
              </div>

              {/* ID / Username */}
              <div>
                <label
                  className="flex items-center gap-1.5 mb-1.5"
                  style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}
                >
                  <User size={14} style={{ color: '#005FAD' }} />
                  {role === 'employee' ? 'Employee ID' : role === 'management' ? 'Username' : 'Vendor Code'}
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  placeholder={placeholderMap[role]}
                  className="w-full border rounded-md px-3 focus:outline-none transition-all"
                  style={{
                    borderColor: '#D8DBE2', paddingTop: 10, paddingBottom: 10,
                    fontSize: 13, color: '#2C3349',
                    fontFamily: "'Segoe UI', sans-serif",
                  }}
                  onFocus={e => e.target.style.borderColor = '#005FAD'}
                  onBlur={e => e.target.style.borderColor = '#D8DBE2'}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  className="flex items-center gap-1.5 mb-1.5"
                  style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}
                >
                  <Lock size={14} style={{ color: '#005FAD' }} />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border rounded-md px-3 focus:outline-none transition-all"
                  style={{
                    borderColor: '#D8DBE2', paddingTop: 10, paddingBottom: 10,
                    fontSize: 13, color: '#2C3349',
                    fontFamily: "'Segoe UI', sans-serif",
                  }}
                  onFocus={e => e.target.style.borderColor = '#005FAD'}
                  onBlur={e => e.target.style.borderColor = '#D8DBE2'}
                />
                <p style={{ marginTop: 6, fontSize: 11.5, color: '#005FAD' }}>{hintMap[role]}</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full text-white font-semibold rounded-md transition-colors mt-1"
                style={{
                  background: '#005FAD',
                  paddingTop: 11, paddingBottom: 11,
                  fontSize: 14, fontFamily: "'Segoe UI', sans-serif",
                  fontWeight: 600,
                }}
                onMouseEnter={e => e.target.style.background = '#003A70'}
                onMouseLeave={e => e.target.style.background = '#005FAD'}
              >
                Login to Portal
              </button>
            </form>
          </div>

          {/* Card footer */}
          <div
            className="border-t text-center px-8 py-4"
            style={{ background: '#F7F8FA', borderColor: '#EEF0F3' }}
          >
            <div style={{ fontSize: 11, color: '#9EA7B8' }}>Government of Andhra Pradesh</div>
            <div style={{ fontSize: 11, color: '#005FAD', fontWeight: 500, marginTop: 2 }}>
              Energy Department – APTRANSCO
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div
        className="relative z-10 mt-5 text-center"
        style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}
      >
        © 2025 Transmission Corporation of Andhra Pradesh Limited · IT Division · VBTS v14
      </div>
    </div>
  );
}
