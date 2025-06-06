// src/components/EditComercioForm.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import './styles.css';

function EditComercioForm() {
    const { comercioId } = useParams();
    const [comercio, setComercio] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchComercioAndRoutes = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data: comercioData, error: comercioError } = await supabase
                    .from('commerces')
                    .select('*')
                    .eq('id', comercioId)
                    .single();

                if (comercioError) throw comercioError;
                if (!comercioData) {
                    setError('Comercio no encontrado.');
                    setLoading(false);
                    return;
                }

                setComercio({ ...comercioData, route_id: comercioData.route_id || '' });

                const { data: routesData, error: routesError } = await supabase
                    .from('routes')
                    .select('id, name')
                    .order('name', { ascending: true });

                if (routesError) throw routesError;
                setRoutes(routesData);

            } catch (err) {
                console.error('Error al cargar comercio o rutas:', err.message);
                setError('Error al cargar datos del comercio: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        if (comercioId) {
            fetchComercioAndRoutes();
        }
    }, [comercioId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setComercio({ ...comercio, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comercio) return;

        try {
            setError(null);
            const { id, created_at, ...updateData } = comercio;
            updateData.route_id = updateData.route_id || null;

            const { error: updateError } = await supabase
                .from('commerces')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            alert('Comercio actualizado con éxito.');
            navigate('/admin/comercios');
        } catch (err) {
            console.error('Error al actualizar comercio:', err.message);
            setError('Error al actualizar comercio: ' + err.message);
        }
    };

    if (loading) {
        return <div className="loading-message">Cargando datos del comercio...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    if (!comercio) {
        return <div className="loading-message">Comercio no encontrado.</div>;
    }

    return (
        <div className="manage-section">
            <h2>Editar Comercio</h2>
            <form onSubmit={handleSubmit} className="admin-form">
                <input
                    type="text"
                    name="name"
                    placeholder="Nombre del Comercio"
                    value={comercio.name}
                    onChange={handleInputChange}
                    required
                    className="form-input-modern" 
                />
                <input
                    type="text"
                    name="address"
                    placeholder="Dirección"
                    value={comercio.address}
                    onChange={handleInputChange}
                    required
                    className="form-input-modern" 
                />
                <input
                    type="text"
                    name="phone"
                    placeholder="Teléfono"
                    value={comercio.phone || ''}
                    onChange={handleInputChange}
                    className="form-input-modern"
                />
                <input
                    type="text"
                    name="contact_person"
                    placeholder="Persona de Contacto"
                    value={comercio.contact_person || ''}
                    onChange={handleInputChange}
                    className="form-input-modern" 
                />
                <label htmlFor="route_id" className="form-label">Asignar a Ruta:</label>
                <select
                    id="route_id"
                    name="route_id"
                    value={comercio.route_id}
                    onChange={handleInputChange}
                    className="form-select-modern"
                >
                    <option value="">-- Seleccionar Ruta --</option>
                    {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                            {route.name}
                        </option>
                    ))}
                </select>
                <button type="submit" className="button primary">Actualizar Comercio</button>
                <button type="button" onClick={() => navigate('/admin/comercios')} className="button secondary">
                    Cancelar
                </button>
            </form>
        </div>
    );
}

export default EditComercioForm;