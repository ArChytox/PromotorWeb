// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PromotersList from './components/PromotersList';
import PromoterDetail from './components/PromoterDetail';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';

import ManageCommercesContainer from './components/ManageCommercesContainer'; 
import ManageRoutes from './components/ManageRoutes';
import ManageUsersContainer from './components/ManageUsersContainer';
import ManageChispaProducts from './components/ManageChispaProducts';

// ¡NUEVA IMPORTACIÓN!
import ManageCompetitorProducts from './components/ManageCompetitorProducts'; // Asegúrate de la ruta

import './components/styles.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
          <Link to="/" style={{ marginRight: '15px' }}>Listado de Visitas</Link>
          <Link to="/admin" style={{ marginRight: '15px' }}>Panel Admin</Link>
          <Link to="/login">Login</Link>
        </nav>

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/promotor/:promoterEmail" element={<PromoterDetail />} />
          <Route path="/" element={<PromotersList />} />

          <Route path="/admin" element={<AdminPage />}>
            <Route
              index
              element={
                <div className="welcome-admin-message">
                  <h2>Bienvenido al Panel de Administración</h2>
                  <p>Selecciona una opción del menú de la izquierda para empezar a gestionar.</p>
                </div>
              }
            />
            <Route path="comercios/*" element={<ManageCommercesContainer />} /> 
            <Route path="users/*" element={<ManageUsersContainer />} />
            <Route path="rutas" element={<ManageRoutes />} />
            <Route path="nuestros-productos" element={<ManageChispaProducts />} /> 
            
            {/* ¡NUEVA RUTA PARA PRODUCTOS DE COMPETENCIA! */}
            <Route path="competencia-productos" element={<ManageCompetitorProducts />} />

            <Route path="asignaciones" element={<div>Contenido para Asignar Rutas (Próximamente)</div>} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;