// ───────────────────────────────────────────────────────────
// Global app state — context + reducer.
// Split surface: auth, contracts, UI, real-time feed.
// ───────────────────────────────────────────────────────────
import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  type ReactNode,
  type Dispatch,
} from "react";
import type {
  Contract,
  ActivityLog,
  AlertItem,
  ModalState,
  ContractStatus,
} from "../types";
import {
  contracts as seedContracts,
  activityFeed as seedActivity,
  alerts as seedAlerts,
  WALLET_ADDRESS,
} from "../data/mock";

export type ContractFilter = "all" | "active" | "completed" | "at-risk";

interface AppState {
  // auth
  walletAddress: string | null;
  isConnected: boolean;
  // contracts
  contracts: Contract[];
  selectedContractId: string | null;
  contractFilter: ContractFilter;
  // ui
  sidebarOpen: boolean;
  modal: ModalState | null;
  notificationCount: number;
  // real-time
  liveActivityFeed: ActivityLog[];
  alerts: AlertItem[];
}

type Action =
  | { type: "CONNECT_WALLET" }
  | { type: "DISCONNECT_WALLET" }
  | { type: "SELECT_CONTRACT"; id: string | null }
  | { type: "SET_FILTER"; filter: ContractFilter }
  | { type: "TOGGLE_SIDEBAR"; open?: boolean }
  | { type: "OPEN_MODAL"; modal: ModalState }
  | { type: "CLOSE_MODAL" }
  | { type: "ADD_CONTRACT"; contract: Contract }
  | { type: "ADD_ACTIVITY"; activity: ActivityLog }
  | { type: "CLEAR_NOTIFICATIONS" };

const initialState: AppState = {
  walletAddress: WALLET_ADDRESS,
  isConnected: true,
  contracts: seedContracts,
  selectedContractId: seedContracts[0]?.id ?? null,
  contractFilter: "all",
  sidebarOpen: false,
  modal: null,
  notificationCount: seedAlerts.length,
  liveActivityFeed: seedActivity,
  alerts: seedAlerts,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "CONNECT_WALLET":
      return { ...state, walletAddress: WALLET_ADDRESS, isConnected: true };
    case "DISCONNECT_WALLET":
      return { ...state, walletAddress: null, isConnected: false };
    case "SELECT_CONTRACT":
      return { ...state, selectedContractId: action.id, sidebarOpen: false };
    case "SET_FILTER":
      return { ...state, contractFilter: action.filter };
    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        sidebarOpen: action.open ?? !state.sidebarOpen,
      };
    case "OPEN_MODAL":
      return { ...state, modal: action.modal };
    case "CLOSE_MODAL":
      return { ...state, modal: null };
    case "ADD_CONTRACT":
      return {
        ...state,
        contracts: [action.contract, ...state.contracts],
        selectedContractId: action.contract.id,
        modal: null,
      };
    case "ADD_ACTIVITY":
      return {
        ...state,
        liveActivityFeed: [action.activity, ...state.liveActivityFeed],
        notificationCount: state.notificationCount + 1,
      };
    case "CLEAR_NOTIFICATIONS":
      return { ...state, notificationCount: 0 };
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  dispatch: Dispatch<Action>;
  selectedContract: Contract | null;
  filteredContracts: Contract[];
  selectContract: (id: string | null) => void;
  setFilter: (filter: ContractFilter) => void;
  toggleSidebar: (open?: boolean) => void;
  openModal: (modal: ModalState) => void;
  closeModal: () => void;
  addContract: (contract: Contract) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function matchesFilter(c: Contract, filter: ContractFilter): boolean {
  if (filter === "all") return true;
  if (filter === "at-risk") return c.status === "breached";
  const map: Record<Exclude<ContractFilter, "all" | "at-risk">, ContractStatus> = {
    active: "active",
    completed: "completed",
  };
  return c.status === map[filter];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const selectedContract = useMemo(
    () => state.contracts.find((c) => c.id === state.selectedContractId) ?? null,
    [state.contracts, state.selectedContractId]
  );

  const filteredContracts = useMemo(
    () => state.contracts.filter((c) => matchesFilter(c, state.contractFilter)),
    [state.contracts, state.contractFilter]
  );

  const selectContract = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_CONTRACT", id });
  }, []);
  const setFilter = useCallback((filter: ContractFilter) => {
    dispatch({ type: "SET_FILTER", filter });
  }, []);
  const toggleSidebar = useCallback((open?: boolean) => {
    dispatch({ type: "TOGGLE_SIDEBAR", open });
  }, []);
  const openModal = useCallback((modal: ModalState) => {
    dispatch({ type: "OPEN_MODAL", modal });
  }, []);
  const closeModal = useCallback(() => dispatch({ type: "CLOSE_MODAL" }), []);
  const addContract = useCallback((contract: Contract) => {
    dispatch({ type: "ADD_CONTRACT", contract });
  }, []);

  const value: AppContextValue = {
    ...state,
    dispatch,
    selectedContract,
    filteredContracts,
    selectContract,
    setFilter,
    toggleSidebar,
    openModal,
    closeModal,
    addContract,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within <AppProvider>");
  return ctx;
}
