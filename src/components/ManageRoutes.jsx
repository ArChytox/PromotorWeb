// src/components/ManageRoutes.jsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import './styles.css';

function ManageRoutes() {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newRoute, setNewRoute] = useState({ name: '' });
    const [editingRoute, setEditingRoute] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('routes')
                .select('*')
                .order('name', { ascending: true });
            if (error) throw error;
            setRoutes(data);
        } catch (err) {
            console.error('Error al cargar rutas:', err.message);
            setError('Error al cargar rutas: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (editingRoute) {
            setEditingRoute({ ...editingRoute, [name]: value });
        } else {
            setNewRoute({ ...newRoute, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            if (editingRoute) {
                const { id, created_at, ...updateData } = editingRoute;
                const { error } = await supabase
                    .from('routes')
                    .update(updateData)
                    .eq('id', id);
                if (error) throw error;
                alert('Ruta actualizada con éxito.');
                setEditingRoute(null);
            } else {
                const { error } = await supabase
                    .from('routes')
                    .insert([newRoute]);
                if (error) throw error;
                alert('Ruta añadida con éxito.');
                setNewRoute({ name: '' });
            }
            fetchRoutes();
        } catch (err) {
            console.error('Error al guardar ruta:', err.message);
            setError('Error al guardar ruta: ' + err.message);
        }
    };

    const handleEdit = (route) => {
        setEditingRoute(route);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta ruta?')) {
            return;
        }
        try {
            setError(null);
            const { error } = await supabase
                .from('routes')
                .delete()
                .eq('id', id);
            if (error) throw error;
            alert('Ruta eliminada con éxito.');
            fetchRoutes();
        } catch (err) {
            console.error('Error al eliminar ruta:', err.message);
            setError('Error al eliminar ruta: ' + err.message);
        }
    };

    const filteredRoutes = routes.filter(route =>
        route.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading-message">Cargando rutas...</div>;
    }

    return (
        <div className="manage-section">
            <h2>{editingRoute ? 'Editar Ruta' : 'Añadir Nueva Ruta'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
                <input
                    type="text"
                    name="name"
                    placeholder="Nombre de la Ruta"
                    value={editingRoute ? editingRoute.name : newRoute.name}
                    onChange={handleInputChange}
                    required
                    className="form-input-modern" 
                />
                <button type="submit" className="button primary">
                    {editingRoute ? 'Actualizar Ruta' : 'Añadir Ruta'}
                </button>
                {editingRoute && (
                    <button type="button" onClick={() => setEditingRoute(null)} className="button secondary">
                        Cancelar Edición
                    </button>
                )}
            </form>

            {error && <div className="error-message">{error}</div>}

            <div className="search-bar-container">
                <input
                    type="text"
                    placeholder="Buscar ruta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input form-input-modern" 
                />
            </div>

            <h2>Lista de Rutas</h2>
            {filteredRoutes.length === 0 ? (
                <p className="no-data-message">No hay rutas registradas o no se encontraron resultados.</p>
            ) : (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoutes.map((route) => (
                                <tr key={route.id}>
                                    <td>{route.name}</td>
                                    <td>
                                        <button onClick={() => handleEdit(route)} className="button secondary small-button">Editar</button>
                                        <button onClick={() => handleDelete(route.id)} className="button danger small-button">Eliminar</button>
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

export default ManageRoutes;