import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Players from './pages/Players';
import Tournaments from './pages/Tournaments';
import Rankings from './pages/Rankings';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/players" element={<Layout><Players /></Layout>} />
          <Route path="/tournaments" element={<Layout><Tournaments /></Layout>} />
          <Route path="/rankings" element={<Layout><Rankings /></Layout>} />
          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
