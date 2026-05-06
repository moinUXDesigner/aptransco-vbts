import { useState } from 'react';
import { AppContext } from './context/AppContext';
import Login from './pages/Login';
import ManagementApp from './pages/management/ManagementApp';
import VendorApp from './pages/vendor/VendorApp';
import EmployeeApp from './pages/employee/EmployeeApp';
import Toast from './components/ui/Toast';

export default function App() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [submittedBills, setSubmittedBills] = useState([]);

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
