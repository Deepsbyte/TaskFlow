import { useState, useEffect, useCallback } from 'react';
import api from '../api';

const BACKEND_TO_FRONTEND_STATUS = {
  todo: "todo",
  in_progress: "inprogress",
  review: "review",
  done: "done"
};

const FRONTEND_TO_BACKEND_STATUS = {
  todo: "todo",
  inprogress: "in_progress",
  review: "review",
  done: "done"
};

export default function useTasks() {
  const [data, setData] = useState({ todo: [], inprogress: [], review: [], done: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("tasks/");
      const columns = { todo: [], inprogress: [], review: [], done: [] };
      const tasks = Array.isArray(res.data) ? res.data : (res.data.results || []);
      
      tasks.forEach((task) => {
        const colKey = BACKEND_TO_FRONTEND_STATUS[task.status] || "todo";
        columns[colKey].push(task);
      });
      setData(columns);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateTaskStatus = async (taskId, sourceColumn, destinationColumn) => {
    if (!sourceColumn || sourceColumn === destinationColumn) return;

    setData((prev) => {
      const taskToMove = prev[sourceColumn].find((t) => t.id === taskId);
      if (!taskToMove) return prev;
      return {
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter((t) => t.id !== taskId),
        [destinationColumn]: [...prev[destinationColumn], { ...taskToMove, status: FRONTEND_TO_BACKEND_STATUS[destinationColumn] }],
      };
    });

    try {
      await api.patch(`tasks/${taskId}/`, { status: FRONTEND_TO_BACKEND_STATUS[destinationColumn] });
    } catch (err) {
      console.error("Failed to update status:", err);
      fetchTasks();
      throw new Error("API sync failed. Permission denied.");
    }
  };

  const addTask = async (taskData) => {
    try {
      const res = await api.post("tasks/", taskData);
      // Re-fetch to guarantee sync, or optimistically push. Re-fetch is safer for getting the new ID and backend defaults.
      await fetchTasks();
      return res.data;
    } catch (err) {
      console.error("Creation failed", err);
      throw err;
    }
  };

  return { data, loading, error, updateTaskStatus, addTask, fetchTasks };
}
