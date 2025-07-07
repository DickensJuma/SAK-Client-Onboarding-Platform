import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import dayjs from "dayjs";

// Async thunks for API calls
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/tasks", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tasks"
      );
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post("/tasks", taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create task"
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update task"
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete task"
      );
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  "tasks/updateTaskStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const updateData = {
        status,
        completedAt: status === "completed" ? new Date().toISOString() : null,
      };
      const response = await api.put(`/tasks/${id}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update task status"
      );
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  "tasks/fetchTaskById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch task"
      );
    }
  }
);

export const addTaskComment = createAsyncThunk(
  "tasks/addTaskComment",
  async ({ id, comment }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${id}/comments`, {
        text: comment,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add comment"
      );
    }
  }
);

export const updateTaskChecklist = createAsyncThunk(
  "tasks/updateTaskChecklist",
  async ({ id, checklist }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${id}`, { checklist });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update checklist"
      );
    }
  }
);

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
    type: "all",
    priority: "all",
    assignee: "all",
    client: "all",
    dateRange: null,
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  stats: {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
  },
  recentTasks: [],
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateTaskInList: (state, action) => {
      const { id, updates } = action.payload;
      const task = state.tasks.find((t) => t._id === id);
      if (task) {
        Object.assign(task, updates);
      }
    },
    calculateStats: (state) => {
      const tasks = Array.isArray(state.tasks) ? state.tasks : [];
      const now = dayjs();

      state.stats = {
        total: tasks.length,
        pending: tasks.filter((t) => t.status === "pending").length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        completed: tasks.filter((t) => t.status === "completed").length,
        cancelled: tasks.filter((t) => t.status === "cancelled").length,
        overdue: tasks.filter(
          (t) =>
            t.status !== "completed" &&
            t.status !== "cancelled" &&
            t.dueDate &&
            dayjs(t.dueDate).isBefore(now)
        ).length,
      };
    },
    updateRecentTasks: (state) => {
      const tasks = Array.isArray(state.tasks) ? state.tasks : [];
      state.recentTasks = tasks
        .slice()
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt)
        )
        .slice(0, 10);
    },
    markTaskAsOverdue: (state, action) => {
      const taskId = action.payload;
      const tasks = Array.isArray(state.tasks) ? state.tasks : [];
      const task = tasks.find((t) => t._id === taskId);
      if (task && task.status !== "completed" && task.status !== "cancelled") {
        task.status = "overdue";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        const payload = Array.isArray(action.payload) ? action.payload : [];
        state.tasks = payload;
        state.pagination.total = payload.length;
        tasksSlice.caseReducers.calculateStats(state);
        tasksSlice.caseReducers.updateRecentTasks(state);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
        state.pagination.total += 1;
        tasksSlice.caseReducers.calculateStats(state);
        tasksSlice.caseReducers.updateRecentTasks(state);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(
          (t) => t._id === action.payload._id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask && state.currentTask._id === action.payload._id) {
          state.currentTask = action.payload;
        }
        tasksSlice.caseReducers.calculateStats(state);
        tasksSlice.caseReducers.updateRecentTasks(state);
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentTask && state.currentTask._id === action.payload) {
          state.currentTask = null;
        }
        tasksSlice.caseReducers.calculateStats(state);
        tasksSlice.caseReducers.updateRecentTasks(state);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update task status
      .addCase(updateTaskStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          (t) => t._id === action.payload._id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask && state.currentTask._id === action.payload._id) {
          state.currentTask = action.payload;
        }
        tasksSlice.caseReducers.calculateStats(state);
        tasksSlice.caseReducers.updateRecentTasks(state);
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch task by ID
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add task comment
      .addCase(addTaskComment.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          (t) => t._id === action.payload._id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask && state.currentTask._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })

      // Update task checklist
      .addCase(updateTaskChecklist.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          (t) => t._id === action.payload._id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask && state.currentTask._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      });
  },
});

export const {
  setFilters,
  setPagination,
  clearCurrentTask,
  clearError,
  updateTaskInList,
  calculateStats,
  updateRecentTasks,
  markTaskAsOverdue,
} = tasksSlice.actions;

// Selectors
export const selectTasks = (state) => state.tasks.tasks;
export const selectCurrentTask = (state) => state.tasks.currentTask;
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;
export const selectTasksFilters = (state) => state.tasks.filters;
export const selectTasksPagination = (state) => state.tasks.pagination;
export const selectTasksStats = (state) => state.tasks.stats;
export const selectRecentTasks = (state) => state.tasks.recentTasks;

export const selectFilteredTasks = (state) => {
  const { tasks, filters } = state.tasks;
  const { search, status, type, priority, assignee, client, dateRange } =
    filters;

  return tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      status === "all" ||
      (status === "overdue"
        ? task.status !== "completed" &&
          task.status !== "cancelled" &&
          task.dueDate &&
          dayjs(task.dueDate).isBefore(dayjs())
        : task.status === status);

    const matchesType = type === "all" || task.type === type;
    const matchesPriority = priority === "all" || task.priority === priority;
    const matchesAssignee =
      assignee === "all" || task.assignedTo?._id === assignee;
    const matchesClient = client === "all" || task.client?._id === client;

    let matchesDateRange = true;
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      const taskDate = dayjs(task.dueDate || task.createdAt);
      matchesDateRange = taskDate.isBetween(start, end, "day", "[]");
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesPriority &&
      matchesAssignee &&
      matchesClient &&
      matchesDateRange
    );
  });
};

export const selectTasksByStatus = (state) => {
  const tasks = state.tasks.tasks;
  const now = dayjs();

  return {
    pending: tasks.filter((t) => t.status === "pending"),
    inProgress: tasks.filter((t) => t.status === "in-progress"),
    completed: tasks.filter((t) => t.status === "completed"),
    cancelled: tasks.filter((t) => t.status === "cancelled"),
    overdue: tasks.filter(
      (t) =>
        t.status !== "completed" &&
        t.status !== "cancelled" &&
        t.dueDate &&
        dayjs(t.dueDate).isBefore(now)
    ),
  };
};

export const selectTasksByPriority = (state) => {
  const tasks = state.tasks.tasks;
  return {
    low: tasks.filter((t) => t.priority === "low"),
    medium: tasks.filter((t) => t.priority === "medium"),
    high: tasks.filter((t) => t.priority === "high"),
    urgent: tasks.filter((t) => t.priority === "urgent"),
  };
};

export const selectTasksByType = (state) => {
  const tasks = state.tasks.tasks;
  return tasks.reduce((acc, task) => {
    const type = task.type || "general";
    if (!acc[type]) acc[type] = [];
    acc[type].push(task);
    return acc;
  }, {});
};

export const selectUpcomingTasks = (state) => {
  const tasks = state.tasks.tasks;
  const now = dayjs();
  const weekFromNow = now.add(7, "day");

  return tasks
    .filter(
      (t) =>
        t.status !== "completed" &&
        t.status !== "cancelled" &&
        t.dueDate &&
        dayjs(t.dueDate).isAfter(now) &&
        dayjs(t.dueDate).isBefore(weekFromNow)
    )
    .sort((a, b) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix());
};

export const selectOverdueTasks = (state) => {
  const tasks = state.tasks.tasks;
  const now = dayjs();

  return tasks
    .filter(
      (t) =>
        t.status !== "completed" &&
        t.status !== "cancelled" &&
        t.dueDate &&
        dayjs(t.dueDate).isBefore(now)
    )
    .sort((a, b) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix());
};

export default tasksSlice.reducer;
