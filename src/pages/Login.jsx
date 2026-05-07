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

/* Soft blurred shape for background */
function BgShape({ top, left, right, bottom, width, height, color, rotate, blur = 90, borderRadius = 120 }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top, left, right, bottom,
        width, height,
        background: color,
        transform: `rotate(${rotate}deg)`,
        filter: `blur(${blur}px)`,
        borderRadius,
        opacity: 1,
      }}
    />
  );
}

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
      style={{ background: '#f0f4f8', fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >

      {/* ── Background shapes (MS-login style) ─────────────────── */}
      {/* Top-left blue diamond */}
      <BgShape top="-8%" left="-6%" width={520} height={420} color="rgba(96,165,250,0.28)" rotate={45} blur={85} borderRadius={110} />
      {/* Top-right purple blob */}
      <BgShape top="-5%" right="-4%" width={440} height={380} color="rgba(167,139,250,0.22)" rotate={-30} blur={100} borderRadius={130} />
      {/* Bottom-left teal */}
      <BgShape bottom="-10%" left="2%" width={480} height={360} color="rgba(94,234,212,0.2)" rotate={20} blur={90} borderRadius={100} />
      {/* Bottom-right pink */}
      <BgShape bottom="-6%" right="-3%" width={500} height={400} color="rgba(244,114,182,0.18)" rotate={-45} blur={95} borderRadius={120} />
      {/* Center-left lavender */}
      <BgShape top="35%" left="-8%" width={320} height={260} color="rgba(196,181,253,0.22)" rotate={15} blur={70} borderRadius={80} />
      {/* Center-right sky */}
      <BgShape top="30%" right="-6%" width={300} height={280} color="rgba(125,211,252,0.2)" rotate={-20} blur={75} borderRadius={90} />
      {/* Top-center warm orange accent */}
      <BgShape top="2%" left="38%" width={200} height={160} color="rgba(251,191,36,0.14)" rotate={30} blur={60} borderRadius={60} />
      {/* Bottom-center soft blue */}
      <BgShape bottom="4%" left="40%" width={240} height={180} color="rgba(99,102,241,0.15)" rotate={-15} blur={65} borderRadius={70} />

      {/* ── Org header ────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center gap-4 mb-7">
        <div
          className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 p-1.5"
          style={{ boxShadow: '0 4px 16px rgba(0,95,173,0.14)' }}
        >
          <img src={aptranscoLogo} alt="APTRANSCO Logo" className="w-full h-full object-contain" />
        </div>
        <div className="text-left">
          <div
            className="leading-snug tracking-wide"
            style={{ fontWeight: 700, fontSize: 16, color: '#001F3F' }}
          >
            TRANSMISSION CORPORATION OF<br />ANDHRA PRADESH LIMITED
          </div>
          <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 3 }}>
            Government of Andhra Pradesh Undertaking
          </div>
        </div>
      </div>

      {/* ── Login card ────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm">
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 8px 40px rgba(0,31,63,0.12), 0 1px 4px rgba(0,0,0,0.06)' }}
        >
          {/* Card body */}
          <div className="px-8 pt-8 pb-6">

            <h2
              className="text-center mb-0.5"
              style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}
            >
              VBTS Portal
            </h2>
            <p className="text-center mb-6" style={{ fontSize: 13, color: '#005FAD', fontWeight: 500 }}>
              Vendor Bill Tracking System
            </p>

            <form onSubmit={handleLogin} className="space-y-4">

              {/* Role */}
              <div>
                <label className="flex items-center gap-1.5 mb-1.5" style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  <User size={13} style={{ color: '#005FAD' }} />
                  Login As
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full appearance-none rounded-lg px-3 pr-8 bg-white focus:outline-none transition-all"
                    style={{
                      border: '1px solid #D1D5DB',
                      paddingTop: 10, paddingBottom: 10,
                      fontSize: 13, color: '#1f2937',
                    }}
                    onFocus={e  => { e.target.style.borderColor = '#005FAD'; e.target.style.boxShadow = '0 0 0 3px rgba(0,95,173,0.12)'; }}
                    onBlur={e   => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                  >
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9CA3AF' }} />
                </div>
              </div>

              {/* ID */}
              <div>
                <label className="flex items-center gap-1.5 mb-1.5" style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  <User size={13} style={{ color: '#005FAD' }} />
                  {role === 'employee' ? 'Employee ID' : role === 'management' ? 'Username' : 'Vendor Code'}
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  placeholder={placeholderMap[role]}
                  className="w-full rounded-lg px-3 focus:outline-none transition-all"
                  style={{
                    border: '1px solid #D1D5DB',
                    paddingTop: 10, paddingBottom: 10,
                    fontSize: 13, color: '#1f2937', background: '#fff',
                  }}
                  onFocus={e  => { e.target.style.borderColor = '#005FAD'; e.target.style.boxShadow = '0 0 0 3px rgba(0,95,173,0.12)'; }}
                  onBlur={e   => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center gap-1.5 mb-1.5" style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  <Lock size={13} style={{ color: '#005FAD' }} />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg px-3 focus:outline-none transition-all"
                  style={{
                    border: '1px solid #D1D5DB',
                    paddingTop: 10, paddingBottom: 10,
                    fontSize: 13, color: '#1f2937', background: '#fff',
                  }}
                  onFocus={e  => { e.target.style.borderColor = '#005FAD'; e.target.style.boxShadow = '0 0 0 3px rgba(0,95,173,0.12)'; }}
                  onBlur={e   => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                />
                <p style={{ marginTop: 6, fontSize: 11.5, color: '#6B7280' }}>{hintMap[role]}</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full text-white font-semibold rounded-lg mt-1 transition-all"
                style={{
                  background: '#005FAD',
                  paddingTop: 11, paddingBottom: 11,
                  fontSize: 14, fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(0,95,173,0.3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#003A70'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,95,173,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#005FAD'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,95,173,0.3)'; }}
              >
                Sign In
              </button>
            </form>
          </div>

          {/* Card footer */}
          <div className="border-t text-center px-8 py-3.5" style={{ background: '#F9FAFB', borderColor: '#F0F1F3' }}>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>Government of Andhra Pradesh</div>
            <div style={{ fontSize: 11, color: '#005FAD', fontWeight: 500, marginTop: 2 }}>
              Energy Department – APTRANSCO
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="relative z-10 mt-5 text-center" style={{ fontSize: 11, color: '#9CA3AF' }}>
        © 2025 Transmission Corporation of Andhra Pradesh Limited · IT Division · VBTS v14
      </div>
    </div>
  );
}
