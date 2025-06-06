// src/pages/ManageChispaProducts.jsx (o donde prefieras ubicarlo)

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import ProductForm from '../components/ProductForm'; // Asegúrate de que la ruta sea correcta
import './styles.css'; // Asegúrate de que tus estilos globales estén bien

function ManageChispaProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);

    // Función para cargar los productos desde Supabase
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('chispa_presentations') // *** CAMBIO AQUÍ: Nombre de la tabla ***
                .select('*')
                .order('name', { ascending: true }); // Ordena por nombre

            if (error) throw error;
            setProducts(data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar productos:', err.message);
            setError('Error al cargar productos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
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
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta presentación de producto?')) {
            return;
        }
        try {
            const { error } = await supabase
                .from('chispa_presentations') // *** CAMBIO AQUÍ: Nombre de la tabla ***
                .delete()
                .eq('id', productId);

            if (error) throw error;
            alert('Presentación de producto eliminada con éxito.');
            fetchProducts(); // Recargar la lista
        } catch (err) {
            console.error('Error al eliminar presentación de producto:', err.message);
            setError('Error al eliminar presentación de producto: ' + err.message);
        }
    };

    const handleFormSubmitSuccess = () => {
        setEditingProduct(null);
        setIsAddingNew(false);
        fetchProducts();
    };

    // --- Renderizado ---

    if (loading) {
        return <div className="loading-message">Cargando presentaciones de productos...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="manage-section">
            <h2>Administrar Presentaciones de Productos Chispa</h2>

            {(isAddingNew || editingProduct) && (
                <ProductForm
                    product={editingProduct}
                    onSuccess={handleFormSubmitSuccess}
                    onCancel={() => { setEditingProduct(null); setIsAddingNew(false); }}
                />
            )}

            {!isAddingNew && !editingProduct && (
                <button onClick={handleAddProduct} className="button primary">
                    Añadir Nueva Presentación
                </button>
            )}

            <h3>Listado de Presentaciones</h3>
            {products.length === 0 ? (
                <p>No hay presentaciones de productos registradas.</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Descripción</th>
                            <th>Precio Sugerido</th>
                            <th>Moneda</th>
                            <th>Activo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.categoria}</td> {/* *** CAMBIO AQUÍ: categoria *** */}
                                <td>{product.descripcion}</td> {/* *** CAMBIO AQUÍ: descripcion *** */}
                                <td>{product.precio_sugerido}</td> {/* *** CAMBIO AQUÍ: precio_sugerido *** */}
                                <td>{product.moneda}</td> {/* *** CAMBIO AQUÍ: moneda *** */}
                                <td>{product.activo ? 'Sí' : 'No'}</td> {/* *** CAMBIO AQUÍ: activo *** */}
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

export default ManageChispaProducts;