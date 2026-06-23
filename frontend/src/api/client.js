import apiClient from '../api';

const REV_PRIORITY_MAP = {
  'Low': 'low',
  'Medium': 'medium',
  'High': 'high',
  'Critical': 'high' // Django currently supports low/medium/high
};

const REV_STATUS_MAP = {
  'To Do': 'todo',
  'In Progress': 'in_progress',
  'Code Review': 'review',
  'In Review': 'review',
  'Done': 'done'
};

export const taskApi = {
  getTasks: async () => {
    const response = await apiClient.get('/tasks/');
    const tasks = Array.isArray(response.data) ? response.data : (response.data.results || []);
    return tasks.map(transformTaskFromBackend);
  },

  getProjects: async () => {
    const response = await apiClient.get('/projects/');
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  },
  
  createTask: async (task) => {
    const backendTask = transformTaskToBackend(task);
    const response = await apiClient.post('/tasks/', backendTask);
    return transformTaskFromBackend(response.data);
  },
  
  updateTask: async (id, updates) => {
    const backendUpdates = transformTaskToBackend(updates);
    const response = await apiClient.patch(`/tasks/${id}/`, backendUpdates);
    return transformTaskFromBackend(response.data);
  },

  deleteTask: async (id) => {
    await apiClient.delete(`/tasks/${id}/`);
  },

  getInsights: async () => {
    const response = await apiClient.get('/analytics/insights/');
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me/');
    return {
      id: response.data.id,
      username: response.data.username,
      name: response.data.full_name || response.data.username,
      initials: (response.data.full_name || response.data.username).split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      email: response.data.email,
      role: response.data.role_display
    };
  }
};

// Transformers
function transformTaskFromBackend(task) {
  const priorityByCode = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };

  const statusByCode = {
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'Code Review',
    done: 'Done',
  };

  return {
    id: `TIS-${task.id}`,
    backendId: task.id,
    title: task.title,
    description: task.description,
    priority: priorityByCode[task.priority] || task.priority_display || 'Medium',
    status: statusByCode[task.status] || task.status_display || 'To Do',
    assignee: task.assigned_to
      ? (task.assigned_to.full_name || task.assigned_to.username).split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
      : '??',
    assigneeId: task.assigned_to ? task.assigned_to.id : null,
    dueDate: task.deadline || '',
    projectId: typeof task.project === 'number' ? task.project : (task.project?.id || undefined),
    points: 5, 
    sprint: 'Active Cycle',
    tags: ['Mission']
  };
}

function transformTaskToBackend(task) {
  const transformed = {};
  if (typeof task.title === 'string') transformed.title = task.title;
  if (typeof task.description === 'string') transformed.description = task.description;
  if (task.priority) transformed.priority = REV_PRIORITY_MAP[task.priority] || task.priority;
  if (task.status) transformed.status = REV_STATUS_MAP[task.status] || task.status;
  if (Object.prototype.hasOwnProperty.call(task, 'dueDate')) transformed.deadline = task.dueDate || null;
  if (task.projectId) transformed.project = task.projectId;
  if (task.assignedToId !== undefined) transformed.assigned_to_id = task.assignedToId;

  return transformed;
}
