const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const upload = require('../middleware/upload');

router.get('/', noteController.getNotes);
router.get('/:id', noteController.getNoteById);
router.post('/', upload.array('images'), noteController.addNote);
router.put('/:id', upload.array('images'), noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
