import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StoreDashboard() {
  const [ratings, setRatings] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ratingRes = await axios.get('http://localhost:5000/api/ratings/owner', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRatings(ratingRes.data);

        if (ratingRes.data.length > 0) {
          const storeName = ratingRes.data[0].store_name;
          const storeRes = await axios.get('http://localhost:5000/api/stores', {
            headers: { Authorization: `Bearer ${token}` },
          });

          const store = storeRes.data.find((s) => s.name === storeName);
          if (store) setStoreInfo(store);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching store dashboard:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/update-password',
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPasswordMessage(res.data.message || 'Password updated successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMessage(
        err.response?.data?.message || 'Failed to update password'
      );
    }
  };

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

  const averageRating = parseFloat(storeInfo?.average_rating) || 0;
  const totalRatings = ratings.length;
  const uniqueCustomers = new Set(ratings.map(r => r.rated_by)).size;

  return (
    <div className="min-h-screen bg-[#0e1726] text-white py-10 px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Store Info */}
        {storeInfo && (
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-green-400">{storeInfo.name}</h1>
            <p className="text-gray-400">📍 {storeInfo.address}</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Update Password Form */}
        {showPasswordForm && (
          <div className="bg-[#1f2a40] border border-green-500 rounded-xl p-6 max-w-md mx-auto space-y-4">
            <h2 className="text-xl font-bold text-green-400">Update Password</h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
              >
                Update Password
              </button>
              {passwordMessage && (
                <p className="text-sm text-green-400 text-center">{passwordMessage}</p>
              )}
            </form>
          </div>
        )}

        {/* Top Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-green-500 rounded-xl p-6 text-center bg-[#1f2a40]">
            <p className="text-4xl text-green-500 font-extrabold">{averageRating.toFixed(1)}</p>
            <p className="text-green-400 mt-2 font-semibold text-lg">Average Rating</p>
            <p className="text-gray-400 text-sm mt-1">Based on {totalRatings} reviews</p>
          </div>
          <div className="border border-green-500 rounded-xl p-6 text-center bg-[#1f2a40]">
            <p className="text-4xl text-green-500 font-extrabold">{uniqueCustomers}</p>
            <p className="text-green-400 mt-2 font-semibold text-lg">Total Customers</p>
            <p className="text-gray-400 text-sm mt-1">Who rated your store</p>
          </div>
          <div className="border border-green-500 rounded-xl p-6 text-center bg-[#1f2a40]">
            <p className="text-4xl text-green-500 font-extrabold">{totalRatings}</p>
            <p className="text-green-400 mt-2 font-semibold text-lg">Total Ratings</p>
            <p className="text-gray-400 text-sm mt-1">Including updates</p>
          </div>
        </div>

        {/* Ratings List */}
        <div className="bg-[#1f2a40] border border-green-500 rounded-xl p-6">
          <h2 className="text-xl font-bold text-green-400 mb-4">Customer Ratings</h2>
          {ratings.length === 0 ? (
            <p className="text-gray-400">No ratings received yet.</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left table-auto">
                <thead className="text-green-400 border-b border-green-500">
                  <tr>
                    <th className="p-2">Customer</th>
                    <th className="p-2">Contact</th>
                    <th className="p-2">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.map((rating) => (
                    <tr key={rating.id} className="text-gray-200 border-t border-gray-700">
                      <td className="p-2">{rating.rated_by}</td>
                      <td className="p-2">{rating.user_email || 'N/A'}</td>
                      <td className="p-2 text-yellow-400">⭐ {rating.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StoreDashboard;
