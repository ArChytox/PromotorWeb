// src/components/PromoterDetail.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import '../components/styles.css';

function PromoterDetail() {
    const { promoterEmail } = useParams();
    const [promoterVisits, setPromoterVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [promoterName, setPromoterName] = useState('');
    const [expandedVisitId, setExpandedVisitId] = useState(null);

    useEffect(() => {
        const fetchPromoterDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data: fetchedData, error } = await supabase
                    .rpc('get_full_visit_details');

                if (error) {
                    throw error;
                }

                const filteredVisits = fetchedData.filter(
                    (visit) => visit.email_promotor === decodeURIComponent(promoterEmail)
                );

                if (filteredVisits.length > 0) {
                    setPromoterName(filteredVisits[0].nombre_promotor || decodeURIComponent(promoterEmail));
                } else {
                    setPromoterName(decodeURIComponent(promoterEmail));
                }

                setPromoterVisits(filteredVisits);

            } catch (err) {
                console.error('Error al obtener detalles del promotor:', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (promoterEmail) {
            fetchPromoterDetails();
        }
    }, [promoterEmail]);

    const handleToggleExpand = (visitId) => {
        setExpandedVisitId(expandedVisitId === visitId ? null : visitId);
    };

    if (loading) {
        return <div className="loading-message">Cargando detalles de Vistas promotor...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}. No se pudieron cargar las visitas de este promotor.</div>;
    }

    return (
        <div className="container">
            <h1 className="main-title">Visitas de {promoterName}</h1>
            <Link to="/" className="button secondary back-button">← Volver a Visitas de Promotores</Link>

            {promoterVisits.length > 0 ? (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Comercio</th>
                                <th>Fecha/Hora</th>
                                <th>Ubicación</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promoterVisits.map((visit) => (
                                <React.Fragment key={visit.id_visita}>
                                    <tr className={expandedVisitId === visit.id_visita ? 'expanded-row' : ''}>
                                        <td>{visit.nombre_comercio_visitado || 'N/A'}</td>
                                        <td>{new Date(visit.fecha_hora_visita).toLocaleString() || 'N/A'}</td>
                                        <td>{`${visit.lugar_visita_ciudad || 'N/A'}, ${visit.Estado || 'N/A'}`}</td>
                                        <td>
                                            <button
                                                onClick={() => handleToggleExpand(visit.id_visita)}
                                                className="button primary small-button toggle-button"
                                            >
                                                {expandedVisitId === visit.id_visita ? 'Ocultar Detalles' : 'Ver Detalles'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedVisitId === visit.id_visita && (
                                        <tr className="detail-row">
                                            <td colSpan="4">
                                                <div className="detail-content">
                                                    <p><strong>Observaciones:</strong> {visit.observaciones_visita || 'Sin observaciones'}</p>
                                                    <p><strong>Dirección Comercio:</strong> {visit.direccion_comercio || 'N/A'}</p>
                                                    
                                                    {/* ¡CAMBIO AQUÍ! Enlace a Google Maps */}
                                                    <p>
                                                        <strong>Coordenadas:</strong>
                                                        {visit.coordenada_latitud && visit.coordenada_longitud ? (
                                                            <a
                                                                href={`https://www.google.com/maps/search/?api=1&query=${visit.coordenada_latitud},${visit.coordenada_longitud}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="map-link"
                                                            >
                                                                {`${visit.coordenada_latitud}, ${visit.coordenada_longitud}`}
                                                            </a>
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </p>
                                                    {/* FIN DEL CAMBIO */}

                                                    {/* Sección de Fotos */}
                                                    {(visit.foto_url_antes || visit.foto_url_despues) && (
                                                        <div className="detail-section-card">
                                                            <h4>Fotos de la Visita</h4>
                                                            <div className="photo-gallery-large">
                                                                {visit.foto_url_antes && (
                                                                    <div className="photo-item">
                                                                        <p>Antes:</p>
                                                                        <a href={visit.foto_url_antes} target="_blank" rel="noopener noreferrer">
                                                                            <img src={visit.foto_url_antes} alt="Foto antes de la visita" className="thumbnail-detail" />
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                {visit.foto_url_despues && (
                                                                    <div className="photo-item">
                                                                        <p>Después:</p>
                                                                        <a href={visit.foto_url_despues} target="_blank" rel="noopener noreferrer">
                                                                            <img src={visit.foto_url_despues} alt="Foto después de la visita" className="thumbnail-detail" />
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Sección de Productos Chispa en tabla */}
                                                    {visit.productos_chispa && visit.productos_chispa.length > 0 && (
                                                        <div className="detail-section-card">
                                                            <h4>Productos Chispa</h4>
                                                            <div className="table-responsive">
                                                                <table className="data-table small-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Producto</th>
                                                                            <th>Precio</th>
                                                                            <th>Moneda</th>
                                                                            <th>Stock Anaquel</th>
                                                                            <th>Stock General</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {visit.productos_chispa.map((prod, pIdx) => (
                                                                            <tr key={pIdx}>
                                                                                <td>{prod.product_name || 'N/A'}</td>
                                                                                <td>${prod.price || '0'}</td>
                                                                                <td>{prod.currency || 'N/A'}</td>
                                                                                <td>{String(prod.shelf_stock || '0')}</td>
                                                                                <td>{String(prod.general_stock || '0')}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Sección de Productos de Competencia en tabla */}
                                                    {visit.productos_competencia && visit.productos_competencia.length > 0 && (
                                                        <div className="detail-section-card">
                                                            <h4>Productos de Competencia</h4>
                                                            <div className="table-responsive">
                                                                <table className="data-table small-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Producto</th>
                                                                            <th>Precio</th>
                                                                            <th>Moneda</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {visit.productos_competencia.map((compProd, cpIdx) => (
                                                                            <tr key={cpIdx}>
                                                                                <td>{compProd.product_name || 'N/A'}</td>
                                                                                <td>${compProd.price || '0'}</td>
                                                                                <td>{compProd.currency || 'N/A'}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="no-data-message">No se encontraron visitas para este promotor.</p>
            )}
        </div>
    );
}

export default PromoterDetail;