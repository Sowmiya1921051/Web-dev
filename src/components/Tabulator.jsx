import React, { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';
import { Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import toast, { Toaster } from 'react-hot-toast';

const TaskListManager = () => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [table, setTable] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'To Do' });
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');

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
          completed: task.completed,
        }));
        setTasks(formattedData);
        setFilteredTasks(formattedData); // Set filtered tasks initially
      });
  }, []);

  useEffect(() => {
    // Initialize Tabulator table
    if (tasks.length > 0) {
      const newTable = new Tabulator('#task-table', {
        data: filteredTasks, // Use filteredTasks instead of tasks
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
            field: 'completed',
            formatter: (cell) => (cell.getValue() ? '✔️' : '❌'),
            width: 100,
          },
        ],
      });
      setTable(newTable);
    }
  }, [filteredTasks]);

  const handleAddTask = () => {
    if (!newTask.title || !newTask.description) {
      toast.error('Please fill in all fields.');
      return;
    }

    const newTaskWithId = {
      id: tasks.length + 1,
      ...newTask,
      completed: newTask.status === 'Done',
    };
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTaskWithId];
      setFilteredTasks(updatedTasks); // Update filtered tasks
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
      setFilteredTasks(updatedTasks); // Update filtered tasks
      table.setData(updatedTasks);
      return updatedTasks;
    });
    toast.success('Task deleted successfully!');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filteredTasks = tasks.filter((task) => {
      return (
        task.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
        task.description.toLowerCase().includes(e.target.value.toLowerCase())
      );
    });
    setFilteredTasks(filteredTasks);
    table.setData(filteredTasks);
  };

  const handleFilter = (status) => {
    setFilterStatus(status);
    if (status) {
      const filtered = tasks.filter((task) => task.status === status);
      setFilteredTasks(filtered);
      table.setData(filtered);
    } else {
      setFilteredTasks(tasks); // Reset filter
      table.setData(tasks);
    }
  };

  // Task counters by status
  const taskCounts = tasks.reduce(
    (counts, task) => {
      counts[task.status] = (counts[task.status] || 0) + 1;
      return counts;
    },
    { 'To Do': 0, 'In Progress': 0, Done: 0 }
  );

  return (
    <div className="p-4">
      <Toaster />
      <h1 className="text-2xl text-center font-bold mb-4">Task List Manager</h1>

      <div className="mb-4">
        <button
          onClick={() => setShowAddTaskForm(!showAddTaskForm)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {showAddTaskForm ? 'Hide Add Task Form' : 'Show Add Task Form'}
        </button>

        {showAddTaskForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative">
              {/* Close Button */}
              <button
                onClick={() => setShowAddTaskForm(false)} // Close the modal
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Add New Task</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input
                  type="text"
                  placeholder="Title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <button
                onClick={handleAddTask}
                className="mt-6 w-full sm:w-auto bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Add Task
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Flex container for Search and Dropdown (Responsive) */}
      <div className="mb-4 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={handleSearch}
          className="border-2 px-3 py-2 rounded w-full sm:w-1/2"
        />

        <select
          value={filterStatus}
          onChange={(e) => handleFilter(e.target.value)}
          className="border-2 px-3 py-2 rounded w-full sm:w-1/4"
        >
          <option value="">All Tasks</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Task Counters */}
      <div className="mb-4">
        <div className="flex justify-around text-xl text-pink-500 font-bold">
          <span>To Do: {taskCounts['To Do']}</span>
          <span>In Progress: {taskCounts['In Progress']}</span>
          <span>Done: {taskCounts.Done}</span>
        </div>
      </div>

      <div id="task-table" className="mb-4"></div>
    </div>
  );
};

export default TaskListManager;
