import Login from '../../pages/Login';
import Dashboard from '../../pages/Dashboard';
import { useAuth } from '../../hooks/useAuth';

export default function AppLayout() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Dashboard /> : <Login />;
}