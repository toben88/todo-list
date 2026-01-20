// Copy your entire CNNTodoList component code here 
import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Trash2, Plus, Menu, X, Home, Settings, User, ChevronRight, GripVertical } from 'lucide-react';

const API_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000/data/todos.php'
  : './data/todos.php';

const SETTINGS_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000/data/settings.php'
  : './data/settings.php';

const VISITORS_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000/data/visitors.php'
  : './data/visitors.php';

// Available accent colors
const ACCENT_COLORS = [
  { name: 'Blue', value: '#2563EB' },
  { name: 'Red', value: '#DC2626' },
  { name: 'Green', value: '#16A34A' },
  { name: 'Purple', value: '#9333EA' },
  { name: 'Orange', value: '#EA580C' },
  { name: 'Pink', value: '#DB2777' },
  { name: 'Teal', value: '#0D9488' },
];

const CNNTodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('active');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dragEnabled, setDragEnabled] = useState(true);
  const [accentColor, setAccentColor] = useState('#2563EB');
  const [pageTitle, setPageTitle] = useState("TODAY'S TASKS");
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Load settings from server
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(SETTINGS_URL);
        if (response.ok) {
          const data = await response.json();
          if (data.accentColor) setAccentColor(data.accentColor);
          if (data.title) setPageTitle(data.title);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Log visitor on page load
  useEffect(() => {
    const logVisitor = async () => {
      try {
        // Get or create visitor ID from localStorage
        let visitorId = localStorage.getItem('visitorId');

        const visitorData = {
          visitorId: visitorId, // null if first visit, server will handle
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          pixelRatio: window.devicePixelRatio,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          platform: navigator.platform,
          touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
          connectionType: navigator.connection?.effectiveType || null,
        };

        const response = await fetch(VISITORS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(visitorData),
        });

        // Server returns the visitor ID (existing or new)
        const result = await response.json();
        if (result.visitorId && result.visitorId !== visitorId) {
          localStorage.setItem('visitorId', result.visitorId);
        }
      } catch (error) {
        console.error('Error logging visitor:', error);
      }
    };
    logVisitor();
  }, []);

  // Save settings to server
  const saveSettings = async (newSettings) => {
    try {
      const response = await fetch(SETTINGS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Handle accent color change
  const handleAccentColorChange = (color) => {
    setAccentColor(color);
    saveSettings({ accentColor: color, title: pageTitle });
  };

  // Handle title change
  const handleTitleChange = (newTitle) => {
    setPageTitle(newTitle);
    saveSettings({ accentColor, title: newTitle });
  };

  // Add current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit'
  });

  // Load todos from server
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch todos');
        const data = await response.json();
        console.log('Fetched data:', data);
        // Add debug log to see IDs of todos
        console.log('Todo IDs from server:', data.todos ? data.todos.map(t => ({id: t.id, type: typeof t.id})) : []);
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
    console.log('Drag end result:', result);
    
    // If dropped outside the list or no destination
    if (!result.destination) {
      console.log('No destination, dropping outside or cancelled');
      return;
    }

    // Get source and destination indices
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    // Clone the current filtered list that's being displayed
    const currentItems = [...filteredTodos];
    console.log('Current filtered items:', currentItems.map(t => ({id: t.id, text: t.text})));
    
    // Get the item being moved
    const [movedItem] = currentItems.splice(sourceIndex, 1);
    console.log('Moving item:', movedItem);
    
    // Insert at the new position
    currentItems.splice(destinationIndex, 0, movedItem);
    
    // Update all order values to match new positions
    const updatedTodos = todos.map(todo => {
      // Find this item in the reordered filtered list
      const newPosition = currentItems.findIndex(item => String(item.id) === String(todo.id));
      
      // If this item is in the filtered list, update its order
      if (newPosition !== -1) {
        return { ...todo, order: newPosition };
      }
      
      // Otherwise keep its current order
      return todo;
    });
    
    console.log('Updated todos:', updatedTodos.map(t => ({id: t.id, order: t.order})));
    
    // Update state and save to server
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  // Add debug log for current filter
  console.log('Current filter:', filter);

  // Ensure filteredTodos has stable IDs before rendering draggables
  const filteredTodos = useMemo(() => {
    // Debug log for todos before filtering
    console.log('Todos before filtering:', todos.map(t => ({id: t.id, type: typeof t.id})));
    
    return todos
      .sort((a, b) => a.order - b.order)
      .filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
      });
  }, [todos, filter]);

  // Add more detailed logging
  console.log('Total todos:', todos.length);
  console.log('Filtered todos:', filteredTodos.length);

  const MenuItem = ({ icon, text, onClick }) => {
    return (
      <div
        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
        onClick={onClick}
      >
        {icon}
        <span>{text}</span>
      </div>
    );
  };

  // Handle Enter key in input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTodo();
    }
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
    setShowProfile(false);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setShowSettings(false);
  };

  // Handle double-click to edit todo
  const handleTodoDoubleClick = (todo) => {
    setEditingTodoId(todo.id);
    setEditingText(todo.text);
  };

  // Save edited todo
  const handleEditSave = async (id) => {
    if (!editingText.trim()) return;
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, text: editingText.trim() } : todo
    );
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
    setEditingTodoId(null);
    setEditingText('');
  };

  // Handle edit key press (Enter to save, Escape to cancel)
  const handleEditKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSave(id);
    } else if (e.key === 'Escape') {
      setEditingTodoId(null);
      setEditingText('');
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
  console.log('Filtered todos for dragging:', filteredTodos.map(t => t.id));

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg relative">
      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Side Menu */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <span className="font-bold text-xl">{showSettings ? 'Settings' : showProfile ? 'Profile' : 'Menu'}</span>
          <button onClick={() => { setIsMenuOpen(false); setShowSettings(false); setShowProfile(false); }} className="text-gray-500 hover:text-blue-600">
            <X size={24} />
          </button>
        </div>
        <div className="py-2">
          {showSettings ? (
            <div className="p-4">
              <button
                onClick={() => setShowSettings(false)}
                className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-800"
              >
                <ChevronRight size={16} className="rotate-180" />
                Back
              </button>
              <div className="mb-4">
                <h3 className="font-semibold mb-3">Accent Color</h3>
                <div className="grid grid-cols-4 gap-2">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleAccentColorChange(color.value)}
                      className={`w-10 h-10 rounded-full border-2 ${accentColor === color.value ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                  <label
                    className={`w-10 h-10 rounded-full border-2 cursor-pointer flex items-center justify-center ${!ACCENT_COLORS.some(c => c.value === accentColor) ? 'border-gray-800 scale-110' : 'border-gray-300'}`}
                    style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
                    title="Custom color"
                  >
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => handleAccentColorChange(e.target.value)}
                      className="sr-only"
                    />
                  </label>
                </div>
                {!ACCENT_COLORS.some(c => c.value === accentColor) && (
                  <p className="text-xs text-gray-500 mt-2">Custom: {accentColor}</p>
                )}
              </div>
            </div>
          ) : showProfile ? (
            <div className="p-4">
              <button
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-800"
              >
                <ChevronRight size={16} className="rotate-180" />
                Back
              </button>
              <div className="mb-4">
                <h3 className="font-semibold mb-3">Page Title</h3>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  onBlur={() => handleTitleChange(pageTitle)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTitleChange(pageTitle);
                      e.target.blur();
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter page title"
                />
                <p className="text-xs text-gray-500 mt-2">Press Enter or click away to save</p>
              </div>
            </div>
          ) : (
            <>
              <MenuItem icon={<Home size={20} />} text="Home" />
              <MenuItem icon={<Settings size={20} />} text="Settings" onClick={handleSettingsClick} />
              <MenuItem icon={<User size={20} />} text="Profile" onClick={handleProfileClick} />
            </>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center mb-4">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-gray-100 rounded mr-4">
            ☰
          </button>
          <div className="flex-1 border-b-4" style={{ borderColor: accentColor }}>
            <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
            <div className="text-gray-500 text-sm mb-4">{currentDate}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 text-sm">
          <button
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'font-bold' : 'text-gray-600'}
            style={filter === 'active' ? { color: accentColor } : {}}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'font-bold' : 'text-gray-600'}
            style={filter === 'completed' ? { color: accentColor } : {}}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'font-bold' : 'text-gray-600'}
            style={filter === 'all' ? { color: accentColor } : {}}
          >
            All
          </button>
        </div>

        {/* Todo List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="mb-6">
            <Droppable droppableId="todos">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {filteredTodos.map((todo, index) => {
                    // Ensure ID is a string and log it for debugging
                    const stringId = String(todo.id);
                    // Log each ID right before creating the Draggable
                    console.log(`Creating Draggable [${index}]: ID=${stringId}, Original type: ${typeof todo.id}`);
                    
                    return (
                      <Draggable 
                        key={stringId}
                        draggableId={stringId}
                        index={index}
                        isDragDisabled={!dragEnabled}
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
                            <div className="flex items-center gap-4 flex-1">
                              <div className="cursor-grab text-gray-400">
                                <GripVertical size={18} />
                              </div>
                              <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => toggleTodo(todo.id)}
                                className="w-5 h-5 border-2 border-gray-300 rounded"
                              />
                              {editingTodoId === todo.id ? (
                                <input
                                  type="text"
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  onKeyDown={(e) => handleEditKeyPress(e, todo.id)}
                                  onBlur={() => handleEditSave(todo.id)}
                                  className="flex-1 p-1 border border-gray-300 rounded"
                                  autoFocus
                                />
                              ) : (
                                <span
                                  className={`${todo.completed ? 'line-through text-gray-500' : ''} cursor-pointer`}
                                  onDoubleClick={() => handleTodoDoubleClick(todo)}
                                  title="Double-click to edit"
                                >
                                  {todo.text}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-500">
                                {new Date(todo.time).toLocaleDateString('en-US', { 
                                  month: 'numeric',
                                  day: 'numeric',
                                  year: '2-digit'
                                })}
                              </span>
                              <button 
                                onClick={() => deleteTodo(todo.id)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
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
              className="text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: accentColor }}
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