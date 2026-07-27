export default function NvDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Dashboard Nguồn Vốn</h1>
      <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Chào mừng bạn đến với không gian làm việc của phòng Nguồn Vốn.</p>
        <p style={{ marginTop: 'var(--space-4)', color: 'var(--text-secondary)' }}>
          Tại đây bạn có thể quản lý hợp đồng, dòng tiền, và các báo cáo tài chính liên quan đến huy động vốn.
        </p>
      </div>
    </div>
  );
}
