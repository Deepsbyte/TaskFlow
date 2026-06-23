import React, { useState, useReducer, useEffect, useCallback } from 'react';
import SidebarRail from './components/layout/SidebarRail';
import SidePanel from './components/layout/SidePanel';
import TopBar from './components/layout/TopBar';
import KanbanBoard from './components/board/KanbanBoard';
import Timeline from './components/timeline/Timeline';
import Backlog from './components/backlog/Backlog';
import CodePanel from './components/code/CodePanel';
import ReleasesPanel from './components/releases/ReleasesPanel';
import SettingsPanel from './components/settings/SettingsPanel';
import SearchModal from './components/search/SearchModal';
import CreateTaskModal from './components/tasks/CreateTaskModal';
import Login from './pages/Login';
import { APP_DATA } from './data/mockData';
import { taskApi } from './api/client';

// Reducer for state management
const dataReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => (t.backendId === action.payload.backendId || t.id === action.payload.id) ? action.payload : t)
      };
    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => 
          (t.id === action.payload.taskId) ? { ...t, status: action.payload.newStatus } : t
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload.taskId)
      };
    case 'SET_TEAM':
      return { ...state, team: action.payload };
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(dataReducer, { ...APP_DATA, tasks: [] });
  const [, setDefaultProjectId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('access')));
  const [activeView, setActiveView] = useState('Kanban Board');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [, setSelectedTaskId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch({ type: 'SET_TASKS', payload: [] });
      return;
    }

    try {
      const [tasks, projects, me] = await Promise.all([
        taskApi.getTasks(),
        taskApi.getProjects(),
        taskApi.getMe(),
      ]);

      dispatch({ type: 'SET_TASKS', payload: tasks });
      setCurrentUser(me);

      // Extract unique members from all projects to build the live team list
      if (projects.length > 0) {
        setDefaultProjectId(projects[0].id);
        const allMembers = new Map();
        projects.forEach(p => {
          p.members.forEach(m => {
            allMembers.set(m.id, {
              id: m.id,
              name: m.full_name || m.username,
              role: m.role_display || m.role,
              email: m.email || ''
            });
          });
        });
        dispatch({ type: 'SET_TEAM', payload: Array.from(allMembers.values()) });
      } else if (tasks.length > 0 && tasks[0].projectId) {
        setDefaultProjectId(tasks[0].projectId);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('access');
        setIsAuthenticated(false);
      }
      console.error('Failed to fetch mission data:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMoveTask = async (taskId, newStatus) => {
    // Optimistic update
    dispatch({ type: 'MOVE_TASK', payload: { taskId, newStatus } });
    
    // API call
    const task = state.tasks.find(t => t.id === taskId);
    if (task && task.backendId) {
      try {
        await taskApi.updateTask(task.backendId, { status: newStatus });
      } catch (err) {
        console.error("Failed to sync trajectory move:", err);
        fetchData();
      }
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    // 1. Optimistic Update
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    
    if (updatedTask.backendId) {
      try {
        const savedRaw = await taskApi.updateTask(updatedTask.backendId, updatedTask);
        // 2. Verified Update (from server)
        dispatch({ type: 'UPDATE_TASK', payload: savedRaw });
      } catch (err) {
        console.error("Failed to update mission parameters on server:", err);
        // Fallback or Refresh
        fetchData();
      }
    }
  };

  

  const handleDeleteTask = async (task) => {
    if (!task?.backendId) return;

    dispatch({ type: 'DELETE_TASK', payload: { taskId: task.id } });

    try {
      await taskApi.deleteTask(task.backendId);
    } catch (err) {
      console.error('Failed to delete task:', err);
      fetchData();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access');
    setIsAuthenticated(false);
    setCurrentUser(null);
    dispatch({ type: 'SET_TASKS', payload: [] });
  };

  // Keyboard shortcut CMD+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'Kanban Board': return <KanbanBoard tasks={state.tasks} team={state.team} currentUser={currentUser} onMoveTask={handleMoveTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onSelectTask={setSelectedTaskId} />;
      case 'Timeline': return <Timeline tasks={state.tasks} />;
      case 'Backlog': return <Backlog tasks={state.tasks} team={state.team} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onSelectTask={setSelectedTaskId} />;
      case 'Code + Git': return <CodePanel commits={state.commits} prs={state.prs} />;
      case 'Releases': return <ReleasesPanel releases={state.releases} />;
      case 'Project Settings': return <SettingsPanel team={state.team} />;
      default: return <KanbanBoard tasks={state.tasks} team={state.team} currentUser={currentUser} onMoveTask={handleMoveTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onSelectTask={setSelectedTaskId} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background-base text-white">
      {/* Sidebar Rail (60px) */}
      <SidebarRail 
        onSearch={() => setIsSearchOpen(true)}
        onCreate={() => setIsCreateOpen(true)}
        activeView={activeView}
        onSetActiveView={setActiveView}
        user={currentUser}
      />

      {/* Side Panel (220px) */}
      <SidePanel 
        activeView={activeView} 
        onSetActiveView={setActiveView} 
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar activeView={activeView} setActiveView={setActiveView} team={state.team} />
        
        <main className="flex-1 overflow-auto bg-background-base custom-scrollbar">
          {activeView === 'Kanban Board' ? (
            <KanbanBoard 
              tasks={state.tasks} 
              team={state.team}
              currentUser={currentUser}
              onMoveTask={handleMoveTask} 
              onUpdateTask={handleUpdateTask} 
              onDeleteTask={handleDeleteTask} 
              onSelectTask={setSelectedTaskId}
              onCreateTask={() => setIsCreateOpen(true)}
            />
          ) : renderView()}
        </main>
      </div>

      {/* Modals & Overlays */}
      {isSearchOpen && (
        <SearchModal 
          tasks={state.tasks} 
          onClose={() => setIsSearchOpen(false)} 
          onSelectTask={(id) => {
            setSelectedTaskId(id);
            setIsSearchOpen(false);
          }}
        />
      )}
      
      {isCreateOpen && (
        <CreateTaskModal 
          onClose={() => setIsCreateOpen(false)} 
          onCreated={() => {
            setIsCreateOpen(false);
            fetchData();
          }}
        />
      )}

      {/* Task detail drawer could go here or inside specific views */}
    </div>
  );
}

export default App;