import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Api from '../../Service/api';

export default function Reset_password() {
  const [form, setForm] = useState({
    email: '',
    submitted_otp: '',
    new_password: '',
    confirm_password: ''
  });
  const [response, setResponse] = useState({ success: false, message: '' });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.new_password !== form.confirm_password) {
      setResponse({ success: false, message: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setResponse({ success: false, message: '' });

    try {
      const res = await Api.post('/api/reset-password', {
        email: form.email,
        submitted_otp: form.submitted_otp,
        new_password: form.new_password
      });

      setResponse({ success: res.data.success, message: res.data.message });
    } catch (error) {
      setResponse({
        success: false,
        message: error?.response?.data?.message || 'Unable to reset password.'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='w-full min-h-screen flex items-center justify-center bg-[url("/Login_signup_background/Neon_background.jpg")] bg-cover bg-no-repeat p-6'>
      <div className='w-full max-w-md rounded-2xl bg-white/90 shadow-2xl p-8'>
        <div className='flex items-center justify-center mb-6'>
          <div className='w-14 h-14 bg-[url("/CD_logo.png")] bg-contain bg-no-repeat'></div>
        </div>

        <h1 className='text-3xl font-black text-center mb-2'>Reset password</h1>
        <p className='text-center text-gray-600 mb-6'>Use the OTP received by email to create a new password.</p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-lg font-bold mb-2'>Email</label>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              placeholder='Enter your email'
              className='w-full h-12 rounded-lg bg-gray-200 px-4 outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>

          <div>
            <label className='block text-lg font-bold mb-2'>OTP</label>
            <input
              type='text'
              name='submitted_otp'
              value={form.submitted_otp}
              onChange={handleChange}
              placeholder='Enter 6-digit OTP'
              className='w-full h-12 rounded-lg bg-gray-200 px-4 outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>

          <div>
            <label className='block text-lg font-bold mb-2'>New password</label>
            <input
              type='password'
              name='new_password'
              value={form.new_password}
              onChange={handleChange}
              placeholder='Enter new password'
              className='w-full h-12 rounded-lg bg-gray-200 px-4 outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>

          <div>
            <label className='block text-lg font-bold mb-2'>Confirm password</label>
            <input
              type='password'
              name='confirm_password'
              value={form.confirm_password}
              onChange={handleChange}
              placeholder='Confirm new password'
              className='w-full h-12 rounded-lg bg-gray-200 px-4 outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>

          {response.message && (
            <div className={response.success ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
              {response.message}
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full h-12 rounded-lg bg-gray-800 text-white font-bold hover:bg-gray-700 disabled:opacity-60'
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <Link to='/login' className='font-black text-gray-800'>Back to login</Link>
        </div>
      </div>
    </div>
  );
}
