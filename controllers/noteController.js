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
        res.status(500).json({ message: 'Error fetching note'   , error: error.message });
    }
};

exports.addNote = async (req, res) => {
    try {
        console.log('--- Incoming addNote ---');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('Files:', req.files ? Object.keys(req.files) : 'none');

        let noteData = req.body;
        if (typeof noteData.blocks === 'string') {
            noteData.blocks = JSON.parse(noteData.blocks);
        }

        if (req.files) {
            const images = req.files.images || [];
            const videos = req.files.videos || [];

            let imgIdx = 0;
            let vidIdx = 0;

            for (let b of noteData.blocks) {
                if (b.type === 'image' && imgIdx < images.length) {
                    if (!b.data.startsWith('upload/')) {
                        b.data = images[imgIdx].path.replace(/\\/g, '/');
                        imgIdx++;
                    }
                } else if (b.type === 'video' && vidIdx < videos.length) {
                    if (!b.data.startsWith('upload/')) {
                        b.data = videos[vidIdx].path.replace(/\\/g, '/');
                        vidIdx++;
                    }
                }
            }

            // Also store video paths in a flat list for convenience
            const videoPaths = [];
            for (let b of noteData.blocks) {
                if (b.type === 'video' && b.data && b.data.startsWith('upload/')) {
                    videoPaths.push(b.data);
                }
            }
            noteData.video_paths = JSON.stringify(videoPaths);
        }

        console.log('Processed noteData blocks:', JSON.stringify(noteData.blocks, null, 2));
        const id = await Note.create(noteData);
        console.log('Note saved successfully with ID:', id);
        res.status(201).json({ message: 'Note added successfully', id });
    } catch (error) {
        console.error('CRITICAL ERROR in addNote:', error);
        res.status(500).json({ message: 'Error adding note', error: error.message });
    }
};

exports.updateNote = async (req, res) => {
    try {
        let noteData = req.body;
        if (typeof noteData.blocks === 'string') {
            noteData.blocks = JSON.parse(noteData.blocks);
        }

        if (req.files) {
            const images = req.files.images || [];
            const videos = req.files.videos || [];

            let imgIdx = 0;
            let vidIdx = 0;

            for (let b of noteData.blocks) {
                if (b.type === 'image' && imgIdx < images.length) {
                    if (!b.data.startsWith('upload/')) {
                        b.data = images[imgIdx].path.replace(/\\/g, '/');
                        imgIdx++;
                    }
                } else if (b.type === 'video' && vidIdx < videos.length) {
                    if (!b.data.startsWith('upload/')) {
                        b.data = videos[vidIdx].path.replace(/\\/g, '/');
                        vidIdx++;
                    }
                }
            }

            const videoPaths = [];
            for (let b of noteData.blocks) {
                if (b.type === 'video' && b.data && b.data.startsWith('upload/')) {
                    videoPaths.push(b.data);
                }
            }
            noteData.video_paths = JSON.stringify(videoPaths);
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
