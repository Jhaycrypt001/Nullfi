import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, LogOut, MoreHorizontal, ChevronRight } from 'lucide-react';
import { api } from '@/services/api';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0D0D0F; font-family: 'Inter', sans-serif; color: #fff; }

    :root {
      --bg-base: #0D0D0F;
      --bg-sidebar: #111114;
      --bg-surface: #161618;
      --bg-elevated: #1E1E21;
      --border: rgba(255,255,255,0.06);
      --border-strong: rgba(255,255,255,0.12);
      --text-primary: #FFFFFF;
      --text-secondary: rgba(255,255,255,0.4);
      --text-muted: rgba(255,255,255,0.2);
      --accent: #00D9FF;
    }

    ::-webkit-scrollbar { display: none; }
    * { scrollbar-width: none; }

    .layout { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

    /* TOPBAR */
    .topbar {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; gap: 16px;
      height: 56px; padding: 0 20px;
      background: var(--bg-sidebar);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .topbar-brand { display: flex; align-items: center; gap: 10px; width: 160px; flex-shrink: 0; }
    .brand-icon {
      width: 32px; height: 32px; border-radius: 8px;
      background: var(--accent); display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px; color: #0D0D0F; flex-shrink: 0;
    }
    .brand-name { font-size: 15px; font-weight: 500; color: #fff; }
    .topbar-right { display: flex; align-items: center; gap: 12px; margin-left: auto; }
    .avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg, #444, #666);
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 600; color: #fff; cursor: pointer;
      overflow: hidden; flex-shrink: 0;
    }

    /* BODY */
    .body-wrap { display: flex; flex: 1; overflow: hidden; }

    /* SIDEBAR */
    .sidebar {
      width: 200px; flex-shrink: 0;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      overflow-y: auto; padding: 20px 0;
      display: flex; flex-direction: column; gap: 24px;
    }
    .nav-section { display: flex; flex-direction: column; gap: 2px; }
    .nav-section-label {
      font-size: 10px; font-weight: 500;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: rgba(255,255,255,0.25);
      padding: 0 16px; margin-bottom: 6px;
    }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 16px; cursor: pointer; border-radius: 8px;
      margin: 0 8px; transition: background 120ms ease;
      position: relative; border: none; background: none; width: calc(100% - 16px);
      text-align: left; font-size: 13px; color: rgba(255,255,255,0.4);
    }
    .nav-item:hover { background: var(--bg-elevated); }
    .nav-item.active {
      background: rgba(0,217,255,0.12);
      margin-left: 0; padding-left: 24px;
      border-radius: 0 8px 8px 0;
      width: calc(100% - 8px);
      border-left: 3px solid var(--accent);
      color: #fff;
    }

    /* MAIN */
    .main { flex: 1; overflow-y: auto; background: var(--bg-base); padding: 24px 28px; }

    /* KPI CARDS */
    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;
    }
    .kpi-card {
      background: var(--bg-surface);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px; padding: 18px 20px;
    }
    .kpi-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; }
    .kpi-value { font-size: 28px; font-weight: 700; color: #fff; }
    .kpi-sub { font-size: 11px; color: var(--text-secondary); margin-top: 6px; }

    /* CHARTS ROW */
    .charts-row { display: flex; gap: 14px; margin-bottom: 28px; }
    .chart-panel {
      background: var(--bg-surface);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px; padding: 20px;
    }
    .chart-panel-main { flex: 0 0 65%; }
    .chart-panel-side { flex: 1; }
    .chart-title { font-size: 14px; font-weight: 500; color: #fff; margin-bottom: 16px; }

    /* TABLE */
    .table-header-row {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
    }
    .table-title { font-size: 16px; font-weight: 600; color: #fff; }
    .txn-table { width: 100%; border-collapse: collapse; }
    .txn-table thead tr { border-bottom: 1px solid rgba(255,255,255,0.06); }
    .txn-table thead th {
      padding: 10px 12px; text-align: left;
      font-size: 11px; font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--text-secondary);
    }
    .txn-table tbody tr {
      border-top: 1px solid rgba(255,255,255,0.04);
      transition: background 120ms ease; cursor: pointer;
    }
    .txn-table tbody tr:hover { background: var(--bg-elevated); }
    .txn-table td { padding: 0 12px; height: 56px; font-size: 13px; color: #fff; }
    .badge {
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 20px; padding: 3px 10px;
      font-size: 12px; font-weight: 500; white-space: nowrap;
    }
    .badge-success { background: rgba(0,196,140,0.12); color: #00C48C; }
    .badge-pending { background: rgba(245,166,35,0.12); color: #F5A623; }

    /* Responsive */
    @media (max-width: 768px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { flex-direction: column; }
      .chart-panel-main, .chart-panel-side { flex: 1; }
      .sidebar { width: 150px; padding: 12px 0; }
      .main { padding: 12px 16px; }
      .topbar { height: 48px; padding: 0 12px; }
    }

    @media (max-width: 480px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .sidebar { width: 120px; }
      .nav-item { font-size: 11px; padding: 6px 12px; }
      .topbar { height: 44px; }
      .main { padding: 8px 12px; }
      .txn-table td { padding: 0 6px; height: 48px; font-size: 11px; }
      .txn-table thead th { font-size: 9px; }
    }
  `}</style>
);

interface DashboardPremiumProps {
  user: any;
  onLogout: () => void;
}

export const DashboardPremium: React.FC<DashboardPremiumProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [escrows, setEscrows] = useState<any[]>([]);
  const [creditScore, setCreditScore] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'escrows', label: 'Escrows' },
    { id: 'credit', label: 'Credit Score' },
    { id: 'borrowing', label: 'Borrowing' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'settings', label: 'Settings' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch data from APIs
      const [escrrows, credit, transact] = await Promise.all([
        api.getEscrows(user?.walletAddress),
        api.getCreditScore(user?.walletAddress),
        api.getTransactions(user?.walletAddress),
      ]).catch(() => [[], {}, []]);

      setEscrows(escrrows || []);
      setCreditScore(credit || {});
      setTransactions(transact || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="layout">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-brand">
            <div className="brand-icon">N</div>
            <span className="brand-name">Nullfi</span>
          </div>
          <div className="topbar-right">
            <div className="avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
          </div>
        </header>

        <div className="body-wrap">
          {/* SIDEBAR */}
          <nav className="sidebar">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item${activeTab === item.id ? ' active' : ''}`}
              >
                {item.label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={onLogout} className="nav-item" style={{ margin: '8px 8px 0' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </nav>

          {/* MAIN */}
          <main className="main">
            {/* HOME TAB */}
            {activeTab === 'home' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: 600, marginBottom: '8px' }}>
                    Good Morning, {user?.username || 'User'}
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Here's your financial overview
                  </p>
                </div>

                {/* KPI CARDS */}
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-label">💰 Credit Score</div>
                    <div className="kpi-value">{creditScore?.rating || '—'}</div>
                    <div className="kpi-sub">/100 rating</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">🏆 Account Tier</div>
                    <div className="kpi-value">{creditScore?.tier?.replace('TIER_', '') || '—'}</div>
                    <div className="kpi-sub">Your tier level</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">📦 Active Escrows</div>
                    <div className="kpi-value">{escrows.filter(e => e.status === 'ACTIVE').length}</div>
                    <div className="kpi-sub">Ongoing transactions</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">💎 Total Earned</div>
                    <div className="kpi-value">${(escrows.reduce((sum, e) => sum + (e.releasedAmount || 0), 0) / 1e9).toFixed(2)}</div>
                    <div className="kpi-sub">SUI earned</div>
                  </div>
                </div>
              </div>
            )}

            {/* ESCROWS TAB */}
            {activeTab === 'escrows' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: 600, marginBottom: '8px' }}>Escrows</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>Manage your secure transactions</p>
                </div>

                {/* Stats */}
                <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                  <div className="kpi-card">
                    <div className="kpi-label">📦 Total Escrows</div>
                    <div className="kpi-value">{escrows.length}</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">✅ Active</div>
                    <div className="kpi-value">{escrows.filter(e => e.status === 'ACTIVE').length}</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">🎉 Completed</div>
                    <div className="kpi-value">{escrows.filter(e => e.status === 'COMPLETED').length}</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">💵 Total Value</div>
                    <div className="kpi-value">${(escrows.reduce((sum, e) => sum + (e.totalAmount || 0), 0) / 1e9).toFixed(2)}</div>
                  </div>
                </div>

                {/* Escrows List */}
                {escrows.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {escrows.map((e) => (
                      <div key={e.id} style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '18px', cursor: 'pointer' }}>
                        <h3 style={{ color: '#fff', marginBottom: '8px', fontSize: '16px', fontWeight: 600 }}>{e.jobTitle}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px' }}>{e.jobDescription || 'No description'}</p>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '12px', marginTop: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Amount</span>
                            <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>${(e.totalAmount / 1e9).toFixed(2)} SUI</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status</span>
                            <span style={{ fontSize: '12px', color: 'var(--accent)' }}>{e.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <p>No escrows yet. Create one to get started!</p>
                  </div>
                )}
              </div>
            )}

            {/* CREDIT SCORE TAB */}
            {activeTab === 'credit' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: 600, marginBottom: '8px' }}>Credit Score</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>Your financial reputation on Nullfi</p>
                </div>

                <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                  <div className="kpi-card">
                    <div className="kpi-label">⭐ Credit Score</div>
                    <div className="kpi-value">{creditScore?.rating || 50}</div>
                    <div className="kpi-sub">/100</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">🏆 Account Tier</div>
                    <div className="kpi-value">{creditScore?.tier?.replace('TIER_', '') || '4'}</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">✅ Completed</div>
                    <div className="kpi-value">{creditScore?.totalCompleted || 0}</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">🎯 On-Time</div>
                    <div className="kpi-value">{creditScore?.onTimeReleases || 0}</div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ color: '#fff', marginBottom: '16px' }}>Reputation Stats</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '6px' }}>Total Earned</p>
                      <p style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>${(creditScore?.totalEarned / 1e9 || 0).toFixed(2)} SUI</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '6px' }}>Dispute Rate</p>
                      <p style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>{creditScore?.disputeCount || 0} disputes</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BORROWING TAB */}
            {activeTab === 'borrowing' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: 600, marginBottom: '8px' }}>Borrowing</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>Manage your loans and available credit</p>
                </div>

                <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                  <div className="kpi-card">
                    <div className="kpi-label">💰 Available Limit</div>
                    <div className="kpi-value">${(5000 - (creditScore?.rating || 50) * 10).toLocaleString()}</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">📊 Current Debt</div>
                    <div className="kpi-value">${(loans.reduce((sum, l) => sum + (l.amount || 0), 0) / 1e9).toFixed(2)}</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">📈 Interest Rate</div>
                    <div className="kpi-value">{(5 + (100 - (creditScore?.rating || 50)) / 10).toFixed(1)}%</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">🔄 Active Loans</div>
                    <div className="kpi-value">{loans.filter(l => l.status === 'ACTIVE').length}</div>
                  </div>
                </div>

                {loans.length > 0 ? (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {loans.map((l) => (
                      <div key={l.id} style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ color: '#fff', fontWeight: 600 }}>${(l.amount / 1e9).toFixed(2)} SUI</p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Due: {new Date(l.dueDate).toLocaleDateString()}</p>
                        </div>
                        <span className="badge badge-pending">{l.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-surface)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                    <p>No active loans</p>
                  </div>
                )}
              </div>
            )}

            {/* TRANSACTIONS TAB */}
            {activeTab === 'transactions' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: 600, marginBottom: '8px' }}>Transactions</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>Your transaction history</p>
                </div>

                {transactions.length > 0 ? (
                  <div style={{ background: 'var(--bg-surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <table className="txn-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 20).map((t) => (
                          <tr key={t.id}>
                            <td>{t.type}</td>
                            <td>${(t.amount / 1e9).toFixed(2)}</td>
                            <td>
                              <span className="badge badge-success">{t.status}</span>
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                              {new Date(t.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-surface)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                    <p>No transactions yet</p>
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: 600, marginBottom: '8px' }}>Settings</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>Manage your account preferences</p>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}>Two-Factor Authentication</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Add extra security to your account</p>
                      </div>
                      <div style={{ width: '48px', height: '28px', background: 'rgba(0,217,255,0.12)', borderRadius: '20px', border: '1px solid rgba(0,217,255,0.3)' }}></div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}>Email Notifications</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Receive updates via email</p>
                      </div>
                      <div style={{ width: '48px', height: '28px', background: '#4b5563', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}></div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}>Public Profile</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Allow others to view your profile</p>
                      </div>
                      <div style={{ width: '48px', height: '28px', background: '#4b5563', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};
