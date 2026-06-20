import React, { useState } from 'react';
import { LayoutDashboard, Lock, LogOut, Menu, X, ChevronRight } from 'lucide-react';

export const DashboardStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }

    :root {
      --bg-base: #FFFFFF;
      --bg-surface: #F5F5F5;
      --bg-sidebar: #000000;
      --text-primary: #000000;
      --text-secondary: rgba(0, 0, 0, 0.5);
      --text-muted: rgba(0, 0, 0, 0.3);
      --border: rgba(0, 0, 0, 0.08);
      --border-dark: rgba(0, 0, 0, 0.12);
      --accent: #000000;
    }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.3); }

    /* Layout */
    .dashboard-layout { display: flex; height: 100vh; background: var(--bg-base); }
    .dashboard-sidebar {
      width: 260px; background: var(--bg-sidebar); color: #fff; padding: 24px 0;
      display: flex; flex-direction: column; gap: 32px;
      overflow-y: auto; flex-shrink: 0;
      border-right: 1px solid rgba(0, 0, 0, 0.1);
    }
    .sidebar-brand { padding: 0 24px; display: flex; align-items: center; gap: 12px; }
    .brand-icon {
      width: 40px; height: 40px; background: #fff; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 16px; color: #000;
    }
    .brand-text { display: flex; flex-direction: column; }
    .brand-name { font-size: 14px; font-weight: 600; color: #fff; }
    .brand-sub { font-size: 11px; color: rgba(255, 255, 255, 0.5); }

    .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 0 12px; }
    .nav-item {
      padding: 12px 16px; border-radius: 8px; cursor: pointer;
      font-size: 13px; font-weight: 500; color: rgba(255, 255, 255, 0.6);
      transition: all 200ms ease; border: none; background: none;
      display: flex; align-items: center; gap: 10px; width: 100%;
      text-align: left;
    }
    .nav-item:hover { background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.8); }
    .nav-item.active {
      background: #fff; color: #000;
    }
    .nav-icon { width: 18px; height: 18px; }

    .sidebar-footer { padding: 0 12px; display: flex; flex-direction: column; gap: 8px; }
    .logout-btn {
      padding: 10px 16px; border-radius: 8px; background: rgba(255, 0, 0, 0.1);
      color: #ff4444; font-size: 13px; font-weight: 500; cursor: pointer;
      border: 1px solid rgba(255, 0, 0, 0.2); transition: all 200ms ease;
    }
    .logout-btn:hover { background: rgba(255, 0, 0, 0.15); }

    /* Main content */
    .dashboard-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .dashboard-topbar {
      height: 70px; border-bottom: 1px solid var(--border-dark);
      padding: 0 32px; display: flex; align-items: center; justify-content: space-between;
      background: var(--bg-base);
      flex-shrink: 0;
    }
    .topbar-left { display: flex; align-items: center; gap: 12px; }
    .topbar-title { font-size: 18px; font-weight: 600; color: var(--text-primary); }
    .topbar-right { display: flex; align-items: center; gap: 20px; }
    .user-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, #000, #333);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 600; color: #fff; cursor: pointer;
    }

    .dashboard-content { flex: 1; overflow-y: auto; padding: 32px; }
    .content-container { max-width: 1400px; margin: 0 auto; }

    /* KPI Grid */
    .kpi-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;
      margin-bottom: 32px;
    }
    .kpi-card {
      background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: 12px; padding: 20px; transition: all 200ms ease;
    }
    .kpi-card:hover { border-color: var(--border-dark); background: #f9f9f9; }
    .kpi-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; }
    .kpi-value { font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
    .kpi-sub { font-size: 11px; color: var(--text-muted); }

    /* Cards */
    .card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
    .card-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
    }
    .card-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }

    /* Table */
    .table-wrapper { overflow-x: auto; }
    .table {
      width: 100%; border-collapse: collapse; font-size: 13px;
    }
    .table thead th {
      padding: 12px 16px; text-align: left; background: #f0f0f0;
      font-weight: 600; color: var(--text-secondary); border-bottom: 1px solid var(--border);
      font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .table tbody tr { border-bottom: 1px solid var(--border); transition: background 200ms ease; }
    .table tbody tr:hover { background: #fafafa; }
    .table td { padding: 14px 16px; color: var(--text-primary); }
    .table .badge {
      display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500;
    }
    .badge-success { background: #e8f5e9; color: #2e7d32; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-active { background: #e3f2fd; color: #1565c0; }

    /* Forms */
    .form-group { margin-bottom: 16px; }
    .form-label { font-size: 12px; font-weight: 600; color: var(--text-primary); display: block; margin-bottom: 6px; }
    .form-input, .form-select {
      width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px;
      font-family: 'Inter', sans-serif; font-size: 13px; color: var(--text-primary);
      background: #fff; transition: all 200ms ease;
    }
    .form-input:focus, .form-select:focus { outline: none; border-color: var(--accent); background: #fafafa; }
    .form-input::placeholder { color: var(--text-muted); }

    .btn {
      padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;
      border: none; cursor: pointer; transition: all 200ms ease; font-family: 'Inter', sans-serif;
    }
    .btn-primary { background: #000; color: #fff; }
    .btn-primary:hover { background: #222; }
    .btn-secondary { background: var(--bg-surface); color: var(--text-primary); border: 1px solid var(--border); }
    .btn-secondary:hover { background: #efefef; }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-layout { flex-direction: column; }
      .dashboard-sidebar {
        width: 100%; height: auto; flex-direction: row; padding: 12px;
        overflow-x: auto; border-right: none; border-bottom: 1px solid var(--border);
      }
      .sidebar-nav { flex-direction: row; gap: 0; }
      .sidebar-footer { display: none; }
      .sidebar-brand { padding: 0 12px; }
      .nav-item { padding: 8px 12px; font-size: 12px; white-space: nowrap; }
      .dashboard-topbar { height: 56px; padding: 0 16px; }
      .topbar-title { font-size: 16px; }
      .dashboard-content { padding: 16px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
      .kpi-card { padding: 14px; }
      .kpi-label { font-size: 11px; }
      .kpi-value { font-size: 22px; }
      .card { padding: 16px; }
      .card-header { flex-direction: column; align-items: flex-start; gap: 12px; }
      .card-title { font-size: 14px; }
      .table { font-size: 12px; }
      .table thead th { padding: 8px 12px; font-size: 10px; }
      .table td { padding: 10px 12px; }
      .btn { padding: 8px 14px; font-size: 12px; }
      .topbar-right { gap: 12px; }
      .user-avatar { width: 36px; height: 36px; font-size: 12px; }
    }

    @media (max-width: 480px) {
      .dashboard-sidebar { gap: 8px; padding: 8px; }
      .sidebar-brand { display: none; }
      .dashboard-topbar { height: 50px; padding: 0 12px; }
      .topbar-title { font-size: 14px; }
      .topbar-left { gap: 8px; }
      .dashboard-content { padding: 12px; }
      .kpi-grid { grid-template-columns: 1fr; gap: 8px; margin-bottom: 12px; }
      .kpi-card { padding: 12px; }
      .kpi-label { font-size: 10px; }
      .kpi-value { font-size: 20px; }
      .card { padding: 12px; border-radius: 8px; }
      .card-title { font-size: 13px; }
      .table { font-size: 11px; }
      .table thead th { padding: 6px 8px; font-size: 9px; }
      .table td { padding: 8px 10px; }
      .btn { padding: 8px 12px; font-size: 11px; }
      .user-avatar { width: 32px; height: 32px; font-size: 11px; }
    }
  `}</style>
);

interface DashboardNewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

export const DashboardNew: React.FC<DashboardNewProps> = ({
  activeTab,
  onTabChange,
  user,
  onLogout,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'home', label: 'Home', icon: <LayoutDashboard size={18} /> },
    { id: 'escrows', label: 'Escrows', icon: <LayoutDashboard size={18} /> },
    { id: 'credit-score', label: 'Credit Score', icon: <LayoutDashboard size={18} /> },
    { id: 'borrowing', label: 'Borrowing', icon: <LayoutDashboard size={18} /> },
    { id: 'transactions', label: 'Transactions', icon: <LayoutDashboard size={18} /> },
    { id: 'settings', label: 'Settings', icon: <LayoutDashboard size={18} /> },
  ];

  return (
    <>
      <DashboardStyles />
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className={`dashboard-sidebar${sidebarOpen ? '' : ''}`} style={{ display: sidebarOpen ? 'flex' : 'flex' }}>
          <div className="sidebar-brand">
            <div className="brand-icon">N</div>
            <div className="brand-text">
              <div className="brand-name">Nullfi</div>
              <div className="brand-sub">Finance Platform</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-item${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => {
                  onTabChange(tab.id);
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={16} style={{ display: 'inline', marginRight: 6 }} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main */}
        <div className="dashboard-main">
          {/* Topbar */}
          <div className="dashboard-topbar">
            <div className="topbar-left">
              <span className="topbar-title">
                {tabs.find((t) => t.id === activeTab)?.label || 'Dashboard'}
              </span>
            </div>
            <div className="topbar-right">
              <div className="user-avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
            </div>
          </div>

          {/* Content */}
          <div className="dashboard-content">
            <div className="content-container">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};
