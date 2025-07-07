import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarCollapsed: false,
  theme: "light",
  primaryColor: "#1890ff",
  loading: {
    global: false,
    clients: false,
    tasks: false,
    users: false,
    reports: false,
  },
  notifications: [],
  modals: {
    clientForm: false,
    taskForm: false,
    userForm: false,
    confirmDialog: false,
  },
  currentPage: "dashboard",
  breadcrumbs: [{ title: "Home", path: "/" }],
  searchQuery: "",
  filters: {
    global: "",
    dateRange: null,
  },
  settings: {
    pageSize: 10,
    language: "en",
    timezone: "Africa/Nairobi",
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  },
  mobile: false,
  screenSize: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      if (key in state.loading) {
        state.loading[key] = value;
      }
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.notifications.unshift(notification);
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true;
      });
    },
    openModal: (state, action) => {
      const { modal, data } = action.payload;
      if (modal in state.modals) {
        state.modals[modal] = true;
        if (data) {
          state[`${modal}Data`] = data;
        }
      }
    },
    closeModal: (state, action) => {
      const modal = action.payload;
      if (modal in state.modals) {
        state.modals[modal] = false;
        if (state[`${modal}Data`]) {
          delete state[`${modal}Data`];
        }
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((modal) => {
        state.modals[modal] = false;
      });
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    addBreadcrumb: (state, action) => {
      state.breadcrumbs.push(action.payload);
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setGlobalFilter: (state, action) => {
      state.filters.global = action.payload;
    },
    setDateRangeFilter: (state, action) => {
      state.filters.dateRange = action.payload;
    },
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    setMobile: (state, action) => {
      state.mobile = action.payload;
    },
    setScreenSize: (state, action) => {
      state.screenSize = action.payload;
      // Auto-collapse sidebar on mobile
      if (action.payload.width < 768) {
        state.mobile = true;
        state.sidebarCollapsed = true;
      } else {
        state.mobile = false;
      }
    },
    resetUI: (state) => {
      return { ...initialState, screenSize: state.screenSize };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  setPrimaryColor,
  setGlobalLoading,
  setLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  openModal,
  closeModal,
  closeAllModals,
  setCurrentPage,
  setBreadcrumbs,
  addBreadcrumb,
  setSearchQuery,
  setGlobalFilter,
  setDateRangeFilter,
  updateSettings,
  setMobile,
  setScreenSize,
  resetUI,
} = uiSlice.actions;

// Selectors
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectTheme = (state) => state.ui.theme;
export const selectPrimaryColor = (state) => state.ui.primaryColor;
export const selectGlobalLoading = (state) => state.ui.loading.global;
export const selectLoading = (key) => (state) => state.ui.loading[key];
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotifications = (state) =>
  state.ui.notifications.filter((n) => !n.read);
export const selectModals = (state) => state.ui.modals;
export const selectModal = (modal) => (state) => state.ui.modals[modal];
export const selectCurrentPage = (state) => state.ui.currentPage;
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs;
export const selectSearchQuery = (state) => state.ui.searchQuery;
export const selectFilters = (state) => state.ui.filters;
export const selectSettings = (state) => state.ui.settings;
export const selectMobile = (state) => state.ui.mobile;
export const selectScreenSize = (state) => state.ui.screenSize;

// Complex selectors
export const selectIsDarkMode = (state) => state.ui.theme === "dark";
export const selectNotificationCount = (state) => state.ui.notifications.length;
export const selectUnreadNotificationCount = (state) =>
  state.ui.notifications.filter((n) => !n.read).length;

export default uiSlice.reducer;
