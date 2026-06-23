import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  closestCorners 
} from '@dnd-kit/core';
import ExecutiveAnalytics from './ExecutiveAnalytics';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskDetailDrawer from './TaskDetailDrawer';

const COLUMNS = ['To Do', 'In Progress', 'Code Review', 'Done'];

const KanbanBoard = ({ tasks, team, currentUser, onMoveTask, onUpdateTask, onDeleteTask, onSelectTask, onCreateTask }) => {
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const activeTask = tasks.find(t => t.id === activeTaskId);

  const handleDragStart = (event) => {
    setActiveTaskId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTaskId(null);
      return;
    }

    const activeTaskData = tasks.find(t => t.id === active.id);
    const overId = over.id;

    // Check if over a column or another task
    let newStatus = overId;
    if (!COLUMNS.includes(overId)) {
      const overTask = tasks.find(t => t.id === overId);
      newStatus = overTask?.status;
    }

    if (activeTaskData && newStatus && activeTaskData.status !== newStatus) {
      onMoveTask(activeTaskData.id, newStatus);
    }

    setActiveTaskId(null);
  };

  return (
    <div className="p-6 min-h-full">
      <ExecutiveAnalytics tasks={tasks} />
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[500px]">
          {COLUMNS.map(column => (
            <KanbanColumn 
              key={column} 
              id={column} 
              title={column} 
              tasks={tasks.filter(t => t.status === column)}
              onSelectTask={setEditingTask}
              onCreateTask={onCreateTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-full opacity-80 cursor-grabbing">
              <TaskCard task={activeTask} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {editingTask && (
        <TaskDetailDrawer 
          task={editingTask} 
          team={team}
          currentUser={currentUser}
          onClose={() => setEditingTask(null)}
          onDelete={() => {
            if (onDeleteTask) {
              onDeleteTask(editingTask);
            }
            setEditingTask(null);
          }}
          onSave={(updated) => {
            if (onUpdateTask) onUpdateTask(updated);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
