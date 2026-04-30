import { Link } from '@inertiajs/react';
import { useCallback } from 'react';

export default function LogoutButton({ 
    children, 
    className = "",
    as = "button",
    ...props 
}) {
    const handleLogout = useCallback((e) => {
        // Let Inertia handle the post request with CSRF token
        // This ensures proper session handling
    }, []);

    return (
        <Link
            method="post"
            href={route('logout')}
            as={as}
            className={className}
            onClick={handleLogout}
            {...props}
        >
            {children}
        </Link>
    );
}
