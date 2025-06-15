'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ManagementLayoutProps {
    children: ReactNode;
}

export default function ManagementLayout({ children }: ManagementLayoutProps) {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!isAuthenticated || !user || user.id_Rol !== 6)) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, user, loading, router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated || !user || user.id_Rol !== 6) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
}
