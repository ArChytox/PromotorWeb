// src/components/EditUserForm.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import './styles.css';

function EditUserForm() {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Cargar datos del usuario de user_profiles
                const { data: userData, error: userError } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (userError) throw userError;
                if (!userData) {
                    setError('Usuario no encontrado.');
                    setLoading(false);
                    return;
                }
                setUser({ ...userData, route_id: userData.route_id || '' });

                // 2. Cargar rutas disponibles
                const { data: routesData, error: routesError } = await supabase
                    .from('routes')
                    .select('id, name')
                    .order('name', { ascending: true });

                if (routesError) throw routesError;
                setRoutes(routesData);

            } catch (err) {
                console.error('Error al cargar datos (usuario o rutas):', err.message);
                setError('Error al cargar datos: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchData();
        }
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            setError(null);
            const { id, created_at, email, ...updateData } = user;
            updateData.route_id = updateData.route_id || null;

            // --- PASO 1: Actualizar la tabla user_profiles ---
            const { error: profileUpdateError } = await supabase
                .from('user_profiles')
                .update(updateData)
                .eq('id', id);

            if (profileUpdateError) throw profileUpdateError;

            // --- PASO 2: Actualizar los metadatos del usuario en auth.users ---
            // Esto es crucial para sincronizar el 'name' en raw_user_meta_data
            const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
                id, // El ID del usuario que quieres actualizar
                {
                    data: { // Envía los metadatos que quieres actualizar
                        name: user.name, // <-- Usa el 'name' actualizado del formulario
                        role: user.role, // Puedes actualizar otros campos también
                        route_id: user.route_id, // Puedes actualizar otros campos también
                        // Asegúrate de incluir cualquier otro campo que desees mantener/actualizar en raw_user_meta_data
                    }
                }
            );

            if (authUpdateError) throw authUpdateError;

            alert('Usuario actualizado con éxito.');
            navigate('/admin/users');
        } catch (err) {
            console.error('Error al actualizar usuario:', err.message);
            setError('Error al actualizar usuario: ' + err.message);
        }
    };

    if (loading) {
        return <div className="loading-message">Cargando datos del usuario...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    if (!user) {
        return <div className="loading-message">Usuario no encontrado.</div>;
    }

    return (
        <div className="manage-section">
            <h2>Editar Usuario</h2>
            <form onSubmit={handleSubmit} className="admin-form">
                {/* Campo Nombre */}
                <div className="form-group-half">
                    <label htmlFor="name" className="form-label">Nombre:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Nombre"
                        value={user.name}
                        onChange={handleInputChange}
                        required
                        className="form-input-modern"
                    />
                </div>

                {/* Campo Email */}
                <div className="form-group-half">
                    <label htmlFor="email" className="form-label">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Email"
                        value={user.email}
                        onChange={handleInputChange}
                        required
                        readOnly
                        className="form-input-modern"
                    />
                </div>

                {/* Campo Rol */}
                <div className="form-group-half">
                    <label htmlFor="role" className="form-label">Rol:</label>
                    <select
                        id="role"
                        name="role"
                        value={user.role}
                        onChange={handleInputChange}
                        required
                        className="form-select-modern"
                    >
                        <option value="admin">Admin</option>
                        <option value="promoter">Promotor</option>
                    </select>
                </div>

                {/* Campo Ruta Asignada */}
                <div className="form-group-half">
                    <label htmlFor="route_id" className="form-label">Asignar a Ruta:</label>
                    <select
                        id="route_id"
                        name="route_id"
                        value={user.route_id || ''}
                        onChange={handleInputChange}
                        className="form-select-modern"
                    >
                        <option value="">-- Sin Ruta --</option>
                        {routes.map((route) => (
                            <option key={route.id} value={route.id}>
                                {route.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Botones de acción */}
                <div className="form-buttons-full-width">
                    <button type="submit" className="button primary">Actualizar Usuario</button>
                    <button type="button" onClick={() => navigate('/admin/users')} className="button secondary">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditUserForm;