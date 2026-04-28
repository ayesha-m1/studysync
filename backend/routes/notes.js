
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Note = require('../models/Note');

// Get all notes for user
router.get('/', protect, async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { userId: req.user.id },
      order: [['isPinned', 'DESC'], ['updatedAt', 'DESC']]
    });
    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single note
router.get('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create note
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, category, color } = req.body;
    const note = await Note.create({
      userId: req.user.id,
      title: title || 'Untitled',
      content: content || '',
      category: category || 'general',
      color: color || 'yellow'
    });
    res.status(201).json({ success: true, note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update note
router.put('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    
    await note.update(req.body);
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete note
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    
    await note.destroy();
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle pin
router.patch('/:id/pin', protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    
    await note.update({ isPinned: !note.isPinned });
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;