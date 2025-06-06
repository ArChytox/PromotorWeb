// src/components/CreateUserForm.jsx

import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function CreateUserForm() {
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: '' });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);

            // Primero, crea el usuario en Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    data: {
                        name: newUser.name,
                        role: newUser.role,
                    },
                },
            });

            if (authError) {
                // Si el error es "User already registered", intenta actualizar el perfil existente
                if (authError.message.includes('User already registered')) {
                    const { data: existingUser, error: fetchError } = await supabase
                        .from('user_profiles')
                        .select('id')
                        .eq('email', newUser.email)
                        .single();

                    if (fetchError || !existingUser) {
                        throw new Error('Error al buscar usuario existente o usuario no encontrado en perfiles.');
                    }

                    const { error: updateError } = await supabase
                        .from('user_profiles')
                        .update({ name: newUser.name, role: newUser.role })
                        .eq('id', existingUser.id);

                    if (updateError) throw updateError;
                    alert('Usuario existente actualizado con éxito.');
                } else {
                    throw authError; // Otros errores de autenticación
                }
            } else if (authData.user) {
                // Si el usuario se creó correctamente en auth, inserta en user_profiles
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert([
                        {
                            id: authData.user.id, // Usa el ID del usuario de auth
                            name: newUser.name,
                            email: newUser.email,
                            role: newUser.role,
                        },
                    ]);

                if (profileError) throw profileError;
                alert('Usuario añadido con éxito.');
            } else {
                throw new Error('No se pudo crear el usuario en Supabase Authentication.');
            }

            navigate('/admin/users'); // Volver a la lista después de la creación
        } catch (err) {
            console.error('Error al añadir usuario:', err.message);
            setError('Error al añadir usuario: ' + err.message);
        }
    };

    return (
        <div className="manage-section">
            <h2>Añadir Nuevo Usuario</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="admin-form">
                <input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                    className="form-input-modern" 
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                    className="form-input-modern" 
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={newUser.password}
                    onChange={handleInputChange}
                    required
                    className="form-input-modern" 
                />
                <label htmlFor="role" className="form-label">Rol:</label>
                <select
                    id="role"
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    required
                    className="form-select-modern" 
                >
                    <option value="">-- Seleccionar Rol --</option>
                    <option value="admin">Admin</option>
                    <option value="promoter">Promotor</option>
                </select>
                <button type="submit" className="button primary">Añadir Usuario</button>
                <button type="button" onClick={() => navigate('/admin/users')} className="button secondary">
                    Cancelar
                </button>
            </form>
        </div>
    );
}

export default CreateUserForm;