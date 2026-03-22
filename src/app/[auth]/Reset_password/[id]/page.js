"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {EXPRESS_PRIVATE_URL,Encrypt} from "../../../../../Functions/Functions"
import {plsWait,ErrorMessage,SuccessToast} from "../../../../../Functions/Mics"
import Footer1 from '@/app/Components/Footer1';
import Nav1 from '@/app/Components/Nav1';

const PasswordReset = ({params}) => {
  const UserId =  params.id;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
        setError('❌ Passwords do not match.');
        return;
    } else {
        setError('');
    }
    
    try {
        plsWait("please wait...")
      const endpoint = `${EXPRESS_PRIVATE_URL}/api/Reset-password/${Encrypt(UserId)}/Security`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: Encrypt(newPassword) }),
      });

      const result = await response.json();

      if (result.message) {
        SuccessToast(result.message);
        setNewPassword('');
        setConfirmPassword('');
        router.push('/Login');
      } else {
        throw new Error(result.error || 'Unknown error occurred.');
      }
    } catch (err) {
      ErrorMessage(err.message);
    }
  };

  return (
    <>
    <Nav1/>
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-fixed"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-center text-2xl font-semibold text-gray-800 mb-4">
          🔐 Reset Your Password
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
    <Footer1 />
    </>
  );
};

export default PasswordReset;
