// src/components/PromotersList.jsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Link } from 'react-router-dom';
import '../components/styles.css'; // Importa los estilos

function PromotersList() {
  const [promoters, setPromoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPromoters = async () => {
      try {
        const { data: fetchedData, error } = await supabase
          .rpc('get_full_visit_details');

        if (error) {
          throw error;
        }

        const uniquePromoters = new Map();
        fetchedData.forEach(visit => {
          if (visit.email_promotor) {
            if (!uniquePromoters.has(visit.email_promotor)) {
              uniquePromoters.set(visit.email_promotor, {
                email: visit.email_promotor,
                name: visit.nombre_promotor || 'Promotor Desconocido'
              });
            }
          }
        });
        
        setPromoters(Array.from(uniquePromoters.values()));

      } catch (err) {
        console.error('Error al obtener promotores:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoters();
  }, []);

  if (loading) {
    return <div className="loading-message">Cargando promotores...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}. No se pudieron cargar los promotores.</div>;
  }

  return (
    <div className="container">
      <h1 className="main-title">Listado de Visitas por Promotor</h1>
      {promoters.length > 0 ? (
        <div className="promoter-list">
          {promoters.map((promoter) => (
            <div key={promoter.email} className="promoter-card">
              <h3>{promoter.name}</h3>
              <p>Email: {promoter.email}</p>
              <Link to={`/promotor/${encodeURIComponent(promoter.email)}`} className="button primary">
                Ver Detalles
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data-message">No se encontraron promotores con visitas.</p>
      )}
    </div>
  );
}

export default PromotersList;