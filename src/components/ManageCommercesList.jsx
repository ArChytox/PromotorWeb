// src/components/ManageCommercesList.jsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function ManageCommercesList() {
    const [commerces, setCommerces] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchCommercesAndRoutes();
    }, []);

    const fetchCommercesAndRoutes = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: commercesData, error: commercesError } = await supabase
                .from('commerces')
                .select('*')
                .order('name', { ascending: true });

            if (commercesError) throw commercesError;

            const { data: routesData, error: routesError } = await supabase
                .from('routes')
                .select('id, name')
                .order('name', { ascending: true });

            if (routesError) throw routesError;

            setCommerces(commercesData);
            setRoutes(routesData);
        } catch (err) {
            console.error('Error al cargar datos:', err.message);
            setError('Error al cargar comercios o rutas: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este comercio?')) {
            return;
        }
        try {
            setError(null);
            const { error: deleteError } = await supabase
                .from('commerces')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            alert('Comercio eliminado con éxito.');
            fetchCommercesAndRoutes();
        } catch (err) {
            console.error('Error al eliminar comercio:', err.message);
            setError('Error al eliminar comercio: ' + err.message);
        }
    };

    const getRouteName = (routeId) => {
        const route = routes.find(r => r.id === routeId);
        return route ? route.name : 'Sin Ruta Asignada';
    };

    const filteredCommerces = commerces.filter(comercio =>
        comercio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comercio.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comercio.contact_person && comercio.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return <div className="loading-message">Cargando comercios y rutas...</div>;
    }

    return (
        <div className="manage-section">
            <h2>Administrar Comercios</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="action-bar">
                <button
                    className="button primary"
                    onClick={() => navigate('/admin/comercios/new')}
                >
                    Registrar Nuevo Comercio
                </button>
                <input
                    type="text"
                    placeholder="Buscar comercio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input form-input-modern" 
                />
            </div>

            <h3>Lista de Comercios Registrados</h3>
            {filteredCommerces.length === 0 ? (
                <p className="no-data-message">No hay comercios registrados o no se encontraron resultados.</p>
            ) : (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Dirección</th>
                                <th>Teléfono</th>
                                <th>Contacto</th>
                                <th>Ruta Asignada</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCommerces.map((comercio) => (
                                <tr key={comercio.id}>
                                    <td>{comercio.name}</td>
                                    <td>{comercio.address}</td>
                                    <td>{comercio.phone || 'N/A'}</td>
                                    <td>{comercio.contact_person || 'N/A'}</td>
                                    <td>{getRouteName(comercio.route_id)}</td>
                                    <td>
                                        <button
                                            onClick={() => navigate(`/admin/comercios/edit/${comercio.id}`)}
                                            className="button secondary small-button"
                                        >
                                            Editar
                                        </button>
                                        <button onClick={() => handleDelete(comercio.id)} className="button danger small-button">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ManageCommercesList;