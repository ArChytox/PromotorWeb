// src/pages/ManageCompetitorProducts.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CompetitorProductForm from '../components/CompetitorProductForm'; // Asegúrate de la ruta
import './styles.css'; // Asegúrate de que tus estilos globales estén bien

function ManageCompetitorProducts() {
    const [competitorProducts, setCompetitorProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);

    // Función para cargar los productos de competencia desde Supabase
    const fetchCompetitorProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('competitor_products') // *** Apunta a la tabla correcta ***
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setCompetitorProducts(data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar productos de competencia:', err.message);
            setError('Error al cargar productos de competencia: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompetitorProducts();
    }, []);

    // --- Handlers para CRUD ---

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsAddingNew(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsAddingNew(false);
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este producto de competencia?')) {
            return;
        }
        try {
            const { error } = await supabase
                .from('competitor_products') // *** Apunta a la tabla correcta ***
                .delete()
                .eq('id', productId);

            if (error) throw error;
            alert('Producto de competencia eliminado con éxito.');
            fetchCompetitorProducts(); // Recargar la lista
        } catch (err) {
            console.error('Error al eliminar producto de competencia:', err.message);
            setError('Error al eliminar producto de competencia: ' + err.message);
        }
    };

    const handleFormSubmitSuccess = () => {
        setEditingProduct(null);
        setIsAddingNew(false);
        fetchCompetitorProducts(); // Recarga la lista
    };

    // --- Renderizado ---

    if (loading) {
        return <div className="loading-message">Cargando productos de competencia...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="manage-section">
            <h2>Administrar Productos de Competencia</h2>

            {(isAddingNew || editingProduct) && (
                <CompetitorProductForm
                    product={editingProduct}
                    onSuccess={handleFormSubmitSuccess}
                    onCancel={() => { setEditingProduct(null); setIsAddingNew(false); }}
                />
            )}

            {!isAddingNew && !editingProduct && (
                <button onClick={handleAddProduct} className="button primary">
                    Añadir Nuevo Producto de Competencia
                </button>
            )}

            <h3>Listado de Productos de Competencia</h3>
            {competitorProducts.length === 0 ? (
                <p>No hay productos de competencia registrados.</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Marca</th>
                            <th>Categoría</th>
                            <th>Notas</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {competitorProducts.map((product) => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.brand}</td>
                                <td>{product.category}</td>
                                <td>{product.notes}</td>
                                <td>
                                    <button onClick={() => handleEditProduct(product)} className="button secondary small">
                                        Editar
                                    </button>
                                    <button onClick={() => handleDeleteProduct(product.id)} className="button danger small">
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ManageCompetitorProducts;