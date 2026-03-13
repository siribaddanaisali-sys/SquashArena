import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Players from './pages/Players';
import PlayerDetail from './pages/PlayerDetail';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import Rankings from './pages/Rankings';
import HeadToHead from './pages/HeadToHead';
import Dashboard from './pages/Dashboard';
import DeveloperResourcesDashboard from './pages/developer-resources/DeveloperResourcesDashboard';
import SRSPage from './pages/developer-resources/SRSPage';
import ArchitecturePage from './pages/developer-resources/ArchitecturePage';
import TechStackPage from './pages/developer-resources/TechStackPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/players" element={<Layout><Players /></Layout>} />
          <Route path="/players/:id" element={<Layout><PlayerDetail /></Layout>} />
          <Route path="/tournaments" element={<Layout><Tournaments /></Layout>} />
          <Route path="/tournaments/:id" element={<Layout><TournamentDetail /></Layout>} />
          <Route path="/rankings" element={<Layout><Rankings /></Layout>} />
          <Route path="/head-to-head" element={<Layout><HeadToHead /></Layout>} />
          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          
          {/* Developer Resources Routes (Admin Only) */}
          <Route path="/developer-resources" element={<AdminRoute><DeveloperResourcesDashboard /></AdminRoute>} />
          <Route path="/developer-resources/srs" element={<AdminRoute><SRSPage /></AdminRoute>} />
          <Route path="/developer-resources/architecture" element={<AdminRoute><ArchitecturePage /></AdminRoute>} />
          <Route path="/developer-resources/tech-stack" element={<AdminRoute><TechStackPage /></AdminRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
