import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setMessage('Password has been reset. You may now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div className="panel panel-default" style={{ maxWidth: 400, margin: '40px auto', padding: 24 }}><div className="text-danger">Invalid or missing token.</div></div>;
  }

  return (
    <div className="panel panel-default" style={{ maxWidth: 400, margin: '40px auto' }}>
      <div className="panel-heading">
        <h1 className="panel-title">Reset Password</h1>
      </div>
      <div className="panel-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          {message && <div className="text-success" style={{ marginBottom: 10 }}>{message}</div>}
          {error && <div className="text-danger" style={{ marginBottom: 10 }}>{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
} 