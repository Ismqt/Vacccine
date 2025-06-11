import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Vaccines from './pages/Vaccines';
import Users from './pages/Users';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vaccines" element={<Vaccines />} />
          <Route path="/users" element={<Users />} />
          <Route path="/" element={<Navigate replace to="/welcome" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
