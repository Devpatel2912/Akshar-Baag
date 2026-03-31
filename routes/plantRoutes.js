const express = require('express');
const router = express.Router();
const plantController = require('../controllers/plantController');
const upload = require('../middleware/upload');

router.get('/', plantController.getAllPlants);
router.get('/:id', plantController.getPlantById);
router.get('/category/:categoryName', plantController.getPlantsByCategory);

// Support multiple images and one video
const plantUploads = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 }
]);

router.post('/', plantUploads, plantController.createPlant);

// Support both JSON/Text and Media for updates
router.put('/:id', plantUploads, plantController.updatePlant);

router.delete('/:id', plantController.deletePlant);

module.exports = router;
