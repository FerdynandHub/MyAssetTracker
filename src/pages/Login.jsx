import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

export default function Login() {
  const [code, setCode] = useState('');
  const { login } = useAuth();

  return (
    <div className="h-screen flex items-center justify-center">
      <div>
        <input
          className="border p-2 mr-2"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Access code"
        />
        <Button onClick={() => login(code)}>Login</Button>
      </div>
    </div>
  );
}