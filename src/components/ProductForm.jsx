// src/components/ProductForm.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import './styles.css'; // Asegúrate de que tus estilos globales estén bien

function ProductForm({ product, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        descripcion: '',    // *** CAMBIO AQUÍ: 'descripcion' ***
        precio_sugerido: '',// *** CAMBIO AQUÍ: 'precio_sugerido' ***
        moneda: 'VES',      // *** CAMBIO AQUÍ: 'moneda' ***
        categoria: '',      // *** CAMBIO AQUÍ: 'categoria' ***
        activo: true,       // *** CAMBIO AQUÍ: 'activo' por defecto true ***
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                descripcion: product.descripcion || '',
                precio_sugerido: product.precio_sugerido || '',
                moneda: product.moneda || 'VES',
                categoria: product.categoria || '',
                activo: typeof product.activo === 'boolean' ? product.activo : true, // Manejar booleano
            });
        } else {
            setFormData({
                name: '',
                descripcion: '',
                precio_sugerido: '',
                moneda: 'VES',
                categoria: '',
                activo: true,
            });
        }
    }, [product]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let result;
            if (product) {
                // Modo Edición
                const { data, error: updateError } = await supabase
                    .from('chispa_presentations') // *** CAMBIO AQUÍ: Nombre de la tabla ***
                    .update(formData)
                    .eq('id', product.id);
                result = { data, error: updateError };
            } else {
                // Modo Añadir
                const { data, error: insertError } = await supabase
                    .from('chispa_presentations') // *** CAMBIO AQUÍ: Nombre de la tabla ***
                    .insert([formData]);
                result = { data, error: insertError };
            }

            if (result.error) throw result.error;

            alert(`Presentación de producto ${product ? 'actualizada' : 'añadida'} con éxito.`);
            onSuccess();
        } catch (err) {
            console.error('Error al guardar presentación de producto:', err.message);
            setError('Error al guardar presentación de producto: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="product-form-container">
            <h3>{product ? 'Editar Presentación' : 'Añadir Nueva Presentación'}</h3>
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                    <label htmlFor="name">Nombre del Producto:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="form-input-modern"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="descripcion">Descripción:</label> {/* *** CAMBIO ETIQUETA *** */}
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        rows="3"
                        className="form-input-modern"
                    ></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="categoria">Categoría:</label> {/* *** CAMBIO ETIQUETA *** */}
                    <input
                        type="text"
                        id="categoria"
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleInputChange}
                        className="form-input-modern"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="precio_sugerido">Precio Sugerido:</label> {/* *** CAMBIO ETIQUETA *** */}
                    <input
                        type="number"
                        id="precio_sugerido"
                        name="precio_sugerido"
                        value={formData.precio_sugerido}
                        onChange={handleInputChange}
                        step="0.01"
                        required
                        className="form-input-modern"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="moneda">Moneda:</label> {/* *** CAMBIO ETIQUETA *** */}
                    <select
                        id="moneda"
                        name="moneda"
                        value={formData.moneda}
                        onChange={handleInputChange}
                        required
                        className="form-select-modern"
                    >
                        <option value="VES">VES (Bolívares)</option>
                        <option value="USD">USD (Dólares)</option>
                    </select>
                </div>
                <div className="form-group form-group-checkbox"> {/* Nuevo grupo para checkbox */}
                    <input
                        type="checkbox"
                        id="activo"
                        name="activo"
                        checked={formData.activo}
                        onChange={handleInputChange}
                        className="form-checkbox"
                    />
                    <label htmlFor="activo">Activo</label>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-buttons">
                    <button type="submit" className="button primary" disabled={loading}>
                        {loading ? 'Guardando...' : (product ? 'Actualizar Presentación' : 'Añadir Presentación')}
                    </button>
                    <button type="button" onClick={onCancel} className="button secondary" disabled={loading}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProductForm;