const Plant = require('../models/plantModel');

exports.getAllPlants = async (req, res) => {
    try {
        const plants = await Plant.getAll();
        res.status(200).json(plants);
    } catch (error) {
        console.error('Error in getAllPlants:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getPlantById = async (req, res) => {
    try {
        const plant = await Plant.getById(req.params.id);
        if (!plant) return res.status(404).json({ status: 'error', message: 'Plant not found' });
        res.status(200).json(plant);
    } catch (error) {
        console.error('Error in getPlantById:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getPlantsByCategory = async (req, res) => {
    try {
        const plants = await Plant.getByCategory(req.params.categoryName);
        res.status(200).json(plants);
    } catch (error) {
        console.error('Error in getPlantsByCategory:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.createPlant = async (req, res) => {
    try {
        console.log('--- Incoming createPlant ---');
        console.log('Body:', req.body);
        console.log('Files count:', req.files ? req.files.length : 0);

        const plantData = { ...req.body };

        if (req.files && req.files.length > 0) {
            plantData.image_path = req.files[0].path.replace(/\\/g, '/');
            plantData.image_paths = JSON.stringify(req.files.map(f => f.path.replace(/\\/g, '/')));
        } else {
            // Use placeholder for primary if no image
            plantData.image_path = 'lib/assets/images/placeholder_green.png';
            plantData.image_paths = '[]';
        }

        const plantId = await Plant.create(plantData);
        console.log('Plant created successfully with ID:', plantId);
        res.status(201).json({ status: 'success', message: 'Plant created', plantId });
    } catch (error) {
        console.error('Critical failure in createPlant:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.updatePlant = async (req, res) => {
    try {
        console.log('--- Incoming updatePlant ---');
        console.log('ID:', req.params.id);
        console.log('Body:', req.body);

        const plantData = { ...req.body };

        // Handle image updates (New + Remaining Existing)
        const existingImagesStr = req.body.existing_images || "";
        let finalImages = existingImagesStr ? existingImagesStr.split(',') : [];

        // Add new uploads if any
        if (req.files && req.files.length > 0) {
            const newImagePaths = req.files.map(f => f.path.replace(/\\/g, '/'));
            finalImages = [...finalImages, ...newImagePaths];
        }

        // Only update image fields if there was a change in the gallery (new files OR existing_images was provided)
        // Note: Flutter app always sends existing_images during edit save
        if (req.body.existing_images !== undefined || (req.files && req.files.length > 0)) {
            if (finalImages.length > 0) {
                plantData.image_path = finalImages[0];
                plantData.image_paths = JSON.stringify(finalImages);
            } else {
                // All images were removed
                plantData.image_path = 'lib/assets/images/placeholder_green.png';
                plantData.image_paths = '[]';
            }
        }

        await Plant.update(req.params.id, plantData);
        console.log('Plant updated successfully');
        res.status(200).json({ status: 'success', message: 'Plant updated' });
    } catch (error) {
        console.error('Critical failure in updatePlant:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.deletePlant = async (req, res) => {
    try {
        await Plant.delete(req.params.id);
        res.status(200).json({ status: 'success', message: 'Plant deleted' });
    } catch (error) {
        console.error('Error in deletePlant:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
