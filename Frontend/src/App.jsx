import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/Register';
import UserStores from './pages/UserStores';
import ProtectedRoute from './components/ProtectedRoute';
import StoreDashboard from './pages/StoreDashboard';
import AdminDashboard from './pages/AdminDashboard';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
         <Route path="/register" element={<Register />} />
             <Route path="/user/stores" element={<UserStores />} />
             <Route path="/admin/dashboard" element={<AdminDashboard/>} />
             <Route path="/store/dashboard" element={<StoreDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
