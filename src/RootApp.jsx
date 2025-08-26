import React, { useEffect, useState } from 'react';
import App from './App';
import Login from './components/auth/Login';
import MemberDashboard from './components/members/MemberDashboard';

function RootApp() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('tm_current_user');
      if (raw) {
        setCurrentUser(JSON.parse(raw));
      }
    } catch (_) {}
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  if (String(currentUser.userType).toLowerCase() === 'admin') {
    return <App onLogout={handleLogout} />;
  }

  return <MemberDashboard onLogout={handleLogout} />;
}

export default RootApp;


