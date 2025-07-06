import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import loginImage from '../assets/loginImage.avif'; // Make sure this exists

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const { token, role } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'USER') navigate('/user/stores');
      else if (role === 'STORE') navigate('/store/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Section */}
      <div className="w-1/2 relative">
        <img
          src={loginImage}
          alt="Login Visual"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center px-10 text-white text-center">
          <h1 className="text-4xl font-extrabold mb-4">Welcome</h1>
          <p className="text-lg leading-relaxed">
            Unlock powerful insights into your ratings.<br />
            Visualize, analyze, and manage feedback<br />
            with ease and clarity.<br />
            Your journey starts here.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-1/2 bg-[#0e1726] flex items-center justify-center">
        <form
          onSubmit={handleLogin}
          className="w-[90%] max-w-md bg-gradient-to-br from-[#1f2937] to-[#111827] p-8 rounded-2xl shadow-2xl border border-gray-700"
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-3xl font-bold text-white">Rating App</h2>
          </div>

          <p className="text-center text-gray-400 mb-6">
            Store & User Rating Dashboard
          </p>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 p-2 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold p-2 rounded transition"
          >
            Sign In
          </button>
           <p
  onClick={() => navigate('/register')}
  className="text-gray-400 text-sm mt-4 text-center cursor-pointer hover:underline"
>
  Don’t have an account? Register here
</p>

          <p className="text-gray-500 text-xs mt-4 text-center">
            Demo: admin : admin@example.com / password123 <br />
                  store : masala@store.com / password123 <br />
                  user : kavya.nair@example.com / password123
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
