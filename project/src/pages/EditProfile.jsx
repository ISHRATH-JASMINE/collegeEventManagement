import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    rollNumber: user?.rollNumber || '',
    phone: user?.phone || '',
    year: user?.year || ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
      {success && <div className="mb-4 text-green-600">{success}</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Name" required />
        <input name="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Email" required />
        <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Phone" />
        <input name="department" value={formData.department} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Department" />
        <input name="rollNumber" value={formData.rollNumber} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Roll Number" />
        <input name="year" value={formData.year} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Year" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
      </form>
    </div>
  );
};

export default EditProfile;