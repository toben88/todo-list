// Copy your entire CNNTodoList component code here 
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Trash2, Plus, Menu, X, Home, Settings, User, ChevronRight, GripVertical } from 'lucide-react';

const API_URL = '/todo/data/todos.php';

const CNNTodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('active');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Load todos from server
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch todos');
        const data = await response.json();
        console.log('Fetched data:', data);
        setTodos(data.todos || []);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error loading todos:', error);
        setError('Failed to load todos. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, []);

  // Save todos to server
  const saveTodos = async (updatedTodos) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTodos),
      });
      
      if (!response.ok) throw new Error('Failed to save todos');
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error saving todos:', error);
      setError('Failed to save changes. Please try again.');
    }
  };

  // Changed from form submission to direct click handler
  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    
    const newTodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      time: new Date().toISOString(),
      order: todos.length
    };

    const updatedTodos = [...todos, newTodoItem];
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
    setNewTodo('');
  };

  const toggleTodo = async (id) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const deleteTodo = async (id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const currentFilteredTodos = todos.filter(todo => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    });

    // Get moved item and its new position
    const movedItem = currentFilteredTodos[result.source.index];
    const targetItem = currentFilteredTodos[result.destination.index];
    
    // Create new array with updated order
    const newTodos = todos.map(todo => {
      if (todo.id === movedItem.id) {
        // Moving down
        if (result.source.index < result.destination.index) {
          return { ...todo, order: targetItem.order + 0.5 };
        }
        // Moving up
        return { ...todo, order: targetItem.order - 0.5 };
      }
      return todo;
    });

    // Normalize all order numbers
    const sortedTodos = newTodos
      .sort((a, b) => a.order - b.order)
      .map((todo, index) => ({ ...todo, order: index }));

    setTodos(sortedTodos);
    await saveTodos(sortedTodos);
  };

  // Add debug log for current filter
  console.log('Current filter:', filter);

  const filteredTodos = todos
    .sort((a, b) => a.order - b.order)
    .filter(todo => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    });

  // Add more detailed logging
  console.log('Total todos:', todos.length);
  console.log('Filtered todos:', filteredTodos.length);

  const MenuItem = ({ icon: Icon, text }) => (
    <button className="flex items-center w-full p-4 hover:bg-gray-100 text-gray-700">
      <Icon size={20} className="mr-3" />
      <span className="flex-1 text-left">{text}</span>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );

  // Handle Enter key in input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTodo();
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Error: {error}</div>;
  }

  // Add debug render check
  console.log('Rendering with todos:', todos.length > 0);

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg relative">
      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Side Menu */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <span className="font-bold text-xl">Menu</span>
          <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-red-600">
            <X size={24} />
          </button>
        </div>
        <div className="py-2">
          <button className="flex items-center w-full p-4 hover:bg-gray-100 text-gray-700">
            <Home size={20} className="mr-3" />
            <span>Home</span>
          </button>
          <button className="flex items-center w-full p-4 hover:bg-gray-100 text-gray-700">
            <Settings size={20} className="mr-3" />
            <span>Settings</span>
          </button>
          <button className="flex items-center w-full p-4 hover:bg-gray-100 text-gray-700">
            <User size={20} className="mr-3" />
            <span>Profile</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center mb-4">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-gray-100 rounded mr-4">
            ☰
          </button>
          <div className="flex-1 border-b-4 border-red-600">
            <h1 className="text-3xl font-bold mb-2">TODAY'S TASKS</h1>
            <div className="text-gray-500 text-sm mb-4">{currentDate}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 text-sm">
          <button
            onClick={() => setFilter('active')}
            className={`${filter === 'active' ? 'text-red-600 font-bold' : 'text-gray-600'}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`${filter === 'completed' ? 'text-red-600 font-bold' : 'text-gray-600'}`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`${filter === 'all' ? 'text-red-600 font-bold' : 'text-gray-600'}`}
          >
            All
          </button>
        </div>

        {/* Todo List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="todos">
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3 mb-6"
              >
                {filteredTodos.map((todo, index) => (
                  <Draggable 
                    key={todo.id.toString()}
                    draggableId={todo.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded ${
                          snapshot.isDragging ? 'shadow-lg' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="cursor-grab text-gray-400">
                            <GripVertical size={18} />
                          </div>
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                            className="w-5 h-5 border-2 border-gray-300 rounded"
                          />
                          <span className={`${todo.completed ? 'line-through text-gray-500' : ''}`}>
                            {todo.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500">
                            {new Date(todo.time).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </span>
                          <button 
                            onClick={() => deleteTodo(todo.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add Todo Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new task"
              className="flex-1 p-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleAddTodo}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CNNTodoList;