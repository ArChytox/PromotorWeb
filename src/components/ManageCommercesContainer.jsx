// src/components/ManageCommercesContainer.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ManageCommercesList from './ManageCommercesList'; // Este será tu componente modificado (solo la lista)
import CreateComercioForm from './CreateComercioForm';   // Nuevo componente para la creación
import EditComercioForm from './EditComercioForm';     // Nuevo componente para la edición

import './styles.css'; // Tus estilos globales

function ManageCommercesContainer() {
    return (
        <div className="manage-commerces-sub-section">
            <Routes>
                {/* Ruta por defecto para /admin/comercios, muestra la lista */}
                <Route index element={<ManageCommercesList />} /> 
                {/* Ruta para /admin/comercios/new */}
                <Route path="new" element={<CreateComercioForm />} />
                {/* Ruta para /admin/comercios/edit/:comercioId */}
                <Route path="edit/:comercioId" element={<EditComercioForm />} />
            </Routes>
        </div>
    );
}

export default ManageCommercesContainer;