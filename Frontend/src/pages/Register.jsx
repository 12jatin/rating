import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import loginImage from '../assets/loginImage.avif';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'USER',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      setSuccess('Registration successful. Please login.');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
     
      <div className="w-1/2 relative">
        <img
          src={loginImage}
          alt="Register Visual"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center px-10 text-white text-center">
          <h1 className="text-4xl font-extrabold mb-4">Join Us</h1>
          <p className="text-lg leading-relaxed">
            Create your account to rate and review<br />
            the best stores around you!
          </p>
        </div>
      </div>

      <div className="w-1/2 bg-[#0e1726] flex items-center justify-center">
        <form
          onSubmit={handleRegister}
          className="w-[90%] max-w-md bg-gradient-to-br from-[#1f2937] to-[#111827] p-8 rounded-2xl shadow-2xl border border-gray-700"
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-3xl font-bold text-white">Register</h2>
          </div>

          <p className="text-center text-gray-400 mb-6">
            Create your account
          </p>

          {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-400 text-sm mb-2">{success}</p>}

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 p-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 p-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <textarea
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            maxLength="400"
            className="w-full bg-gray-800 text-white border border-gray-600 p-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

        
          <input type="hidden" name="role" value={form.role} />

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold p-2 rounded transition"
          >
            Register
          </button>

          <p className="text-gray-500 text-xs mt-4 text-center">
            Already have an account?{' '}
            <Link to="/" className="text-green-400 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
