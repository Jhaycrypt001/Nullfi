import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { WalletProvider, useWallet } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from '@/pages/Landing';
import DocsPage from '@/pages/Docs';
import { PublicProfile } from '@/pages/PublicProfile';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { api } from './services/api';
import ContractExecutor from './services/contractExecutor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { TwoFAModal } from '@/components/TwoFAModal';
import { DashboardNew } from '@/components/DashboardNew';
import { DashboardPremium } from '@/components/DashboardPremium';
import { LeadsTable, type Lead } from '@/components/ui/leads-data-table';
import { GlowCard } from '@/components/ui/spotlight-card';

// Global Dashboard Styles
const DashboardStyles = () => (
  <style>{`
    :root {
      --bg-base: #000000;
      --bg-surface: #111111;
      --bg-sidebar: #000000;
      --text-primary: #FFFFFF;
      --text-secondary: rgba(255, 255, 255, 0.6);
      --text-muted: rgba(255, 255, 255, 0.4);
      --border: rgba(255, 255, 255, 0.08);
      --border-dark: rgba(255, 255, 255, 0.12);
    }

    /* Updated colors for tabs */
    .dashboard-sidebar { background: var(--bg-sidebar); border-color: var(--border); }
    .dashboard-sidebar .nav-item { color: rgba(255, 255, 255, 0.6); }
    .dashboard-sidebar .nav-item.active { background: #fff; color: #000; }

    /* Cards */
    .card-modern { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
    .card-modern:hover { border-color: var(--border-dark); background: #f9f9f9; }

    /* KPI Style */
    .kpi-modern { background: var(--bg-surface); border: 1px solid var(--border); padding: 20px; border-radius: 12px; }
    .kpi-modern .label { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; }
    .kpi-modern .value { font-size: 28px; font-weight: 700; color: var(--text-primary); }
    .kpi-modern .sub { font-size: 11px; color: var(--text-muted); margin-top: 6px; }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-sidebar { flex-direction: row; height: auto; width: 100%; }
      .dashboard-main { margin-left: 0; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }

    @media (max-width: 480px) {
      .kpi-grid { grid-template-columns: 1fr !important; }
      .kpi-modern .value { font-size: 20px; }
      .card-modern { padding: 12px; }
    }
  `}</style>
);


// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Dashboard Page with Sidebar
const Dashboard: React.FC = () => {
  const { user, creditScore, logout } = useAuth();
  const navigate = useNavigate();
  const wallet = useWallet();

  const handleGoBack = () => {
    logout();
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const [activeTab, setActiveTab] = useState('home');
  const [showProfile, setShowProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [isSigningTransaction, setIsSigningTransaction] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Escrow state - initialize as empty, fetch from API
  const [escrows, setEscrows] = useState<any[]>([]);
  const [escrowsLoading, setEscrowsLoading] = useState(true);
  const [escrowsError, setEscrowsError] = useState<string | null>(null);
  const [showCreateEscrow, setShowCreateEscrow] = useState(false);
  const [showEscrowDetail, setShowEscrowDetail] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState<any>(null);
  const [createEscrowForm, setCreateEscrowForm] = useState({
    jobTitle: '',
    category: 'web-development',
    freelancerAddress: '',
    totalAmount: '',
    milestoneCount: '1',
  });
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Borrowing state - initialize as empty, fetch from API
  const [loans, setLoans] = useState<any[]>([]);
  const [loansLoading, setLoansLoading] = useState(true);
  const [loanTermSearch, setLoanTermSearch] = useState('');
  const [showLoanTermDropdown, setShowLoanTermDropdown] = useState(false);

  const loanTerms = ['12', '24', '36', '48', '60'];
  const filteredLoanTerms = loanTerms.filter(term => term.includes(loanTermSearch));

  // Loan application form state
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanForm, setLoanForm] = useState({
    amount: '',
    duration: '12',
  });

  // Settings state - will be fetched from database
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAData, setTwoFAData] = useState<{ qrCode: string; secret: string; backupCodes: string[] } | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [emailLoading, setEmailLoading] = useState(false);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);
  const [publicLoading, setPublicLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyRegenerating, setApiKeyRegenerating] = useState(false);

  // Transactions state - initialize as empty, fetch from API
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(20);

  const allCategories = [
    'Web Development',
    'Mobile App Development',
    'UI/UX Design',
    'Graphic Design',
    'Video Editing',
    'Content Writing',
    'Copywriting',
    'SEO Services',
    'Social Media Management',
    'Digital Marketing',
    'Photography',
    'Music Production',
    'Voice Over',
    'Translation',
    'Data Entry',
    'Virtual Assistant',
    'Consulting',
    'Illustration',
    'Animation',
    'Blockchain Development',
    'AI/Machine Learning',
    'Cloud Architecture',
    'DevOps',
    'Database Design',
  ];

  const filteredCategories = allCategories.filter(cat =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Fetch escrows on component mount
  // Fetch wallet balance from Sui blockchain
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!user || !user.walletAddress) return;

      try {
        setBalanceLoading(true);
        const { SuiClient, getFullnodeUrl } = await import('@mysten/sui.js/client');
        const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

        const coins = await suiClient.getCoins({
          owner: user.walletAddress,
          coinType: '0x2::sui::SUI',
        });

        const totalBalance = coins.data.reduce((sum, coin) => {
          return sum + BigInt(coin.balance);
        }, BigInt(0));

        // Convert from MIST to SUI (1 SUI = 1,000,000,000 MIST)
        const suiBalance = Number(totalBalance) / 1_000_000_000;
        setWalletBalance(suiBalance);
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
        setWalletBalance(0);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchWalletBalance();
  }, [user?.walletAddress]);

  useEffect(() => {
    const fetchEscrows = async () => {
      if (!user || !user.walletAddress) return;

      try {
        setEscrowsLoading(true);
        setEscrowsError(null);
        const response = await api.getEscrows(user.walletAddress);

        // Handle both array and object response formats
        const escrowsData = Array.isArray(response) ? response : response.escrows || [];
        setEscrows(escrowsData);
      } catch (error) {
        console.error('Failed to fetch escrows:', error);
        setEscrowsError(error instanceof Error ? error.message : 'Failed to load escrows');
        setEscrows([]);
      } finally {
        setEscrowsLoading(false);
      }
    };

    fetchEscrows();
  }, [user]);

  // Fetch loans on component mount
  useEffect(() => {
    const fetchLoans = async () => {
      if (!user || !user.walletAddress) return;

      try {
        setLoansLoading(true);
        const response = await api.getBorrows(user.walletAddress);

        // Handle both array and object response formats
        const loansData = Array.isArray(response) ? response : response.borrows || [];
        setLoans(loansData);
      } catch (error) {
        console.error('Failed to fetch loans:', error);
        setLoans([]);
      }
    };

    fetchLoans();
  }, [user]);

  // Fetch transactions on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        setTransactionsLoading(true);
        const response = await api.getTransactions();

        // Handle both array and object response formats
        const txnsData = Array.isArray(response) ? response : response.transactions || [];
        setTransactions(txnsData);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  // Fetch user settings and API key on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      try {
        // Fetch user settings
        const settingsResponse = await api.getUserSettings(user.walletAddress);
        if (settingsResponse.settings) {
          setEmailNotifications(settingsResponse.settings.emailNotifications ?? true);
          setTransactionAlerts(settingsResponse.settings.transactionAlerts ?? true);
          setPublicProfile(settingsResponse.settings.publicProfile ?? false);
          setTwoFactorEnabled(settingsResponse.settings.twoFactorEnabled ?? false);
        }

        // Fetch API key
        try {
          const keyResponse = await api.getApiKey(user.walletAddress);
          setApiKey(keyResponse.apiKey || keyResponse.key);
        } catch (error) {
          console.log('Failed to fetch API key:', error);
          setApiKey(null);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setApiKeyLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  // Pagination calculations for transactions
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const currentTransactions = transactions.slice(startIndex, startIndex + transactionsPerPage);

  // Generate Professional PDF
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      // Header
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      doc.text('NULLFI', 20, yPosition);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Transaction Statement', 20, yPosition + 10);

      // Divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPosition + 15, pageWidth - 20, yPosition + 15);

      yPosition += 25;

      // Account Info
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text('Account Information', 20, yPosition);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      yPosition += 6;
      doc.text(`Wallet Address: ${user?.walletAddress || 'N/A'}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Statement Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Statement Period: All Transactions`, 20, yPosition);

      yPosition += 12;

      // Summary Stats
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text('Summary', 20, yPosition);

      const summaryData = [
        ['Total Transactions', transactions.length.toString()],
        ['Completed', transactions.filter(t => t.status === 'completed').length.toString()],
        ['Pending', transactions.filter(t => t.status === 'pending').length.toString()],
        ['Failed', transactions.filter(t => t.status === 'failed').length.toString()],
      ];

      doc.setFontSize(9);
      yPosition += 6;
      summaryData.forEach((item) => {
        doc.setTextColor(100, 100, 100);
        doc.text(item[0], 20, yPosition);
        doc.setTextColor(0, 0, 0);
        doc.text(item[1], 100, yPosition);
        yPosition += 5;
      });

      yPosition += 8;

      // Transactions Table
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text('Transactions', 20, yPosition);

      yPosition += 8;

      // Table headers
      const tableData = transactions.map(txn => [
        txn.id,
        new Date(txn.date || txn.createdAt).toLocaleDateString(),
        txn.type,
        `$${(txn.amount || 0).toLocaleString()}`,
        (txn.status || '').charAt(0).toUpperCase() + (txn.status || '').slice(1),
      ]);

      autoTable(doc, {
        head: [['Transaction ID', 'Date', 'Type', 'Amount', 'Status']],
        body: tableData,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: [50, 50, 50],
          lineColor: [220, 220, 220],
        },
        headStyles: {
          fillColor: [40, 40, 40],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
      });

      // Footer
      const finalYPosition = (doc as any).lastAutoTable.finalY + 15;
      doc.setDrawColor(200, 200, 200);
      doc.line(20, finalYPosition, pageWidth - 20, finalYPosition);

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Generated on ${new Date().toLocaleString()} | This is an official transaction statement from Nullfi`,
        20,
        finalYPosition + 8
      );

      // Save PDF
      doc.save(`nullfi_statement_${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('Professional statement downloaded!', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast('Error generating PDF. Please try again.', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateName = () => {
    if (!displayName.trim()) {
      showToast('Display name cannot be empty', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('Display name updated successfully!');
    }, 500);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you absolutely sure? This will permanently delete your account and all data.\n\nThis action CANNOT be undone.'
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await api.deleteAccount(user?.walletAddress || '', 'DELETE_ACCOUNT');
      showToast('Account deleted successfully');
      logout();
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Failed to delete account:', error);
      showToast('Failed to delete account', 'error');
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be less than 5MB', 'error');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImagePreview(event.target?.result as string);
        setSelectedFileName(file.name);
        showToast('Image selected! Click update to save.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfileImage = () => {
    if (!profileImagePreview) {
      showToast('Please select an image first', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('Profile picture updated successfully!');
      setProfileImage(selectedFileName);
    }, 500);
  };

  // Escrow handlers
  // Validate Sui wallet address format
  const isValidSuiAddress = (address: string): boolean => {
    const suiAddressRegex = /^0x[a-fA-F0-9]{64}$/;
    return suiAddressRegex.test(address);
  };

  const handleCreateEscrow = async () => {
    if (!user || !user.walletAddress) {
      showToast('Please sign in with your Sui wallet first', 'error');
      return;
    }
    if (!createEscrowForm.jobTitle || !createEscrowForm.freelancerAddress || !createEscrowForm.totalAmount) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    if (!isValidSuiAddress(createEscrowForm.freelancerAddress)) {
      showToast('Invalid Sui wallet address. Must be 64 hex characters starting with 0x', 'error');
      return;
    }
    if (parseFloat(createEscrowForm.totalAmount) <= 0) {
      showToast('Amount must be greater than 0', 'error');
      return;
    }

    // Check if user has enough balance
    const amount = parseFloat(createEscrowForm.totalAmount);
    if (!walletBalance || walletBalance < amount) {
      showToast(`Insufficient balance! You have ${walletBalance?.toFixed(2) || 0} SUI, need ${amount} SUI`, 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await ContractExecutor.createEscrow(
        user.walletAddress,
        createEscrowForm.freelancerAddress,
        createEscrowForm.jobTitle,
        '',
        createEscrowForm.category,
        parseFloat(createEscrowForm.totalAmount),
        parseInt(createEscrowForm.milestoneCount)
      );

      if (!result.success) {
        showToast(`❌ ${result.message}`, 'error');
        return;
      }

      if (result.data) {
        setEscrows([result.data, ...escrows]);
      }

      setCreateEscrowForm({
        jobTitle: '',
        category: 'development',
        freelancerAddress: '',
        totalAmount: '',
        milestoneCount: '1',
      });
      setShowCreateEscrow(false);
      showToast(`✅ Escrow created in database!\n🔔 Click "Sign & Execute" in escrow details to finalize on blockchain`);
    } catch (error) {
      console.error('Failed to create escrow:', error);
      showToast(error instanceof Error ? error.message : 'Failed to create escrow', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReleaseMilestone = async () => {
    if (!selectedEscrow) return;
    if (!user || !user.walletAddress) {
      showToast('Please sign in with your Sui wallet first', 'error');
      return;
    }

    if (selectedEscrow.completedMilestones >= selectedEscrow.milestones) {
      showToast('All milestones already released', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const nextMilestoneNum = (selectedEscrow.completedMilestones || 0) + 1;

      const result = await ContractExecutor.releaseMilestone(
        selectedEscrow.id,
        nextMilestoneNum,
        user.walletAddress
      );

      if (!result.success) {
        showToast(`❌ ${result.message}`, 'error');
        return;
      }

      if (result.data) {
        setSelectedEscrow(result.data);
        setEscrows(escrows.map(e => e.id === result.data.id ? result.data : e));
      }

      showToast(`✅ ${result.message}\nTX: ${result.transactionDigest?.slice(0, 10)}...`);
    } catch (error) {
      console.error('Failed to release milestone:', error);
      showToast(error instanceof Error ? error.message : 'Failed to release milestone', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle borrow SUI - REAL BLOCKCHAIN
  const handleBorrowSUI = async () => {
    if (!user || !user.walletAddress) {
      showToast('Please sign in with your Sui wallet first', 'error');
      return;
    }
    if (!loanForm.amount || parseFloat(loanForm.amount) <= 0) {
      showToast('Please enter valid loan amount', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await ContractExecutor.borrowSUI(
        user.walletAddress,
        parseFloat(loanForm.amount),
        parseInt(loanForm.duration)
      );

      if (!result.success) {
        showToast(`❌ ${result.message}`, 'error');
        return;
      }

      if (result.data) {
        setLoans([result.data, ...loans]);
      }

      setLoanForm({ amount: '', duration: '12' });
      setShowLoanForm(false);
      showToast(`✅ ${result.message}\nTX: ${result.transactionDigest?.slice(0, 10)}...`);
    } catch (error) {
      console.error('Error borrowing:', error);
      showToast(error instanceof Error ? error.message : 'Failed to borrow', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle repay loan - REAL BLOCKCHAIN
  // Handle Sign & Execute - Escrow already saved in database
  const handleSignAndExecuteEscrow = async () => {
    if (!selectedEscrow || !user?.walletAddress) {
      showToast('❌ Missing escrow or wallet', 'error');
      return;
    }

    // Get freelancer address FIRST (before wallet popup)
    const freelancerAddress = prompt('Enter freelancer Sui wallet address (0x...)');
    if (!freelancerAddress) {
      showToast('⏸️ Cancelled', 'error');
      return;
    }

    setIsSigningTransaction(true);
    try {
      const totalAmountMist = selectedEscrow.totalAmount || 0;
      const amountPerMilestone = Math.floor(totalAmountMist / (selectedEscrow.milestoneCount || 1));
      const amountSUI = (amountPerMilestone / 1_000_000_000).toFixed(2);

      // Now trigger wallet popup to sign the ACTUAL BLOCKCHAIN TRANSACTION
      showToast('🔐 Opening wallet to sign & execute transaction...');

      // Execute escrow transaction on Sui blockchain
      const result = await ContractExecutor.executeEscrow(
        selectedEscrow.id,
        user.walletAddress,
        freelancerAddress,
        totalAmountMist
      );

      if (result.success) {
        showToast(`✅ TRANSACTION COMPLETE!\n💎 ${amountSUI} SUI transferred to escrow\n🔗 Tx: ${result.transactionId?.slice(0, 10)}...`);
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to execute transaction', 'error');
    } finally {
      setIsSigningTransaction(false);
    }
  };

  const handleRepayLoan = async (loanId: string, loanAmount: number) => {
    if (!user || !user.walletAddress) {
      showToast('Please sign in with your Sui wallet first', 'error');
      return;
    }
    const repayAmount = prompt(`Repay amount (max ${loanAmount}):`, loanAmount.toString());
    if (!repayAmount || parseFloat(repayAmount) <= 0) return;

    setIsLoading(true);
    try {
      const result = await ContractExecutor.repayLoan(
        loanId,
        user.walletAddress,
        parseFloat(repayAmount)
      );

      if (!result.success) {
        showToast(`❌ ${result.message}`, 'error');
        return;
      }

      if (result.data) {
        setLoans(loans.map(l => l.id === result.data.id ? result.data : l));
      }

      showToast(`✅ ${result.message}\nTX: ${result.transactionDigest?.slice(0, 10)}...`);
    } catch (error) {
      console.error('Error repaying:', error);
      showToast(error instanceof Error ? error.message : 'Failed to repay', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'escrows', label: 'Escrows' },
    { id: 'credit', label: 'Credit Score' },
    { id: 'borrowing', label: 'Borrowing' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      {/* Sidebar - Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative w-64 p-6 flex flex-col h-screen border-r border-gray-900 bg-black z-40 transition-transform md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/nullfi-logo.svg" alt="Nullfi" className="w-6 h-6" />
            <span className="text-lg font-bold">Nullfi</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full px-4 py-2.5 rounded-lg transition text-left text-sm font-500 ${
                activeTab === item.id
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-3 pt-6 border-t border-white/20">
          <div className="px-4 py-3">
            <p className="text-xs mb-1 text-white/50">Wallet</p>
            <p className="text-xs font-mono truncate text-gray-200">{user?.walletAddress?.slice(0, 10)}...</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full px-4 py-2.5 font-600 rounded-lg transition bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-gray-900 bg-black">
          <div className="px-4 md:px-8 py-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-white hover:text-gray-300 text-2xl"
              >
                ☰
              </button>
              <img src="/assets/nullfi-logo.svg" alt="Nullfi" className="w-6 h-6" />
              <div className="hidden sm:block">
                <h2 className="text-lg md:text-xl font-600 text-white mb-0.5">Welcome back, {user?.username || 'User'}</h2>
                <p className="text-xs md:text-sm text-gray-500">Here's your financial overview</p>
              </div>
            </div>
            <button
              onClick={() => setShowProfile(true)}
              className="w-11 h-11 rounded-full flex items-center justify-center transition cursor-pointer overflow-hidden border border-gray-300 bg-gray-100 hover:bg-gray-200"
            >
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : profileImage ? (
                <span className={'text-gray-400 font-semibold'}>{profileImage[0].toUpperCase()}</span>
              ) : (
                <span className={'text-gray-400 font-semibold'}>U</span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 bg-black flex-1 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="space-y-8">
              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
                {[
                  { label: 'Wallet Balance', value: walletBalance?.toFixed(2) || '—', unit: 'SUI', icon: '💵', loading: balanceLoading },
                  { label: 'Credit Score', value: creditScore?.rating || '—', unit: '/100', icon: '⭐' },
                  { label: 'Account Tier', value: creditScore?.tier?.replace('TIER_', '') || '—', unit: '', icon: '🏆' },
                  { label: 'Active Escrows', value: escrows.filter(e => e.status === 'ACTIVE').length, unit: '', icon: '📦' },
                  { label: 'Total Earned', value: `${(Number(escrows.reduce((sum, e) => sum + BigInt(e.releasedAmount || 0), BigInt(0))) / 1_000_000_000).toFixed(2)}`, unit: 'SUI', icon: '💰' },
                ].map((stat, idx) => (
                  <GlowCard key={idx} glowColor="blue">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <p className="text-[10px] md:text-xs font-600 text-gray-400 uppercase tracking-wide">{stat.label}</p>
                        <span className="text-sm md:text-lg">{stat.icon}</span>
                      </div>
                      <div className="flex items-baseline gap-0.5">
                        <p className="text-xl md:text-2xl lg:text-3xl font-700 text-white">{stat.value}</p>
                        {stat.unit && <span className="text-[10px] md:text-xs text-gray-500">{stat.unit}</span>}
                      </div>
                    </div>
                  </GlowCard>
                ))}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs md:text-sm font-600 text-white mb-3 md:mb-5 uppercase tracking-wide">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                  {[
                    { title: 'Create Escrow', desc: 'Start a transaction', action: () => setShowCreateEscrow(true) },
                    { title: 'View Scores', desc: 'Check your rating', action: () => setActiveTab('credit-score') },
                    { title: 'Apply Loan', desc: 'Borrow funds', action: () => setActiveTab('borrowing') },
                    { title: 'View History', desc: 'Activity log', action: () => setActiveTab('transactions') },
                  ].map((action, idx) => (
                    <GlowCard key={idx} glowColor="purple">
                      <button
                        onClick={action.action}
                        className="relative z-10 w-full text-left"
                      >
                        <h4 className="font-600 text-[10px] md:text-sm text-white mb-1 md:mb-2">{action.title}</h4>
                        <p className="text-gray-500 text-[8px] md:text-xs">{action.desc}</p>
                      </button>
                    </GlowCard>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div>
                <h3 className="text-sm font-600 text-white mb-5 uppercase tracking-wide">Recent Activity</h3>
                <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="space-y-3 p-6">
                    {/* Account Created - always show as real account creation date */}
                    {user && (
                      <div className="flex items-center justify-between pb-3 border-b border-gray-900">
                        <div>
                          <p className="font-600 text-white text-sm">Account Created</p>
                          <p className="text-gray-500 text-xs">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}</p>
                        </div>
                      </div>
                    )}
                    {/* Show actual transactions if any exist */}
                    {transactionsLoading ? (
                      <p className="text-gray-500 text-sm py-2">Loading activity...</p>
                    ) : transactions.length > 0 ? (
                      transactions.slice(0, 4).map((txn, idx) => (
                        <div key={idx} className="flex items-center justify-between pb-3 border-b border-white/10 last:border-b-0">
                          <div>
                            <p className="font-semibold text-white text-sm">{txn.type}</p>
                            <p className="text-gray-400 text-xs">{new Date(txn.date || txn.createdAt).toLocaleDateString()}</p>
                          </div>
                          <p className="font-bold text-white">${(txn.amount || 0).toLocaleString()}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm py-2">No transactions yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'escrows' && (
            <div className="space-y-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-700 text-white mb-2">Escrows</h2>
                  <p className="text-sm text-gray-600">Manage your secure transactions</p>
                </div>
                <button
                  onClick={() => setShowCreateEscrow(true)}
                  className="px-5 py-2.5 bg-black text-white font-600 rounded-lg hover:bg-gray-900 transition text-sm"
                >
                  + Create Escrow
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  { label: 'Total Escrows', value: escrows.length },
                  { label: 'Active', value: escrows.filter(e => e.status === 'ACTIVE').length },
                  { label: 'Completed', value: escrows.filter(e => e.status === 'COMPLETED').length },
                  { label: 'Total Value', value: `${(Number(escrows.reduce((sum, e) => sum + BigInt(e.totalAmount || 0), BigInt(0))) / 1_000_000_000).toFixed(2)} SUI` },
                ].map((stat, idx) => (
                  <GlowCard key={idx} glowColor="green">
                    <div className="relative z-10">
                      <p className="text-gray-400 text-xs font-600 mb-3 uppercase tracking-wide">{stat.label}</p>
                      <p className="text-2xl md:text-3xl font-700 text-white">{stat.value}</p>
                    </div>
                  </GlowCard>
                ))}
              </div>

              {/* Escrows List */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Your Escrows</h3>
                {escrowsLoading ? (
                  <div className="bg-gray-950 border border-gray-900 rounded-xl p-8 text-center text-gray-400">
                    <p>Loading escrows...</p>
                  </div>
                ) : escrowsError ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center text-red-300">
                    <p>{escrowsError}</p>
                  </div>
                ) : escrows.length === 0 ? (
                  <div className="bg-gray-950 border border-gray-900 rounded-xl p-8 text-center text-gray-400">
                    <p className="mb-4">No escrows yet</p>
                    <button
                      onClick={() => setShowCreateEscrow(true)}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                    >
                      Create your first escrow
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {escrows.map((escrow) => (
                      <GlowCard key={escrow.id} glowColor="orange">
                        <div className="relative z-10 text-left group">
                        <div className="flex justify-between items-start mb-5">
                          <button
                            onClick={() => {
                              setSelectedEscrow(escrow);
                              setShowEscrowDetail(true);
                            }}
                            className="flex-1 text-left"
                          >
                            <h4 className="text-lg font-semibold text-white mb-2">{escrow.jobTitle}</h4>
                            <p className="text-gray-400 text-sm">Freelancer: {escrow.freelancerAddress}</p>
                          </button>
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              escrow.status === 'active' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                            }`}>
                              {escrow.status === 'active' ? 'Active' : 'Completed'}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-gray-900 rounded-lg transition opacity-0 group-hover:opacity-100">
                                  <MoreVertical size={18} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedEscrow(escrow);
                                    setShowEscrowDetail(true);
                                  }}
                                >
                                  View Details
                                </DropdownMenuItem>
                                {escrow.status === 'active' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedEscrow(escrow);
                                        handleReleaseMilestone();
                                      }}
                                    >
                                      Release Milestone
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      Dispute
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-5">
                          <div>
                            <p className="text-gray-400 text-sm font-medium mb-2">Total</p>
                            <p className="text-lg font-semibold text-white">{((escrow.totalAmount || 0) / 1_000_000_000).toFixed(2)} SUI</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm font-medium mb-2">Released</p>
                            <p className="text-lg font-semibold text-white">{((escrow.releasedAmount || 0) / 1_000_000_000).toFixed(2)} SUI</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm font-medium mb-2">Progress</p>
                            <p className="text-lg font-semibold text-white">{escrow.completedMilestones || 0}/{escrow.milestones || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm font-medium mb-2">Created</p>
                            <p className="text-lg font-semibold text-white">{new Date(escrow.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-white h-full transition-all"
                            style={{ width: `${escrow.milestones > 0 ? ((escrow.completedMilestones || 0) / (escrow.milestones || 1)) * 100 : 0}%` }}
                          ></div>
                        </div>
                        </div>
                      </GlowCard>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'credit' && (
            <div className="space-y-10">
              {/* Header */}
              <div>
                <h2 className="text-display-md font-bold mb-3">Credit Score</h2>
                <p className="text-gray-400 text-body-sm">Your financial reputation on Sui</p>
              </div>

              {/* Main Score Card */}
              <GlowCard glowColor="blue">
              <div className="relative z-10 p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Score Circle */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-48 h-48 md:w-56 md:h-56">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                        {/* Background circle */}
                        <circle cx="100" cy="100" r="90" fill="none" stroke="rgb(255,255,255,0.1)" strokeWidth="8" />
                        {/* Score circle */}
                        <circle
                          cx="100"
                          cy="100"
                          r="90"
                          fill="none"
                          stroke="rgb(255,255,255)"
                          strokeWidth="8"
                          strokeDasharray={`${(creditScore?.rating || 80) * 5.65} 565`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-5xl md:text-6xl font-bold text-white">{creditScore?.rating || 80}</p>
                        <p className="text-gray-400 text-sm">out of 100</p>
                      </div>
                    </div>
                  </div>

                  {/* Score Details */}
                  <div className="space-y-6">
                    <div>
                      <p className="text-gray-400 text-sm font-medium mb-2">Current Tier</p>
                      <div className={`inline-block px-4 py-2 rounded-lg font-semibold text-lg ${
                        creditScore?.tier === 'TIER_1' ? 'bg-yellow-500/20 text-yellow-300' :
                        creditScore?.tier === 'TIER_2' ? 'bg-blue-500/20 text-blue-300' :
                        creditScore?.tier === 'TIER_3' ? 'bg-cyan-500/20 text-cyan-300' :
                        'bg-white/10 text-gray-400'
                      }`}>
                        {creditScore?.tier?.replace('TIER_', 'Tier ') || 'Tier 4'}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-gray-400 text-sm font-medium">Score Factors</p>
                      {(() => {
                        // Calculate real metrics from actual data
                        const completedEscrows = escrows.filter(e => e.status === 'completed').length;
                        const totalEscrows = escrows.length || 1;
                        const escrowCompletion = totalEscrows > 0 ? Math.round((completedEscrows / totalEscrows) * 100) : 0;

                        const completedTxns = transactions.filter(t => t.status === 'completed').length;
                        const onTimeReleases = escrows.filter(e => e.status === 'completed').length;
                        const paymentHistory = completedTxns > 0 ? Math.round((onTimeReleases / completedTxns) * 100) : 0;

                        const accountAge = user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

                        return [
                          { label: 'Escrow Completion Rate', value: `${escrowCompletion}%`, color: 'bg-green-500/20' },
                          { label: 'Payment History', value: `${paymentHistory}%`, color: 'bg-green-500/20' },
                          { label: 'Account Age', value: `${accountAge} days`, color: 'bg-blue-500/20' },
                          { label: 'Active Transactions', value: transactions.length.toString(), color: 'bg-white/10' },
                        ].map((factor, idx) => (
                          <div key={idx} className="bg-gray-800 border border-gray-800 rounded-lg p-3 flex justify-between items-center hover:bg-gray-700 transition">`
                            <p className="text-gray-200 text-sm">{factor.label}</p>
                            <p className="font-semibold text-white">{factor.value}</p>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
              </div>
              </div>
              </GlowCard>

              {/* Score Breakdown Pie Chart - REAL DATA */}
              <div>
                <h3 className="text-heading-lg font-semibold text-white mb-6">Score Breakdown</h3>
                <GlowCard glowColor="purple">
                <div className="relative z-10 p-8">
                  {(() => {
                    // Calculate real metrics from actual data
                    const completedEscrows = escrows.filter(e => e.status === 'completed').length;
                    const totalEscrows = escrows.length || 1;
                    const completionRate = totalEscrows > 0 ? Math.round((completedEscrows / totalEscrows) * 100) : 0;

                    const completedTxns = transactions.filter(t => t.status === 'completed').length;
                    const onTimeReleases = escrows.filter(e => e.status === 'completed').length;
                    const paymentHistory = completedTxns > 0 ? Math.round((onTimeReleases / completedTxns) * 100) : 0;

                    const accountAge = user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    // Account age factor: 1 day = 1%, cap at 30%
                    const accountAgeFactor = Math.min(accountAge, 30);

                    const activeTxns = transactions.length;
                    // Active transactions factor: 1 per = 1%, cap at 20%
                    const activeTxnsFactor = Math.min(activeTxns, 20);

                    // Normalize to sum to 100
                    const total = completionRate + paymentHistory + accountAgeFactor + activeTxnsFactor || 1;
                    const completionPercent = Math.round((completionRate / total) * 100);
                    const paymentPercent = Math.round((paymentHistory / total) * 100);
                    const agePercent = Math.round((accountAgeFactor / total) * 100);
                    const txnPercent = 100 - completionPercent - paymentPercent - agePercent;

                    const pieData = [
                      { name: 'Completion Rate', value: completionPercent },
                      { name: 'Payment History', value: paymentPercent },
                      { name: 'Account Age', value: agePercent },
                      { name: 'Active Transactions', value: txnPercent },
                    ];

                    return (
                      <>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              <Cell fill="#10b981" />
                              <Cell fill="#0ea5e9" />
                              <Cell fill="#f59e0b" />
                              <Cell fill="#8b5cf6" />
                            </Pie>
                            <Tooltip
                              formatter={(value) => `${value}%`}
                              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                          {pieData.map((item, idx) => (
                            <div key={idx} className="text-center">
                              <div className={`w-3 h-3 rounded-full ${
                                idx === 0 ? 'bg-green-500' :
                                idx === 1 ? 'bg-blue-500' :
                                idx === 2 ? 'bg-amber-500' :
                                'bg-purple-500'
                              } mx-auto mb-2`}></div>
                              <p className="text-gray-400 text-xs mb-1">{item.name}</p>
                              <p className="text-white font-bold">{item.value}%</p>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
                </GlowCard>
              </div>

              {/* Tier Progression */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Tier Progression</h3>
                <div className="space-y-3">
                  {[
                    { tier: 'Tier 1', range: '80-100', status: creditScore?.rating === 80 ? 'current' : 'locked', color: 'yellow' },
                    { tier: 'Tier 2', range: '60-79', status: 'unlocked', color: 'blue' },
                    { tier: 'Tier 3', range: '40-59', status: 'unlocked', color: 'cyan' },
                    { tier: 'Tier 4', range: '0-39', status: 'unlocked', color: 'gray' },
                  ].map((t, idx) => (
                    <div key={idx} className={`border rounded-lg p-4 ${
                      t.status === 'current'
                        ? `border-${t.color}-500/50 bg-${t.color}-500/10`
                        : 'border-white/10 bg-white/5'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-white">{t.tier}</p>
                          <p className="text-gray-400 text-sm">Score Range: {t.range}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          t.status === 'current' ? 'bg-green-500/20 text-green-300' :
                          t.status === 'unlocked' ? 'bg-white/10 text-gray-400' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {t.status === 'current' ? 'Current' : t.status === 'unlocked' ? 'Available' : 'Locked'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Affecting Score - REAL DATA ONLY */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
                <div className="bg-gray-950 border border-gray-900 rounded-xl overflow-hidden">
                  <div className="space-y-3 p-6">
                    {/* Account Created - always real */}
                    {user && (
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">🎉</span>
                          <div>
                            <p className="font-semibold text-white">Account Created</p>
                            <p className="text-gray-400 text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show actual escrow completions */}
                    {escrows.filter(e => e.status === 'completed').length > 0 && (
                      escrows
                        .filter(e => e.status === 'completed')
                        .slice(0, 3)
                        .map((escrow, idx) => (
                          <div key={idx} className="flex items-center justify-between pb-3 border-b border-white/10 last:border-b-0">
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">✅</span>
                              <div>
                                <p className="font-semibold text-white">Escrow Completed</p>
                                <p className="text-gray-400 text-sm">{escrow.completedAt ? new Date(escrow.completedAt).toLocaleDateString() : new Date(escrow.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                    )}

                    {/* No activities if brand new account */}
                    {!escrows.filter(e => e.status === 'completed').length && (
                      <div className="text-gray-400 text-sm text-center py-4">
                        No activity yet. Complete escrows and transactions to build your credit score.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">How Credit Score Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'Build Trust', desc: 'Complete escrows and payments on time to build reputation' },
                    { title: 'Unlock Benefits', desc: 'Higher tiers unlock access to better loan rates' },
                    { title: 'Maintain Score', desc: 'Keep your score high by being a reliable partner' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gray-950 border border-gray-900 rounded-lg p-6">
                      <p className="font-semibold text-white mb-2">{item.title}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'borrowing' && (
            <div className="space-y-10">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-display-md font-bold mb-3">Borrowing</h2>
                  <p className="text-gray-400 text-body-sm">Access loans backed by your credit score</p>
                </div>
                <button
                  onClick={() => setShowLoanForm(!showLoanForm)}
                  className="px-3 md:px-6 py-2 md:py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition text-xs md:text-sm"
                >
                  {showLoanForm ? '✕ Cancel' : '+ Apply for Loan'}
                </button>
              </div>

              {/* Loan Application Form - REAL BLOCKCHAIN */}
              {showLoanForm && (
                <div className="bg-gray-950 border border-gray-900 rounded-xl p-8 space-y-6">
                  <h3 className="text-2xl font-bold text-white">Apply for Loan</h3>

                  <div>
                    <label className="text-white font-semibold mb-2 block">Loan Amount (SUI)</label>
                    <input
                      type="number"
                      value={loanForm.amount}
                      onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white"
                      placeholder="1"
                      min="0.1"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="text-white font-semibold mb-2 block">Duration (Months)</label>
                    <select
                      value={loanForm.duration}
                      onChange={(e) => setLoanForm({ ...loanForm, duration: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white"
                    >
                      {loanTerms.map(term => (
                        <option key={term} value={term}>{term} months</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleBorrowSUI}
                    disabled={isLoading}
                    className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-white/90 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Get Loan (Real Sui TX)'}
                  </button>
                </div>
              )}

              {/* Available Limit & Stats - REAL DATA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  // Calculate available limit: 5000 - (rating * 10)
                  const rating = creditScore?.rating || 80;
                  const availableLimit = Math.max(100, 5000 - (rating * 10));

                  // Sum active loan amounts
                  const currentDebt = loans.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

                  // Calculate interest rate: 15% - (rating/100)*10 = formula based on rating
                  const interestRate = (15 - (rating / 100) * 10).toFixed(2);

                  return [
                    { label: 'Available Limit', value: `$${availableLimit.toLocaleString()}`, unit: '' },
                    { label: 'Current Debt', value: `$${currentDebt.toLocaleString()}`, unit: '' },
                    { label: 'Interest Rate', value: interestRate, unit: '%' },
                  ].map((stat, idx) => (
                    <GlowCard key={idx} glowColor="green">
                      <div className="relative z-10">
                        <p className="text-gray-400 text-sm font-medium mb-3">{stat.label}</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-3xl font-bold text-white">{stat.value}</p>
                          {stat.unit && <span className="text-gray-400">{stat.unit}</span>}
                        </div>
                      </div>
                    </GlowCard>
                  ))
                })()}
              </div>

              {/* Interest Rate Info - REAL DATA */}
              <GlowCard glowColor="orange">
              <div className="relative z-10 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Your Tier Benefits</h3>
                    <div className="space-y-3">
                      {(() => {
                        const baseRate = 15.0;
                        const rating = creditScore?.rating || 80;
                        const finalRate = baseRate - (rating / 100) * 10;
                        const discount = baseRate - finalRate;

                        return (
                          <>
                            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                              <p className="text-gray-200">Base Rate</p>
                              <p className="font-semibold text-white">{baseRate.toFixed(2)}%</p>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                              <p className="text-gray-200">Your Discount</p>
                              <p className="font-semibold text-green-300">-{discount.toFixed(2)}%</p>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-800">
                              <p className="text-white font-semibold">Final Rate</p>
                              <p className="font-bold text-blue-300">{finalRate.toFixed(2)}%</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Loan Terms</h3>
                    <div className="space-y-3">
                      {(() => {
                        const rating = creditScore?.rating || 80;
                        const maxAmount = Math.max(100, 5000 - (rating * 10));

                        return (
                          <>
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Minimum Amount</p>
                              <p className="text-lg font-semibold text-white">$100</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Maximum Amount</p>
                              <p className="text-lg font-semibold text-white">${maxAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Repayment Period</p>
                              <p className="text-lg font-semibold text-white">12-60 months</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
              </div>
              </div>
              </GlowCard>

              {/* Active Loans */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Active Loans</h3>
                {loansLoading ? (
                  <div className="bg-gray-950 border border-gray-900 rounded-xl p-8 text-center">
                    <p className="text-gray-400">Loading loans...</p>
                  </div>
                ) : loans.length === 0 ? (
                  <div className="bg-gray-950 border border-gray-900 rounded-xl p-8 text-center">
                    <p className="text-gray-400 mb-2">No active loans</p>
                    <p className="text-white/40 text-sm">Apply for a loan to get started</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {loans.map((loan) => (
                      <GlowCard key={loan.id} glowColor="red">
                      <div className="relative z-10 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white">Loan: ${(loan.amount || 0).toLocaleString()}</h4>
                            <p className="text-gray-400 text-sm">Status: {loan.status || 'active'}</p>
                          </div>
                          <p className="text-2xl font-bold text-white">${(loan.amount || 0).toLocaleString()}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-400 mb-1">Interest Rate</p>
                            <p className="font-semibold text-white">{loan.interestRate || '8.5'}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-1">Duration</p>
                            <p className="font-semibold text-white">{loan.durationDays || '360'} days</p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-1">Taken</p>
                            <p className="font-semibold text-white">{new Date(loan.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRepayLoan(loan.id, loan.amount || 0)}
                          disabled={isLoading || loan.status !== 'ACTIVE'}
                          className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          💰 Repay Loan (Real Sui TX)
                        </button>
                      </div>
                      </GlowCard>
                    ))}
                  </div>
                )}
              </div>

              {/* Loan Calculator */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Loan Calculator</h3>
                <div className="bg-gray-950 border border-gray-900 rounded-xl p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Input Fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-3">Loan Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-400">$</span>
                        <input
                          type="number"
                          placeholder="2000"
                          defaultValue={2000}
                          className="w-full pl-8 pr-4 py-3 bg-gray-950 border border-gray-900 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                          onChange={() => {}}
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-200 mb-3">Loan Term</label>
                      <input
                        type="text"
                        placeholder="Type months or select..."
                        value={loanTermSearch}
                        onChange={(e) => {
                          setLoanTermSearch(e.target.value);
                          setShowLoanTermDropdown(true);
                        }}
                        onFocus={() => setShowLoanTermDropdown(true)}
                        className="w-full px-4 py-3 bg-gray-950 border border-gray-900 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition"
                      />

                      {showLoanTermDropdown && (loanTermSearch || filteredLoanTerms.length > 0) && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 border border-white/10 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                          {filteredLoanTerms.length > 0 ? (
                            filteredLoanTerms.map((term, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setLoanTermSearch(`${term} months`);
                                  setShowLoanTermDropdown(false);
                                }}
                                className="w-full px-4 py-2.5 text-left text-gray-200 hover:bg-gray-900 hover:text-white transition border-b border-white/5 last:border-b-0"
                              >
                                {term} months
                              </button>
                            ))
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setShowLoanTermDropdown(false);
                              }}
                              className="w-full px-4 py-2.5 text-left text-gray-400 hover:bg-gray-900 hover:text-white transition"
                            >
                              Use "{loanTermSearch}" months
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-3">Interest Rate</label>
                      <div className="w-full px-4 py-3 bg-gray-950 border border-gray-900 rounded-lg text-white flex items-center">
                        <span>{creditScore?.rating ? (15 - (creditScore.rating / 100) * 10).toFixed(2) : '8.5'}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/10">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Monthly Payment</p>
                      <p className="text-3xl font-bold text-white">$177</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Total Interest</p>
                      <p className="text-3xl font-bold text-white">$128</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Total Repayment</p>
                      <p className="text-3xl font-bold text-white">$2,128</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Repayment History */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Repayment History</h3>
                <div className="bg-gray-950 border border-gray-900 rounded-xl overflow-hidden">
                  <div className="p-8 text-center text-gray-400">
                    <p className="mb-2">No repayment history yet</p>
                    <p className="text-sm">Your payments will appear here once you take a loan</p>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {[
                    { q: 'How is my interest rate determined?', a: 'Your interest rate is based on your credit score tier. Higher credit scores get better rates.' },
                    { q: 'What is the maximum loan amount?', a: 'Maximum loan amount depends on your credit score and tier. Higher tiers can borrow more.' },
                    { q: 'Can I pay off my loan early?', a: 'Yes! You can repay your loan anytime without early repayment penalties.' },
                    { q: 'How long does loan approval take?', a: 'Loans are approved instantly. Funds are transferred to your wallet in seconds.' },
                  ].map((faq, idx) => (
                    <div key={idx} className="bg-gray-950 border border-gray-900 rounded-lg p-4">
                      <p className="font-semibold text-white mb-2">{faq.q}</p>
                      <p className="text-gray-400 text-sm">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-10">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-display-md font-bold mb-3">Transactions</h2>
                  <p className="text-gray-400 text-body-sm">View your complete transaction history</p>
                </div>
                <button
                  onClick={downloadPDF}
                  className="px-3 md:px-6 py-2 md:py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                >
                  📥 <span className="hidden sm:inline">Download Statement</span><span className="sm:hidden">Download</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Transactions', value: transactions.length },
                  { label: 'Completed', value: transactions.filter(t => t.status === 'completed').length },
                  { label: 'Pending', value: transactions.filter(t => t.status === 'pending').length },
                  { label: 'Failed', value: transactions.filter(t => t.status === 'failed').length },
                ].map((stat, idx) => (
                  <GlowCard key={idx} glowColor="blue">
                    <div className="relative z-10">
                      <p className="text-gray-400 text-sm font-medium mb-3">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                  </GlowCard>
                ))}
              </div>

              {/* Transactions Table with LeadsTable */}
              {transactions.length > 0 && (
                <LeadsTable
                  leads={transactions.map((txn, idx) => ({
                    id: txn.id || idx.toString(),
                    name: txn.type,
                    email: txn.description || txn.type,
                    source: txn.type,
                    sourceType: txn.status === 'completed' ? 'organic' : 'campaign' as const,
                    status: txn.status === 'completed' ? 'closed' : txn.status === 'pending' ? 'pre-sale' : 'lost' as const,
                    size: txn.amount || 0,
                    interest: Array.from({ length: 10 }, (_, i) => (txn.amount || 0) / 100 + i * 5),
                    probability: txn.status === 'completed' ? 'high' : txn.status === 'pending' ? 'mid' : 'low' as const,
                    lastAction: new Date(txn.date || txn.createdAt).toLocaleDateString(),
                  }))}
                  title="Transactions"
                />
              )}

              {/* Pagination */}
              {transactions.length > 0 && (
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-sm">
                    Showing <span className="font-semibold text-white">{startIndex + 1}</span> to <span className="font-semibold text-white">{Math.min(startIndex + transactionsPerPage, transactions.length)}</span> of <span className="font-semibold text-white">{transactions.length}</span> transactions
                  </p>

                  <div className="flex gap-2 items-center">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      ← Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                              currentPage === pageNum
                                ? 'bg-white text-black'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="text-white/40">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-sm font-medium"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  <strong>💾 Download Statement:</strong> Click the "Download Statement" button to get all your transactions in a text format for record keeping or accounting purposes.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-10">
              {/* Header */}
              <div>
                <h2 className="text-display-md font-bold mb-3">Settings</h2>
                <p className="text-gray-400 text-body-sm">Manage your account and preferences</p>
              </div>

              {/* CSS for Toggle Switches */}
              <style>{`
                input[type="checkbox"].toggle-switch {
                  width: 48px;
                  height: 28px;
                  appearance: none;
                  background: #4b5563;
                  border-radius: 34px;
                  cursor: pointer;
                  position: relative;
                  outline: none;
                  transition: background 0.3s;
                  border: none;
                }

                input[type="checkbox"].toggle-switch:checked {
                  background: #10b981;
                }

                input[type="checkbox"].toggle-switch::before {
                  content: '';
                  position: absolute;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: white;
                  top: 2px;
                  left: 2px;
                  transition: left 0.3s;
                }

                input[type="checkbox"].toggle-switch:checked::before {
                  left: 22px;
                }

                input[type="checkbox"].toggle-switch:disabled {
                  opacity: 0.5;
                  cursor: not-allowed;
                }
              `}</style>

              {/* Security Settings */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Security</h3>
                <div className="space-y-4">
                  {/* Two Factor Authentication */}
                  <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white mb-1">Two-Factor Authentication</p>
                        <p className="text-gray-400 text-sm">
                          {twoFactorEnabled
                            ? '✅ Enabled - Google Authenticator / Authy'
                            : 'Use authenticator app (Google Authenticator, Authy, Microsoft Authenticator)'}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            setTwoFactorLoading(true);
                            if (twoFactorEnabled) {
                              await api.disable2FA(user?.walletAddress || '');
                              setTwoFactorEnabled(false);
                              showToast('2FA disabled', 'success');
                            } else {
                              const data = await api.setup2FA(user?.walletAddress || '');
                              setTwoFAData(data);
                              setShow2FAModal(true);
                            }
                          } catch (error) {
                            console.error('2FA error:', error);
                            showToast('Failed to setup 2FA', 'error');
                          } finally {
                            setTwoFactorLoading(false);
                          }
                        }}
                        disabled={twoFactorLoading}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          twoFactorEnabled
                            ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                        } disabled:opacity-50`}
                      >
                        {twoFactorLoading ? 'Loading...' : twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                      </button>
                    </div>
                  </div>

                  {/* Connected Wallets - Only show primary */}
                  <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
                    <p className="font-semibold text-white mb-4">Connected Wallets</p>
                    <p className="text-gray-400 text-xs mb-4">One wallet per account</p>
                    <div className="space-y-3">
                      <div className="bg-white/5 rounded p-4 border border-white/10">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm">Primary Wallet</p>
                            <p className="text-gray-400 text-xs font-mono mt-1 break-all">{user?.walletAddress}</p>
                          </div>
                          <button disabled className="px-3 py-1 bg-red-500/10 text-red-300 rounded text-xs font-medium transition opacity-50 cursor-not-allowed whitespace-nowrap">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Notifications</h3>
                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white mb-1">Email Notifications</p>
                        <p className="text-gray-400 text-sm">Receive important updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle-switch"
                        checked={emailNotifications}
                        disabled={emailLoading}
                        onChange={async (e) => {
                          try {
                            setEmailLoading(true);
                            const newState = e.target.checked;
                            await api.updateUserSettings(user?.walletAddress || '', {
                              emailNotifications: newState,
                              transactionAlerts,
                            });
                            setEmailNotifications(newState);
                            showToast('Email notifications ' + (newState ? 'enabled' : 'disabled'), 'success');
                          } catch (error) {
                            console.error('Failed to update settings:', error);
                            showToast('Failed to save setting', 'error');
                            setEmailNotifications(!e.target.checked);
                          } finally {
                            setEmailLoading(false);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Transaction Alerts */}
                  <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white mb-1">Transaction Alerts</p>
                        <p className="text-gray-400 text-sm">Get notified on all transactions</p>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle-switch"
                        checked={transactionAlerts}
                        disabled={transactionLoading}
                        onChange={async (e) => {
                          try {
                            setTransactionLoading(true);
                            const newState = e.target.checked;
                            await api.updateUserSettings(user?.walletAddress || '', {
                              emailNotifications,
                              transactionAlerts: newState,
                            });
                            setTransactionAlerts(newState);
                            showToast('Transaction alerts ' + (newState ? 'enabled' : 'disabled'), 'success');
                          } catch (error) {
                            console.error('Failed to update settings:', error);
                            showToast('Failed to save setting', 'error');
                            setTransactionAlerts(!e.target.checked);
                          } finally {
                            setTransactionLoading(false);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Privacy</h3>
                <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white mb-1">Public Profile</p>
                      <p className="text-gray-400 text-sm">Allow others to view your profile and credit score</p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle-switch"
                      checked={publicProfile}
                      disabled={publicLoading}
                      onChange={async (e) => {
                        try {
                          setPublicLoading(true);
                          const newState = e.target.checked;
                          await api.updateUserSettings(user?.walletAddress || '', {
                            publicProfile: newState,
                          });
                          setPublicProfile(newState);
                          showToast(newState ? 'Profile is now public' : 'Profile is now private', 'success');
                        } catch (error) {
                          console.error('Failed to update settings:', error);
                          showToast('Failed to save setting', 'error');
                          setPublicProfile(!e.target.checked);
                        } finally {
                          setPublicLoading(false);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Developer */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Developer</h3>
                <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
                  <p className="font-semibold text-white mb-4">API Key</p>
                  <div className="space-y-3">
                    {apiKeyLoading ? (
                      <div className="text-gray-400 text-sm">Loading API key...</div>
                    ) : apiKey ? (
                      <>
                        <div className="space-y-2">
                          <input
                            type={showApiKey ? "text" : "password"}
                            value={apiKey}
                            readOnly
                            className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-950 border border-gray-900 rounded-lg text-white font-mono text-xs md:text-sm focus:outline-none break-all"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="flex-1 px-2 md:px-4 py-2 md:py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition border border-white/10 font-medium text-xs md:text-sm"
                              title={showApiKey ? "Hide" : "Show"}
                            >
                              {showApiKey ? '👁️' : '🔒'}
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(apiKey);
                                showToast('API key copied!', 'success');
                              }}
                              className="flex-1 px-2 md:px-4 py-2 md:py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition border border-white/10 font-medium text-xs md:text-sm"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (!window.confirm('This will invalidate your current API key. Continue?')) return;
                            try {
                              setApiKeyRegenerating(true);
                              const response = await api.regenerateApiKey(user?.walletAddress || '');
                              setApiKey(response.apiKey);
                              showToast('API key regenerated successfully!', 'success');
                            } catch (error) {
                              console.error('Failed to regenerate API key:', error);
                              showToast('Failed to regenerate API key', 'error');
                            } finally {
                              setApiKeyRegenerating(false);
                            }
                          }}
                          disabled={apiKeyRegenerating}
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition border border-white/10 font-medium text-xs md:text-sm disabled:opacity-50"
                        >
                          {apiKeyRegenerating ? 'Regenerating...' : 'Regenerate Key'}
                        </button>
                      </>
                    ) : (
                      <div className="text-gray-400 text-sm">No API key available</div>
                    )}
                  </div>
                  <p className="text-white/50 text-xs mt-4">Keep your API key secret. Never share it in public code or repositories.</p>
                </div>
              </div>

              {/* Danger Zone */}
              <div>
                <h3 className="text-xl font-semibold text-red-400 mb-6">Danger Zone</h3>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white mb-1">Delete Account</p>
                      <p className="text-gray-400 text-sm">Permanently delete your account and all data</p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition font-medium text-sm border border-red-500/30 disabled:opacity-50"
                    >
                      {isLoading ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  <strong>💾 Auto-save:</strong> Your settings are saved automatically when you change them.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg font-medium z-[60] transition animate-in ${
            toast.type === 'success'
              ? 'bg-green-600/20 border border-green-500/50 text-green-300'
              : 'bg-red-600/20 border border-red-500/50 text-red-300'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Profile Settings Modal */}
      {showProfile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="bg-black border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-white/10 p-8 flex justify-between items-center sticky top-0 bg-black">
              <h2 className="text-2xl font-bold">Account Settings</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Profile Picture */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Profile Picture</h3>
                <div className="flex flex-col items-center gap-6">
                  <div className="w-32 h-32 bg-white/10 border-2 border-white/20 rounded-full flex items-center justify-center text-5xl font-bold overflow-hidden">
                    {profileImagePreview ? (
                      <img src={profileImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : profileImage ? (
                      profileImage[0].toUpperCase()
                    ) : (
                      'U'
                    )}
                  </div>
                  {selectedFileName && (
                    <p className="text-sm text-gray-400">Selected: {selectedFileName}</p>
                  )}
                  <label className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition cursor-pointer font-medium">
                    Click to upload a new profile picture
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                  {profileImagePreview && (
                    <button
                      onClick={handleUpdateProfileImage}
                      disabled={isLoading}
                      className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50"
                    >
                      {isLoading ? 'Uploading...' : 'Update Picture'}
                    </button>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-b border-white/10"></div>

              {/* Your Name */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Your Name</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-950 border border-gray-900 rounded-lg text-white focus:outline-none focus:border-white/30 focus:bg-white/10"
                    />
                  </div>
                  <button
                    onClick={handleUpdateName}
                    disabled={isLoading}
                    className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Updating...' : 'Update Name'}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-b border-white/10"></div>

              {/* Delete Account */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-red-400">Delete Account</h3>
                <p className="text-gray-400 text-sm mb-6">Permanently delete your account and all associated data. This action is irreversible.</p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Escrow Modal */}
      {showCreateEscrow && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4"
          onClick={() => setShowCreateEscrow(false)}
        >
          <div
            className="bg-black border border-white/10 rounded-xl w-full max-w-md md:max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/10 p-4 md:p-6 flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold">Create Escrow</h2>
              <button
                onClick={() => setShowCreateEscrow(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-200 mb-2">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g., Website Design"
                  value={createEscrowForm.jobTitle}
                  onChange={(e) => setCreateEscrowForm({ ...createEscrowForm, jobTitle: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-950 border border-gray-900 rounded-lg text-sm md:text-base text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition"
                />
              </div>

              <div className="relative">
                <label className="block text-xs md:text-sm font-medium text-gray-200 mb-2">Category</label>
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={categorySearch}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setShowCategoryDropdown(true);
                    setCreateEscrowForm({ ...createEscrowForm, category: e.target.value });
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-950 border border-gray-900 rounded-lg text-sm md:text-base text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition"
                />

                {showCategoryDropdown && (categorySearch || filteredCategories.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 border border-white/10 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCreateEscrowForm({ ...createEscrowForm, category: cat });
                            setCategorySearch(cat);
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-gray-200 hover:bg-gray-900 hover:text-white transition border-b border-white/5 last:border-b-0"
                        >
                          {cat}
                        </button>
                      ))
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setCreateEscrowForm({ ...createEscrowForm, category: categorySearch });
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-gray-400 hover:bg-gray-900 hover:text-white transition"
                      >
                        Use "{categorySearch}" as category
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-200 mb-2">Freelancer Wallet</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={createEscrowForm.freelancerAddress}
                  onChange={(e) => setCreateEscrowForm({ ...createEscrowForm, freelancerAddress: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-950 border border-gray-900 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition font-mono text-xs"
                />
                <p className="text-xs text-white/40 mt-1">64 hex chars starting with 0x</p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-200 mb-2">Amount (SUI)</label>
                  <input
                    type="number"
                    placeholder="1"
                    min="0.1"
                    step="0.1"
                    value={createEscrowForm.totalAmount}
                    onChange={(e) => setCreateEscrowForm({ ...createEscrowForm, totalAmount: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-950 border border-gray-900 rounded-lg text-sm md:text-base text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-200 mb-2">Milestones</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={createEscrowForm.milestoneCount}
                    onChange={(e) => setCreateEscrowForm({ ...createEscrowForm, milestoneCount: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-950 border border-gray-900 rounded-lg text-sm md:text-base text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 md:pt-5 flex gap-2 md:gap-3">
                <button
                  onClick={() => setShowCreateEscrow(false)}
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-white/10 text-white font-medium text-sm md:text-base rounded-lg hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEscrow}
                  disabled={isLoading}
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-white text-black font-semibold text-sm md:text-base rounded-lg hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escrow Detail Modal */}
      {showEscrowDetail && selectedEscrow && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowEscrowDetail(false)}
        >
          <div
            className="bg-black border border-white/10 rounded-2xl w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/10 p-8 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedEscrow.jobTitle}</h2>
              <button
                onClick={() => setShowEscrowDetail(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Status</p>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                    selectedEscrow.status === 'active' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                  }`}>
                    {selectedEscrow.status === 'active' ? 'Active' : 'Completed'}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Created</p>
                  <p className="font-semibold">{new Date(selectedEscrow.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border-b border-white/10"></div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Freelancer</p>
                  <p className="font-mono text-sm">{selectedEscrow.freelancerAddress}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                    <p className="text-2xl font-bold">{((selectedEscrow.totalAmount || 0) / 1_000_000_000).toFixed(2)} SUI</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Released</p>
                    <p className="text-2xl font-bold">{((selectedEscrow.releasedAmount || 0) / 1_000_000_000).toFixed(2)} SUI</p>
                  </div>
                </div>
              </div>

              <div className="border-b border-white/10"></div>

              <div>
                <p className="text-gray-400 text-sm mb-4">Milestone Progress</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{selectedEscrow.completedMilestones || 0}/{selectedEscrow.milestones || 0} completed</p>
                    <p className="text-gray-400 text-sm">{(((selectedEscrow.totalAmount || 0) / (selectedEscrow.milestones || 1)) / 1_000_000_000).toFixed(2)} SUI per milestone</p>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-white h-full transition-all"
                      style={{ width: `${selectedEscrow.milestones > 0 ? ((selectedEscrow.completedMilestones || 0) / (selectedEscrow.milestones || 1)) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowEscrowDetail(false)}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                >
                  Close
                </button>
                <button
                  onClick={handleSignAndExecuteEscrow}
                  disabled={isSigningTransaction}
                  className="flex-1 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {isSigningTransaction ? '⏳ Signing...' : '🔐 Sign & Execute'}
                </button>
                {selectedEscrow.status === 'active' && (selectedEscrow.completedMilestones || 0) < (selectedEscrow.milestones || 0) && (
                  <button
                    onClick={handleReleaseMilestone}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Releasing...' : 'Release Milestone'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {twoFAData && (
        <TwoFAModal
          isOpen={show2FAModal}
          onClose={() => {
            setShow2FAModal(false);
            setTwoFAData(null);
          }}
          qrCode={twoFAData.qrCode}
          secret={twoFAData.secret}
          backupCodes={twoFAData.backupCodes}
          onVerify={async (code) => {
            await api.verify2FA(user?.walletAddress || '', code, twoFAData.secret, twoFAData.backupCodes);
            setTwoFactorEnabled(true);
            showToast('2FA enabled successfully!', 'success');
          }}
          isLoading={twoFactorLoading}
        />
      )}
    </main>
  );
};

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/profile/:username" element={<PublicProfile />} />
    </Routes>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <>
        <DashboardStyles />
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </>
    </WalletProvider>
  );
}
