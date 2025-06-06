// src/components/ManageUsersContainer.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Importa Routes y Route
import ManageUsersList from './ManageUsersList'; // Tu componente de lista de usuarios
import CreateUserForm from './CreateUserForm';   // Tu formulario de creación
import EditUserForm from './EditUserForm';     // Tu formulario de edición
import './styles.css'; // Asegúrate de tener los estilos

function ManageUsersContainer() {
    return (
        <div className="manage-users-sub-section">
            <Routes>
                {/* Ruta por defecto para /admin/users -> mostrar la lista de usuarios */}
                <Route index element={<ManageUsersList />} /> 
                {/* Ruta para /admin/users/new */}
                <Route path="new" element={<CreateUserForm />} />
                {/* Ruta para /admin/users/edit/:userId */}
                <Route path="edit/:userId" element={<EditUserForm />} />
            </Routes>
        </div>
    );
}

export default ManageUsersContainer;