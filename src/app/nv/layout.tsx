import Sidebar from '@/components/nv/Sidebar/Sidebar';
import Header from '@/components/nv/Header/Header';
import PermissionGuard from '@/components/nv/PermissionGuard/PermissionGuard';

export const metadata = {
  title: 'Capital Source Portal',
  description: 'VIX Capital Source Department Portal',
};

export default function NvLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Header />
          <main style={{ flex: 1, overflowY: 'auto', padding:'var(--space-1)', backgroundColor: 'var(--background)' }}>
            {children}
          </main>
        </div>
      </div>
    </PermissionGuard>
  );
}
