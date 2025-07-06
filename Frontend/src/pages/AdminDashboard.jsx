import React, { useState, useEffect } from 'react';
import { Users, Store, Star, Settings, LogOut, Search, Plus, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeStores: 0, submittedRatings: 0 });

  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [storeFilter, setStoreFilter] = useState('');
  
  
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchData = async () => {
      try {
        const [statsRes, usersRes, storesRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/api/admin/stores', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const statsData = await statsRes.json();
        const usersData = await usersRes.json();
        const storesData = await storesRes.json();

        setStats({
          totalUsers: statsData.total_users,
          activeStores: statsData.total_stores,
          submittedRatings: statsData.total_ratings
        });

        setUsers(usersData.map(user => ({
          ...user,
          rating: user.avg_rating || null
        })));

        setStores(storesData.map(store => ({
          ...store,
          rating: store.average_rating || null
        })));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userFilters.name.toLowerCase()) &&
    user.email.toLowerCase().includes(userFilters.email.toLowerCase()) &&
    user.address.toLowerCase().includes(userFilters.address.toLowerCase()) &&
    (userFilters.role === '' || user.role === userFilters.role)
  );

  
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  
  useEffect(() => {
    setCurrentPage(1);
  }, [userFilters]);

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(storeFilter.toLowerCase()) ||
    store.email.toLowerCase().includes(storeFilter.toLowerCase()) ||
    store.address.toLowerCase().includes(storeFilter.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const StatCard = ({ icon: Icon, number, label }) => (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-green-400">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{number.toLocaleString()}</p>
          <p className="text-sm font-medium text-gray-300">{label}</p>
        </div>
        <Icon className="w-8 h-8 text-green-400" />
      </div>
    </div>
  );

  const RoleBadge = ({ role }) => {
    const colors = {
      admin: 'bg-red-900 text-red-300 border border-red-700',
      store: 'bg-green-900 text-green-300 border border-green-700',
      user: 'bg-blue-900 text-blue-300 border border-blue-700'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[role] || colors.user}`}>
        {role.toUpperCase()}
      </span>
    );
  };

  const RatingBadge = ({ rating }) => (
    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-900 text-yellow-300 border border-yellow-700">
      {rating}★
    </span>
  );

  const Pagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-400">
          Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-2 rounded bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-1 rounded text-sm ${
                number === currentPage
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-green-400" />
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-white bg-green-600 px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={Users} number={stats.totalUsers} label="Total Users" />
          <StatCard icon={Store} number={stats.activeStores} label="Active Stores" />
          <StatCard icon={Star} number={stats.submittedRatings} label="Submitted Ratings" />
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-white text-lg font-semibold mb-4">Filter Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={userFilters.name}
              onChange={e => setUserFilters({ ...userFilters, name: e.target.value })}
              className="bg-gray-700 text-white px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="Email"
              value={userFilters.email}
              onChange={e => setUserFilters({ ...userFilters, email: e.target.value })}
              className="bg-gray-700 text-white px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="Address"
              value={userFilters.address}
              onChange={e => setUserFilters({ ...userFilters, address: e.target.value })}
              className="bg-gray-700 text-white px-3 py-2 rounded"
            />
            <select
              value={userFilters.role}
              onChange={e => setUserFilters({ ...userFilters, role: e.target.value })}
              className="bg-gray-700 text-white px-3 py-2 rounded"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="store">Store</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {/* Users Table with Pagination */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 overflow-x-auto">
          <h2 className="text-white text-lg font-semibold mb-4">Users</h2>
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Address</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Rating</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <tr key={user.id} className="text-white border-t border-gray-700">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.address}</td>
                  <td className="px-4 py-2"><RoleBadge role={user.role} /></td>
                  <td className="px-4 py-2">{user.rating ? <RatingBadge rating={user.rating} /> : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && <Pagination />}
        </div>

        {/* Stores Table */}
        <div className="bg-gray-800 rounded-lg p-6 overflow-x-auto">
          <h2 className="text-white text-lg font-semibold mb-4">Stores</h2>
          <input
            type="text"
            placeholder="Search stores..."
            value={storeFilter}
            onChange={e => setStoreFilter(e.target.value)}
            className="mb-4 bg-gray-700 text-white px-3 py-2 rounded w-full max-w-md"
          />
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400">
              <tr>
                <th className="px-4 py-2">Store Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Address</th>
                <th className="px-4 py-2">Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map(store => (
                <tr key={store.id} className="text-white border-t border-gray-700">
                  <td className="px-4 py-2">{store.name}</td>
                  <td className="px-4 py-2">{store.email}</td>
                  <td className="px-4 py-2">{store.address}</td>
                  <td className="px-4 py-2"><RatingBadge rating={store.rating} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;