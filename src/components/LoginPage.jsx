import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom'; // Asegúrate de que esto esté importado

import './styles.css'; // Tus estilos

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Aquí declaras 'navigate'

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }

      alert('Inicio de sesión exitoso!');
      // ¡Aquí usamos 'navigate' para redirigir inmediatamente!
      // Podemos redirigir directamente al panel de admin o a la ruta principal,
      // que App.jsx luego resolverá si es admin o no.
      navigate('/admin'); // Redirige al panel de administración tras el login exitoso

    } catch (error) {
      alert(`Error al iniciar sesión: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container container">
      <h1 className="main-title">Iniciar Sesión</h1>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        <button type="submit" className="button primary" disabled={loading}>
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;