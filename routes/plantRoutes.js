const express = require('express');
const router = express.Router();
const plantController = require('../controllers/plantController');
const upload = require('../middleware/upload');

router.get('/', plantController.getAllPlants);
router.get('/:id', plantController.getPlantById);
router.get('/category/:categoryName', plantController.getPlantsByCategory);

router.post('/', upload.array('images', 10), plantController.createPlant);

// Support both JSON/Text and Images for updates
router.put('/:id', upload.array('images', 10), plantController.updatePlant);

router.delete('/:id', plantController.deletePlant);

module.exports = router;
