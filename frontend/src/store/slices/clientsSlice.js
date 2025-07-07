import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async thunks for API calls
export const fetchClients = createAsyncThunk(
  "clients/fetchClients",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/clients");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch clients"
      );
    }
  }
);

export const createClient = createAsyncThunk(
  "clients/createClient",
  async (clientData, { rejectWithValue }) => {
    try {
      const response = await api.post("/clients", clientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create client"
      );
    }
  }
);

export const updateClient = createAsyncThunk(
  "clients/updateClient",
  async ({ id, clientData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update client"
      );
    }
  }
);

export const deleteClient = createAsyncThunk(
  "clients/deleteClient",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/clients/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete client"
      );
    }
  }
);

export const fetchClientById = createAsyncThunk(
  "clients/fetchClientById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch client"
      );
    }
  }
);

const initialState = {
  clients: [],
  currentClient: null,
  loading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
    businessType: "all",
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  stats: {
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    onHold: 0,
  },
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentClient: (state) => {
      state.currentClient = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateClientStatus: (state, action) => {
      const { id, status } = action.payload;
      const client = state.clients.find((c) => c._id === id);
      if (client) {
        client.onboardingStatus = status;
      }
    },
    updateClientProgress: (state, action) => {
      const { id, checklist } = action.payload;
      const client = state.clients.find((c) => c._id === id);
      if (client) {
        client.onboardingChecklist = checklist;
      }
    },
    calculateStats: (state) => {
      const clients = Array.isArray(state.clients) ? state.clients : [];
      state.stats = {
        total: clients.length,
        completed: clients.filter((c) => c.onboardingStatus === "completed")
          .length,
        inProgress: clients.filter((c) => c.onboardingStatus === "in-progress")
          .length,
        pending: clients.filter((c) => c.onboardingStatus === "pending").length,
        onHold: clients.filter((c) => c.onboardingStatus === "on-hold").length,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch clients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        const payload = Array.isArray(action.payload) ? action.payload : [];
        state.clients = payload;
        state.pagination.total = payload.length;
        clientsSlice.caseReducers.calculateStats(state);
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create client
      .addCase(createClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients.push(action.payload);
        state.pagination.total += 1;
        clientsSlice.caseReducers.calculateStats(state);
      })
      .addCase(createClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update client
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clients.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        if (
          state.currentClient &&
          state.currentClient._id === action.payload._id
        ) {
          state.currentClient = action.payload;
        }
        clientsSlice.caseReducers.calculateStats(state);
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete client
      .addCase(deleteClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = state.clients.filter((c) => c._id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentClient && state.currentClient._id === action.payload) {
          state.currentClient = null;
        }
        clientsSlice.caseReducers.calculateStats(state);
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch client by ID
      .addCase(fetchClientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentClient = action.payload;
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  setPagination,
  clearCurrentClient,
  clearError,
  updateClientStatus,
  updateClientProgress,
  calculateStats,
} = clientsSlice.actions;

// Selectors
export const selectClients = (state) => state.clients.clients;
export const selectCurrentClient = (state) => state.clients.currentClient;
export const selectClientsLoading = (state) => state.clients.loading;
export const selectClientsError = (state) => state.clients.error;
export const selectClientsFilters = (state) => state.clients.filters;
export const selectClientsPagination = (state) => state.clients.pagination;
export const selectClientsStats = (state) => state.clients.stats;

export const selectFilteredClients = (state) => {
  const { clients, filters } = state.clients;
  const { search, status, businessType } = filters;
  const clientsArray = Array.isArray(clients) ? clients : [];

  return clientsArray.filter((client) => {
    const matchesSearch =
      client.businessName.toLowerCase().includes(search.toLowerCase()) ||
      client.contactPerson?.name.toLowerCase().includes(search.toLowerCase()) ||
      client.contactPerson?.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      status === "all" || client.onboardingStatus === status;
    const matchesType =
      businessType === "all" || client.businessType === businessType;

    return matchesSearch && matchesStatus && matchesType;
  });
};

export const selectClientsByStatus = (state) => {
  const clients = Array.isArray(state.clients.clients)
    ? state.clients.clients
    : [];
  return {
    pending: clients.filter((c) => c.onboardingStatus === "pending"),
    inProgress: clients.filter((c) => c.onboardingStatus === "in-progress"),
    completed: clients.filter((c) => c.onboardingStatus === "completed"),
    onHold: clients.filter((c) => c.onboardingStatus === "on-hold"),
  };
};

export const selectRecentClients = (state) => {
  const clients = Array.isArray(state.clients.clients)
    ? state.clients.clients
    : [];
  return clients
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
};

export default clientsSlice.reducer;
