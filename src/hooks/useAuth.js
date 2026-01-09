import { useState } from 'react';
import { ROLES } from '../constants';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  const login = (code) => {
    const map = {
      '123': ROLES.VIEWER,
      '456': ROLES.EDITOR,
      '789': ROLES.ADMIN
    };
    if (map[code]) {
      setIsLoggedIn(true);
      setRole(map[code]);
    }
  };

  return { isLoggedIn, role, login };
}