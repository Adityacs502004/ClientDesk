import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Api from '../../Service/api';

export default function Forgot_password() {
  const [email, setEmail] = useState('');
  const [response, setResponse] = useState({ success: false, message: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResponse({ success: false, message: '' });

    try {
      const res = await Api.post('/api/forgot-password', { email });
      setResponse({ success: res.data.success, message: res.data.message });
    } catch (error) {
      setResponse({
        success: false,
        message: error?.response?.data?.message || 'Unable to send reset OTP.'
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

        <h1 className='text-3xl font-black text-center mb-2'>Forgot password</h1>
        <p className='text-center text-gray-600 mb-6'>Enter your email to receive a reset OTP.</p>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <label className='block text-lg font-bold mb-2'>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email'
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
            {loading ? 'Sending...' : 'Send reset OTP'}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <Link to='/login' className='font-black text-gray-800'>Back to login</Link>
        </div>
      </div>
    </div>
  );
}
