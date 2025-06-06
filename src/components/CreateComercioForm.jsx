// src/components/CreateComercioForm.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function CreateComercioForm() {
    const [newComercio, setNewComercio] = useState({ name: '', address: '', phone: '', contact_person: '', route_id: '' });
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                setLoading(true);
                const { data: routesData, error: routesError } = await supabase
                    .from('routes')
                    .select('id, name')
                    .order('name', { ascending: true });

                if (routesError) throw routesError;
                setRoutes(routesData);
            } catch (err) {
                console.error('Error al cargar rutas:', err.message);
                setError('Error al cargar rutas: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutes();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewComercio({ ...newComercio, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            const dataToInsert = { ...newComercio };
            dataToInsert.route_id = dataToInsert.route_id || null; 

            const { error: insertError } = await supabase
                .from('commerces')
                .insert([dataToInsert]);

            if (insertError) throw insertError;

            alert('Comercio añadido con éxito.');
            navigate('/admin/comercios');
        } catch (err) {
            console.error('Error al añadir comercio:', err.message);
            setError('Error al añadir comercio: ' + err.message);
        }
    };

    if (loading) {
        return <div className="loading-message">Cargando rutas para el formulario...</div>;
    }

    return (
        <div className="manage-section">
            <h2>Añadir Nuevo Comercio</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="admin-form">
                <input
                    type="text"
                    name="name"
                    placeholder="Nombre del Comercio"
                    value={newComercio.name}
                    onChange={handleInputChange}
                    required
                    className="form-input-modern" 
                />
                <input
                    type="text"
                    name="address"
                    placeholder="Dirección"
                    value={newComercio.address}
                    onChange={handleInputChange}
                    required
                    className="form-input-modern" 
                />
                <input
                    type="text"
                    name="phone"
                    placeholder="Teléfono"
                    value={newComercio.phone}
                    onChange={handleInputChange}
                    className="form-input-modern"
                />
                <input
                    type="text"
                    name="contact_person"
                    placeholder="Persona de Contacto"
                    value={newComercio.contact_person}
                    onChange={handleInputChange}
                    className="form-input-modern"
                />
                <label htmlFor="route_id" className="form-label">Asignar a Ruta:</label>
                <select
                    id="route_id"
                    name="route_id"
                    value={newComercio.route_id}
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
                <button type="submit" className="button primary">Añadir Comercio</button>
                <button type="button" onClick={() => navigate('/admin/comercios')} className="button secondary">
                    Cancelar
                </button>
            </form>
        </div>
    );
}

export default CreateComercioForm;