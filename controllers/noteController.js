const Note = require('../models/noteModel');

exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.getAll();
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notes', error: error.message });
    }
};

exports.getNoteById = async (req, res) => {
    try {
        const note = await Note.getById(req.params.id);
        if (note) res.status(200).json(note);
        else res.status(404).json({ message: 'Note not found' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching note', error: error.message });
    }
};

exports.addNote = async (req, res) => {
    try {
        let noteData = req.body;
        if (typeof noteData.blocks === 'string') {
           noteData.blocks = JSON.parse(noteData.blocks);
        }

        if (req.files && req.files.length > 0) {
            let fileIdx = 0;
            for (let b of noteData.blocks) {
                if (b.type === 'image' && fileIdx < req.files.length) {
                    // Only replace if it's a local/temp path
                    if (!b.data.startsWith('upload/')) {
                       b.data = req.files[fileIdx].path.replace(/\\/g, '/');
                       fileIdx++;
                    }
                }
            }
        }

        const id = await Note.create(noteData);
        res.status(201).json({ message: 'Note added successfully', id });
    } catch (error) {
        res.status(500).json({ message: 'Error adding note', error: error.message });
    }
};

exports.updateNote = async (req, res) => {
    try {
        let noteData = req.body;
        if (typeof noteData.blocks === 'string') {
           noteData.blocks = JSON.parse(noteData.blocks);
        }

        if (req.files && req.files.length > 0) {
            let fileIdx = 0;
            for (let b of noteData.blocks) {
                if (b.type === 'image' && fileIdx < req.files.length) {
                   if (!b.data.startsWith('upload/')) {
                       b.data = req.files[fileIdx].path.replace(/\\/g, '/');
                       fileIdx++;
                   }
                }
            }
        }

        await Note.update(req.params.id, noteData);
        res.status(200).json({ message: 'Note updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating note', error: error.message });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        await Note.delete(req.params.id);
        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting note', error: error.message });
    }
};
