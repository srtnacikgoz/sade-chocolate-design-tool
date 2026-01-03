import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PenTool, Settings, Box } from 'lucide-react';
import { clsx } from 'clsx';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: PenTool, label: 'Designer', path: '/designer' },
        { icon: Box, label: 'Templates', path: '/templates' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="flex h-screen bg-brand-cream font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-stone-200 flex flex-col shadow-sm z-10">
                <div className="p-8 border-b border-stone-100">
                    <h1 className="text-3xl font-serif font-bold text-brand-dark tracking-tight">Sade</h1>
                    <p className="text-xs text-stone-500 tracking-widest uppercase mt-2 font-medium">Chocolate Design</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-brand-pink text-brand-dark font-medium shadow-sm"
                                        : "text-stone-500 hover:bg-stone-50 hover:text-brand-dark"
                                )}
                            >
                                <Icon size={20} className={clsx(isActive ? "text-brand-dark" : "text-stone-400")} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-stone-100">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-dark font-serif text-lg">
                            S
                        </div>
                        <div className="text-sm">
                            <p className="font-medium text-brand-dark">Sade Admin</p>
                            <p className="text-stone-400 text-xs">admin@sade.com</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-brand-cream/50">
                {children}
            </main>
        </div>
    );
};

export default Layout;
