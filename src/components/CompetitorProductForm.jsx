// src/components/CompetitorProductForm.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import './styles.css'; // Asegúrate de que tus estilos globales estén bien

function CompetitorProductForm({ product, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                brand: product.brand || '',
                category: product.category || '',
                notes: product.notes || '',
            });
        } else {
            setFormData({
                name: '',
                brand: '',
                category: '',
                notes: '',
            });
        }
    }, [product]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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
                    .from('competitor_products') // *** Apunta a la tabla correcta ***
                    .update(formData)
                    .eq('id', product.id);
                result = { data, error: updateError };
            } else {
                // Modo Añadir
                const { data, error: insertError } = await supabase
                    .from('competitor_products') // *** Apunta a la tabla correcta ***
                    .insert([formData]);
                result = { data, error: insertError };
            }

            if (result.error) throw result.error;

            alert(`Producto de competencia ${product ? 'actualizado' : 'añadido'} con éxito.`);
            onSuccess();
        } catch (err) {
            console.error('Error al guardar producto de competencia:', err.message);
            setError('Error al guardar producto de competencia: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="product-form-container">
            <h3>{product ? 'Editar Producto de Competencia' : 'Añadir Nuevo Producto de Competencia'}</h3>
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
                    <label htmlFor="brand">Marca:</label>
                    <input
                        type="text"
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="form-input-modern"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="category">Categoría:</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="form-input-modern"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="notes">Notas:</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="3"
                        className="form-input-modern"
                    ></textarea>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-buttons">
                    <button type="submit" className="button primary" disabled={loading}>
                        {loading ? 'Guardando...' : (product ? 'Actualizar Producto' : 'Añadir Producto')}
                    </button>
                    <button type="button" onClick={onCancel} className="button secondary" disabled={loading}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CompetitorProductForm;
