import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserStores() {
  const [stores, setStores] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [selectedRatings, setSelectedRatings] = useState({});
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStores();
    fetchUserRatings();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserRatings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/ratings/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ratingsMap = {};
      res.data.forEach((r) => {
        ratingsMap[r.store_id] = r.user_rating;
      });
      setUserRatings(ratingsMap);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRating = async (store_id, rating) => {
    try {
      await axios.post(
        'http://localhost:5000/api/ratings',
        { store_id, rating },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage('✅ Rating submitted!');
      setUserRatings((prev) => ({ ...prev, [store_id]: rating }));
      setSelectedRatings((prev) => ({ ...prev, [store_id]: undefined }));
      fetchStores();
      fetchUserRatings();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to submit rating.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const filteredStores = stores.filter((store) => {
    const match = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  store.address.toLowerCase().includes(searchQuery.toLowerCase());

    switch (currentFilter) {
      case 'high-rated': return match && store.average_rating >= 4.5;
      case 'my-ratings': return match && userRatings[store.id];
      default: return match;
    }
  });

  const setRating = (storeId, rating) => {
    setSelectedRatings((prev) => ({ ...prev, [storeId]: rating }));
  };

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden" style={{
      fontFamily: "'Courier New', monospace",
      background: '#0f172a'
    }}>
      <header className="bg-[#1e293b] border-b-4 border-[#22c55e] p-5 text-center">
        <h1 className="text-3xl font-semibold text-[#22c55e] tracking-wide">
          USER PORTAL
        </h1>
      </header>

      <div className="max-w-7xl mx-auto p-5">
        <div className="bg-[#1e293b] border border-[#22c55e] rounded-lg p-6 mb-8 text-center">
          <h2 className="text-xl text-[#22c55e] mb-1">Welcome to the Portal</h2>
          <p className="text-sm text-gray-300">
            Access the network of trusted stores and submit your ratings.
          </p>
        </div>

        <div className="bg-[#1e293b] border border-[#22c55e] rounded-lg p-6 mb-8">
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stores by name or address..."
              className="w-full p-3 rounded-md bg-[#0f172a] border border-[#334155] text-white focus:outline-none focus:ring focus:ring-green-400"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all', label: 'All Stores' },
              { key: 'high-rated', label: 'High Rated' },
              { key: 'my-ratings', label: 'My Ratings' },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setCurrentFilter(filter.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  currentFilter === filter.key
                    ? 'bg-[#22c55e] text-white'
                    : 'bg-[#0f172a] border border-[#475569] text-[#cbd5e1]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className="text-center mb-6 p-4 rounded-lg font-medium" style={{
            color: message.includes('FAILED') ? '#ef4444' : '#22c55e',
            background: '#1e293b',
            border: `1px solid ${message.includes('FAILED') ? '#ef4444' : '#22c55e'}`
          }}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="bg-[#1e293b] border border-[#334155] rounded-lg p-5 transition hover:border-[#22c55e]"
            >
              <h3 className="text-lg font-bold text-[#22c55e] mb-2">{store.name}</h3>
              <p className="text-gray-400 text-sm mb-1">📍 {store.address}</p>
              <p className="text-sm mb-2">Overall Rating: {store.average_rating} ★</p>
              <p className="text-sm mb-3">
                My Rating: {userRatings[store.id] || 'Not Rated'}
                {selectedRatings[store.id] && selectedRatings[store.id] !== userRatings[store.id] && (
                  <span className="ml-2 text-yellow-400">
                    → {selectedRatings[store.id]} ★
                  </span>
                )}
              </p>

              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((rating) => {
                  const currentRating = selectedRatings[store.id] || userRatings[store.id] || 0;
                  const isActive = currentRating >= rating;
                  return (
                    <span
                      key={rating}
                      onClick={() => setRating(store.id, rating)}
                      className="cursor-pointer text-2xl"
                      style={{ color: isActive ? '#22c55e' : '#64748b' }}
                    >
                      ★
                    </span>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  const ratingToSubmit = selectedRatings[store.id] || userRatings[store.id] || 5;
                  handleRating(store.id, ratingToSubmit);
                }}
                disabled={!selectedRatings[store.id] && !userRatings[store.id]}
                className="w-full py-2 rounded-md text-white font-semibold bg-[#22c55e] hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedRatings[store.id]
                  ? `Submit Rating (${selectedRatings[store.id]}★)`
                  : userRatings[store.id]
                  ? 'Update Rating'
                  : 'Select Rating First'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserStores;
