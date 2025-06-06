// src/components/ManageUsers.jsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import '../components/styles.css';

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para el nuevo formulario de registro de usuario
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('promoter');
    const [newUserRouteId, setNewUserRouteId] = useState('');
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    useEffect(() => {
        fetchUsersAndRoutes();
    }, []);

    const fetchUsersAndRoutes = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: usersData, error: usersError } = await supabase
                .from('user_profiles')
                .select('*')
                .order('name', { ascending: true });

            if (usersError) throw usersError;

            const { data: routesData, error: routesError } = await supabase
                .from('routes')
                .select('id, name')
                .order('name', { ascending: true });

            if (routesError) throw routesError;

            setUsers(usersData);
            setRoutes(routesData);
        } catch (err) {
            console.error('Error al cargar usuarios o rutas:', err.message);
            setError('Error al cargar usuarios o rutas: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterNewUser = async (e) => {
        e.preventDefault();
        setIsCreatingUser(true);
        setError(null);

        try {
            // Paso 1: Crear usuario en Supabase Authentication usando admin.createUser.
            // Los datos 'name' y 'role' se pasan en los metadatos para que el trigger
            // (on_auth_user_created) los recoja y los inserte en 'user_profiles'.
            const { data: newUserAuthData, error: authError } = await supabase.auth.admin.createUser({
                email: newUserEmail,
                password: newUserPassword,
                email_confirm: true,
                user_metadata: { name: newUserName }, // El trigger lee esto para el nombre
                app_metadata: { role: newUserRole }  // El trigger lee esto para el rol
            });

            if (authError) {
                console.error('Error al crear usuario en autenticación:', authError.message);
                throw new Error('Error al crear usuario: ' + authError.message);
            }

            const newUserId = newUserAuthData.user.id;

            // Paso 2 (Opcional): Asignar la ruta si se seleccionó una.
            // Esto se hace CON UN UPDATE después de que el trigger ha creado el perfil base.
            if (newUserRouteId) {
                const { error: updateError } = await supabase
                    .from('user_profiles')
                    .update({ route_id: newUserRouteId })
                    .eq('id', newUserId);
                
                if (updateError) {
                    console.warn('Advertencia: No se pudo asignar la ruta al nuevo usuario:', updateError.message);
                    setError('Usuario creado, pero no se pudo asignar la ruta: ' + updateError.message);
                }
            }
            
            alert(`Usuario ${newUserEmail} registrado y perfil creado con éxito.`);
            
            // Limpiar el formulario
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserRole('promoter');
            setNewUserRouteId('');
            
            // Recargar lista de usuarios (¡sin desloguear al admin!)
            fetchUsersAndRoutes(); 

        } catch (err) {
            console.error("Error al registrar usuario:", err.message);
            setError("Error al registrar usuario: " + err.message);
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser({ ...user, route_id: user.route_id || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (editingUser) {
            setEditingUser({ ...editingUser, [name]: value });
        }
        // No hay manejo de input para new user aquí, se maneja directamente en sus propios states
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            if (editingUser) {
                const { id, created_at, email, ...updateData } = editingUser; // No actualizar ID, created_at, ni email
                updateData.route_id = updateData.route_id || null;

                const { error } = await supabase
                    .from('user_profiles')
                    .update(updateData)
                    .eq('id', id);

                if (error) throw error;
                alert('Usuario actualizado con éxito.');
                setEditingUser(null);
                fetchUsersAndRoutes();
            }
        } catch (err) {
            console.error('Error al actualizar usuario:', err.message);
            setError('Error al actualizar usuario: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este perfil de usuario?')) {
            return;
        }
        try {
            setError(null);
            const { error } = await supabase
                .from('user_profiles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert('Perfil de usuario eliminado con éxito.');
            fetchUsersAndRoutes();
        } catch (err) {
            console.error('Error al eliminar perfil de usuario:', err.message);
            setError('Error al eliminar perfil de usuario: ' + err.message);
        }
    };

    const getRoleName = (role) => {
        switch (role) {
            case 'admin':
                return 'Administrador';
            case 'promoter':
                return 'Promotor';
            default:
                return 'Desconocido';
        }
    };

    // Función para obtener el nombre de la ruta dado su ID
    const getRouteName = (routeId) => {
        const route = routes.find(r => r.id === routeId);
        return route ? route.name : 'Sin Ruta Asignada';
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading-message">Cargando usuarios y rutas...</div>;
    }

    return (
        <div className="manage-section">
            <h2>Registrar Nuevo Usuario</h2>
            <form onSubmit={handleRegisterNewUser} className="admin-form">
                <input
                    type="text"
                    placeholder="Nombre del Usuario"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email del Usuario"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                />
                <label htmlFor="new_user_role" className="form-label">Rol:</label>
                <select
                    id="new_user_role"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    required
                >
                    <option value="promoter">Promotor</option>
                    <option value="admin">Administrador</option>
                </select>
                <label htmlFor="new_user_route_id" className="form-label">Asignar a Ruta:</label>
                <select
                    id="new_user_route_id"
                    value={newUserRouteId}
                    onChange={(e) => setNewUserRouteId(e.target.value)}
                >
                    <option value="">-- Sin Ruta --</option>
                    {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                            {route.name}
                        </option>
                    ))}
                </select>
                <button type="submit" className="button primary" disabled={isCreatingUser}>
                    {isCreatingUser ? 'Registrando...' : 'Registrar Usuario'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {editingUser && (
                <div className="edit-form-container">
                    <h3>Editar Usuario: {editingUser.name}</h3>
                    <form onSubmit={handleSubmitEdit} className="admin-form">
                        <label htmlFor="edit_name">Nombre:</label>
                        <input
                            type="text"
                            id="edit_name"
                            name="name"
                            value={editingUser.name}
                            onChange={handleInputChange}
                            required
                        />
                        <label htmlFor="edit_role">Rol:</label>
                        <select
                            id="edit_role"
                            name="role"
                            value={editingUser.role}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="promoter">Promotor</option>
                            <option value="admin">Administrador</option>
                        </select>

                        <label htmlFor="edit_route_id" className="form-label">Asignar a Ruta:</label>
                        <select
                            id="edit_route_id"
                            name="route_id"
                            value={editingUser.route_id}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            <option value="">-- Sin Ruta --</option>
                            {routes.map((route) => (
                                <option key={route.id} value={route.id}>
                                    {route.name}
                                </option>
                            ))}
                        </select>

                        <button type="submit" className="button primary">Actualizar Usuario</button>
                        <button type="button" onClick={() => setEditingUser(null)} className="button secondary">Cancelar</button>
                    </form>
                </div>
            )}

            <div className="search-bar-container">
                <input
                    type="text"
                    placeholder="Buscar usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
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
                                <th>Ruta Asignada</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{getRoleName(user.role)}</td>
                                    {/* Aquí se usa getRouteName para mostrar el nombre de la ruta */}
                                    <td>{getRouteName(user.route_id)}</td>
                                    <td>
                                        <button onClick={() => handleEdit(user)} className="button secondary small-button">Editar</button>
                                        <button onClick={() => handleDelete(user.id)} className="button danger small-button">Eliminar Perfil</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <p className="note">
                Nota: La eliminación de perfiles de usuario aquí no elimina las cuentas de usuario de la autenticación de Supabase.
                Debes gestionarlas directamente en la sección "Authentication" de tu consola de Supabase.
            </p>
        </div>
    );
}

export default ManageUsers;