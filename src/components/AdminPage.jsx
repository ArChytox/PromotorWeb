// src/components/AdminPage.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
// Importa Outlet y useLocation, que son necesarios para el layout
import { useNavigate, Outlet, useLocation } from 'react-router-dom'; 

import './styles.css'; // Tus estilos globales

function AdminPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation(); // Para saber la URL actual y resaltar el botón activo

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    navigate('/login');
                    return;
                }

                const { data: adminCheck, error: rpcError } = await supabase.rpc('is_app_admin');

                if (rpcError) {
                    console.error('Error al verificar el rol de administrador:', rpcError.message);
                    alert('Error al verificar permisos de administrador. Por favor, inicia sesión de nuevo.');
                    navigate('/login');
                    return;
                }

                if (adminCheck) {
                    setIsAdmin(true);
                } else {
                    alert('Acceso denegado. No tienes permisos de administrador.');
                    navigate('/'); // Redirige a la ruta principal si no es admin
                }
            } catch (err) {
                console.error('Error en la autenticación o verificación:', err.message);
                alert('Ocurrió un error inesperado. Por favor, intenta iniciar sesión de nuevo.');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                navigate('/login');
            }
        });

        checkAdminStatus();

        return () => {
            if (authListener) {
                authListener.subscription.unsubscribe();
            }
        };
    }, [navigate]);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            console.log('Sesión cerrada exitosamente.');
        } catch (error) {
            console.error('Error al cerrar sesión:', error.message);
            alert('Error al cerrar sesión. Por favor, inténtalo de nuevo.');
        }
    };

    // Función para determinar si un botón del menú está activo
    const isSectionActive = (pathSegment) => {
        // location.pathname es la URL actual, por ejemplo: /admin/users/new
        // Comprobamos si la URL actual empieza con la ruta base de la sección
        return location.pathname.startsWith(`/admin/${pathSegment}`);
    };

    if (loading) {
        return <div className="loading-message">Verificando permisos de administrador...</div>;
    }

    if (!isAdmin) {
        return null; 
    }

    return (
        <div className="admin-container container">
            <h1 className="main-title">Panel de Administración</h1>

            <nav className="admin-nav">
                {/* Ahora usamos navigate para cambiar la URL y el layout se encarga de renderizar el componente */}
                <button
                    className={`button ${isSectionActive('comercios') ? 'primary' : 'secondary'}`}
                    onClick={() => navigate('/admin/comercios')}
                >
                    Administrar Comercios
                </button>
                <button
                    className={`button ${isSectionActive('users') ? 'primary' : 'secondary'}`}
                    onClick={() => navigate('/admin/users')} 
                >
                    Administrar Usuarios
                </button>
                <button
                    className={`button ${isSectionActive('rutas') ? 'primary' : 'secondary'}`}
                    onClick={() => navigate('/admin/rutas')}
                >
                    Administrar Rutas
                </button>
                <button
                    className={`button ${isSectionActive('nuestros-productos') ? 'primary' : 'secondary'}`}
                    onClick={() => navigate('/admin/nuestros-productos')}
                >
                    Nuestros Productos
                </button>
                <button
                    className={`button ${isSectionActive('competencia-productos') ? 'primary' : 'secondary'}`}
                    onClick={() => navigate('/admin/competencia-productos')}
                >
                    Productos Competencia
                </button>
                <button
                    className={`button ${isSectionActive('asignaciones') ? 'primary' : 'secondary'}`}
                    onClick={() => navigate('/admin/asignaciones')}
                >
                    Asignar Rutas
                </button>
            </nav>

            <div className="admin-content">
                {/* Outlet es el placeholder donde React Router renderizará el componente hijo */}
                <Outlet /> 
            </div>

            <button onClick={handleSignOut} className="button secondary logout-button">
                Cerrar Sesión Admin
            </button>
        </div>
    );
}

export default AdminPage;