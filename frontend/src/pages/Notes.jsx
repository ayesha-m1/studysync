// src/pages/Notes.jsx
import { useState, useEffect } from 'react';
import { Plus, Search, Pin, PinOff, Edit2, Trash2, X, Save, Filter } from 'lucide-react';
import api from '../utils/api';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    color: 'yellow'
  });

  const colors = {
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    pink: 'bg-pink-50 border-pink-200',
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notes');
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote.id}`, formData);
      } else {
        await api.post('/notes', formData);
      }
      fetchNotes();
      closeModal();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleTogglePin = async (note) => {
    try {
      await api.patch(`/notes/${note.id}/pin`);
      fetchNotes();
    } catch (error) {
      console.error('Error pinning note:', error);
    }
  };

  const openModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content || '',
        category: note.category || 'general',
        color: note.color || 'yellow'
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        category: 'general',
        color: 'yellow'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNote(null);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Notes</h1>
              <p className="text-sm text-gray-600 mt-1">Organize your study notes and ideas</p>
            </div>
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm md:text-base"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="study">Study</option>
              <option value="idea">Idea</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="text-center py-12">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No notes yet. Click "New Note" to get started!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Pin className="w-4 h-4" /> Pinned
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinnedNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      colors={colors}
                      onEdit={() => openModal(note)}
                      onDelete={() => handleDelete(note.id)}
                      onPin={() => handleTogglePin(note)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Notes */}
            {unpinnedNotes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">All Notes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unpinnedNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      colors={colors}
                      onEdit={() => openModal(note)}
                      onDelete={() => handleDelete(note.id)}
                      onPin={() => handleTogglePin(note)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingNote ? 'Edit Note' : 'New Note'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />

              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="general">General</option>
                <option value="study">Study</option>
                <option value="idea">Idea</option>
                <option value="reminder">Reminder</option>
              </select>

              <div className="flex gap-2">
                {Object.keys(colors).map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full ${colors[color]} border-2 ${
                      formData.color === color ? 'border-indigo-600' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>

              <textarea
                placeholder="Write your note here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2 border border-gray-300 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  {editingNote ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Note Card Component
function NoteCard({ note, colors, onEdit, onDelete, onPin }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`rounded-xl p-4 border ${colors[note.color] || colors.yellow} hover:shadow-md transition-all relative group`}>
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-900 pr-12">{note.title}</h3>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            ⋮
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[100px]">
              <button
                onClick={() => { onPin(); setShowMenu(false); }}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                {note.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                {note.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={() => { onEdit(); setShowMenu(false); }}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={() => { onDelete(); setShowMenu(false); }}
                className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mt-2 line-clamp-3">{note.content}</p>
      
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
        <span className="text-xs text-gray-400 capitalize">{note.category}</span>
        <span className="text-xs text-gray-400">
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}