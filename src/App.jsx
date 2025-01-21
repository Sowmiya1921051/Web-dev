import React, { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';
import { Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import toast, { Toaster } from 'react-hot-toast';

const TaskListManager = () => {
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [table, setTable] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'To Do' });
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);

  useEffect(() => {
    // Fetch initial task data from the API
    fetch('https://jsonplaceholder.typicode.com/todos')
      .then((response) => response.json())
      .then((data) => {
        const formattedData = data.slice(0, 20).map((task) => ({
          id: task.id,
          title: task.title,
          description: `Description for task ${task.id}`,
          status: task.completed ? 'Done' : 'To Do',
        }));
        setTasks(formattedData);
      });
  }, []);

  useEffect(() => {
    // Initialize Tabulator table
    if (tasks.length > 0) {
      const newTable = new Tabulator('#task-table', {
        data: tasks,
        layout: 'fitColumns',
        columns: [
          { title: 'Task ID', field: 'id', width: 80, headerSort: false },
          { title: 'Title', field: 'title', editor: 'input' },
          { title: 'Description', field: 'description', editor: 'input' },
          {
            title: 'Status',
            field: 'status',
            editor: 'select',
            editorParams: {
              values: ['To Do', 'In Progress', 'Done'],
            },
          },
          {
            title: 'Actions',
            formatter: () => '<button class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>',
            width: 100,
            cellClick: (e, cell) => {
              handleDelete(cell.getRow().getData().id);
            },
          },
        ],
      });
      setTable(newTable);
    }
  }, [tasks]);

  const handleAddTask = () => {
    if (!newTask.title || !newTask.description) {
      toast.error('Please fill in all fields.');
      return;
    }

    const newTaskWithId = {
      id: tasks.length + 1,
      ...newTask,
    };
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTaskWithId];
      table.setData(updatedTasks);
      return updatedTasks;
    });
    setNewTask({ title: '', description: '', status: 'To Do' });
    setShowAddTaskForm(false);
    toast.success('Task added successfully!');
  };

  const handleDelete = (taskId) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((task) => task.id !== taskId);
      table.setData(updatedTasks);
      return updatedTasks;
    });
    toast.success('Task deleted successfully!');
  };

  const handleFilter = (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    if (status) {
      table.setFilter('status', '=', status);
    } else {
      table.clearFilter();
    }
  };

  return (
    <div className="p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Task List Manager</h1>

      <div className="mb-4">
        <button
          onClick={() => setShowAddTaskForm(!showAddTaskForm)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {showAddTaskForm ? 'Hide Add Task Form' : 'Show Add Task Form'}
        </button>

        {showAddTaskForm && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Add New Task</h2>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="border px-3 py-2 rounded"
              />
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                className="border px-3 py-2 rounded"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <button
              onClick={handleAddTask}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            >
              Add Task
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <select
          value={filterStatus}
          onChange={handleFilter}
          className="border rounded px-3 py-2"
        >
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      <div id="task-table" className="mb-4"></div>
    </div>
  );
};

export default TaskListManager;
