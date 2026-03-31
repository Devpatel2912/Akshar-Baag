const Plant = require('../models/plantModel');
const ffmpeg = require('fluent-ffmpeg');
const ffprobePath = require('ffprobe-static').path;
const fs = require('fs');

ffmpeg.setFfprobePath(ffprobePath);

// Helper to validate video duration and quality
const validateVideo = (videoPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) return reject(new Error('Failed to probe video file: ' + err.message));

            const duration = metadata.format.duration; // in seconds
            const videoStream = metadata.streams.find(s => s.codec_type === 'video');

            if (!videoStream) return reject(new Error('No video stream found in the file'));

            // Check duration (max 5 minutes = 300 seconds)
            if (duration > 300) {
                return reject(new Error(`Video duration (${Math.round(duration)}s) exceeds maximum limit of 5 minutes (300s)`));
            }

            resolve({ duration });
        });
    });
};

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
        
        const images = req.files && req.files.images ? req.files.images : [];
        const video = req.files && req.files.video ? req.files.video[0] : null;

        const plantData = { ...req.body };

        // Process Images
        if (images.length > 0) {
            plantData.image_path = images[0].path.replace(/\\/g, '/');
            plantData.image_paths = JSON.stringify(images.map(f => f.path.replace(/\\/g, '/')));
        } else {
            plantData.image_path = 'lib/assets/images/placeholder_green.png';
            plantData.image_paths = '[]';
        }

        // Process and Validate Video
        if (video) {
            try {
                await validateVideo(video.path);
                plantData.video_path = video.path.replace(/\\/g, '/');
            } catch (validationError) {
                // Delete the uploaded file if validation fails
                if (fs.existsSync(video.path)) fs.unlinkSync(video.path);
                return res.status(400).json({ status: 'error', message: validationError.message });
            }
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
        
        const images = req.files && req.files.images ? req.files.images : [];
        const video = req.files && req.files.video ? req.files.video[0] : null;

        const plantData = { ...req.body };

        // Handle image updates (New + Remaining Existing)
        const existingImagesStr = req.body.existing_images || "";
        let finalImages = existingImagesStr ? existingImagesStr.split(',') : [];

        // Add new image uploads if any
        if (images.length > 0) {
            const newImagePaths = images.map(f => f.path.replace(/\\/g, '/'));
            finalImages = [...finalImages, ...newImagePaths];
        }

        // Only update image fields if changes occurred
        if (req.body.existing_images !== undefined || images.length > 0) {
            if (finalImages.length > 0) {
                plantData.image_path = finalImages[0];
                plantData.image_paths = JSON.stringify(finalImages);
            } else {
                plantData.image_path = 'lib/assets/images/placeholder_green.png';
                plantData.image_paths = '[]';
            }
        }

        // Process and Validate New Video if provided
        if (video) {
            try {
                await validateVideo(video.path);
                plantData.video_path = video.path.replace(/\\/g, '/');
            } catch (validationError) {
                if (fs.existsSync(video.path)) fs.unlinkSync(video.path);
                return res.status(400).json({ status: 'error', message: validationError.message });
            }
        } else if (req.body.remove_video === 'true') {
            plantData.video_path = null;
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
        // Optionally delete files from disk here if needed
        await Plant.delete(req.params.id);
        res.status(200).json({ status: 'success', message: 'Plant deleted' });
    } catch (error) {
        console.error('Error in deletePlant:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
