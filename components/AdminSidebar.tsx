'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Logo } from './Logo';
import { useState } from 'react';
import { 
  FiHome, 
  FiFileText, 
  FiLayers, 
  FiDroplet, 
  FiSearch, 
  FiInbox, 
  FiLayout, 
  FiSettings, 
  FiLogOut,
  FiExternalLink,
  FiMenu,
  FiX
} from 'react-icons/fi';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/admin', label: 'Overview', icon: FiHome },
    { href: '/admin/content', label: 'Content & Media', icon: FiFileText },
    { href: '/admin/services', label: 'Services CRUD', icon: FiLayers },
    { href: '/admin/design', label: 'Design & Theme', icon: FiDroplet },
    { href: '/admin/seo', label: 'SEO Meta Tags', icon: FiSearch },
    { href: '/admin/leads', label: 'Leads & Form', icon: FiInbox },
    { href: '/admin/promo', label: 'Promo Bar', icon: FiLayout },
    { href: '/admin/settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden w-full bg-bg-primary border-b border-slate/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Logo height={28} width={120} />
          <span className="text-[10px] text-teal font-mono uppercase tracking-widest font-semibold">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-ink rounded-lg hover:bg-slate/10"
          aria-label="Toggle Admin Sidebar"
        >
          {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Sidebar Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-bg-primary border-r border-slate/10 flex flex-col h-full select-none transition-transform duration-200 ease-in-out md:static md:translate-x-0
        ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate/10 flex items-center justify-between">
          <div>
            <Logo height={32} width={130} />
            <span className="text-[10px] text-teal font-mono uppercase tracking-widest font-semibold block mt-1">Admin Panel</span>
          </div>
          <button 
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-slate hover:text-ink"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active 
                    ? 'bg-teal/15 text-teal font-semibold shadow-sm' 
                    : 'text-slate hover:bg-slate/5 hover:text-ink'
                }`}
              >
                <Icon size={18} className={active ? 'text-teal' : 'text-slate'} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate/10 space-y-2">
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate hover:text-teal hover:bg-slate/5 rounded-lg transition-colors"
          >
            <span className="flex items-center space-x-2">
              <FiExternalLink size={14} />
              <span>View Live Site</span>
            </span>
          </a>

          <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <FiLogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

