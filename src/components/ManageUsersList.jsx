// src/components/ManageUsersList.jsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function ManageUsersList() {
    const [users, setUsers] = useState([]);
    const [routes, setRoutes] = useState([]); // <-- Añadido: Estado para las rutas
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchUsersAndRoutes(); // <-- Modificado: Llama a la nueva función combinada
    }, []);

    // <-- Añadido: Función para cargar usuarios Y rutas
    const fetchUsersAndRoutes = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar usuarios
            const { data: usersData, error: usersError } = await supabase
                .from('user_profiles')
                .select('*')
                .order('name', { ascending: true });

            if (usersError) throw usersError;

            // Cargar rutas
            const { data: routesData, error: routesError } = await supabase
                .from('routes')
                .select('id, name')
                .order('name', { ascending: true });

            if (routesError) throw routesError;

            setUsers(usersData);
            setRoutes(routesData); // <-- Añadido: Guardar rutas en el estado
        } catch (err) {
            console.error('Error al cargar datos (usuarios o rutas):', err.message);
            setError('Error al cargar usuarios o rutas: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            return;
        }
        try {
            setError(null);
            const { error: deleteError } = await supabase
                .from('user_profiles')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            alert('Usuario eliminado con éxito.');
            fetchUsersAndRoutes(); // <-- Modificado: Llama a la nueva función para recargar
        } catch (err) {
            console.error('Error al eliminar usuario:', err.message);
            setError('Error al eliminar usuario: ' + err.message);
        }
    };

    // <-- Añadido: Función para obtener el nombre de la ruta
    const getRouteName = (routeId) => {
        const route = routes.find(r => r.id === routeId);
        return route ? route.name : 'Sin Ruta Asignada';
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading-message">Cargando usuarios y rutas...</div>;
    }

    return (
        <div className="manage-section">
            <h2>Administrar Usuarios</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="action-bar">
                <button
                    className="button primary"
                    onClick={() => navigate('/admin/users/new')}
                >
                    Registrar Nuevo Usuario
                </button>
                <input
                    type="text"
                    placeholder="Buscar usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input form-input-modern"
                />
            </div>

            <h3>Lista de Usuarios Registrados</h3>
            {filteredUsers.length === 0 ? (
                <p className="no-data-message">No hay usuarios registrados o no se encontraron resultados.</p>
            ) : (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Ruta Asignada</th> {/* <-- Añadido: Encabezado de la columna */}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    {/* <-- Añadido: Celda para mostrar el nombre de la ruta */}
                                    <td>{getRouteName(user.route_id)}</td> 
                                    <td>
                                        <button
                                            onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                                            className="button secondary small-button"
                                        >
                                            Editar
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="button danger small-button">Eliminar</button>
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

export default ManageUsersList;