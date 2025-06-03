import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface Task {
  id: string;
  title: string;
  status: string;
}

interface BoardListProps {
  title: string;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: string) => void;
}

const BoardList: React.FC<BoardListProps> = ({ title, tasks, onTaskMove }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string }) => {
      onTaskMove(item.id, title.toLowerCase());
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`bg-white rounded-lg p-4 min-w-[280px] ${
        isOver ? 'bg-gray-100' : ''
      }`}
    >
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {tasks
          .filter((task) => task.status.toLowerCase() === title.toLowerCase())
          .map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
      </div>
    </div>
  );
};

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-white p-3 rounded shadow-sm cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {task.title}
    </div>
  );
};

export default BoardList;