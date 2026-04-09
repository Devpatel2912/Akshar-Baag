const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const upload = require('../middleware/upload');

const noteUploads = upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 5 }]);

router.get('/', noteController.getNotes);
router.get('/:id', noteController.getNoteById);
router.post('/', noteUploads, noteController.addNote);
router.put('/:id', noteUploads, noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
