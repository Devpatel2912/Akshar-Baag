const Plant = require('../models/plantModel');
const ffmpeg = require('fluent-ffmpeg');
const ffprobePath = require('ffprobe-static').path;
const fs = require('fs');

ffmpeg.setFfprobePath(ffprobePath);

// Fix EACCES (Permission Denied) on Linux/Mac if needed
if (process.platform !== 'win32') {
    try {
        console.log('Ensuring ffprobe has execution permissions on this platform...');
        fs.chmodSync(ffprobePath, 0o755);
    } catch (err) {
        console.error('Warning: Failed to set ffprobe permissions:', err.message);
    }
}

// Helper to validate video duration
const validateVideo = (videoPath) => {
    return new Promise((resolve, reject) => {
        // Set a timeout of 30 seconds for ffprobe
        const timeout = setTimeout(() => {
            reject(new Error('Video validation timed out (ffprobe took too long)'));
        }, 30000);

        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            clearTimeout(timeout);
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
        console.log('Files:', req.files ? Object.keys(req.files) : 'none');

        const images = req.files && req.files.images ? req.files.images : [];
        const videos = req.files && req.files.video ? req.files.video : [];

        const plantData = { ...req.body };

        // Process Images
        if (images.length > 0) {
            console.log('Processing', images.length, 'images');
            plantData.image_path = images[0].path.replace(/\\/g, '/');
            plantData.image_paths = JSON.stringify(images.map(f => f.path.replace(/\\/g, '/')));
        } else {
            console.log('No new images provided, using placeholder');
            plantData.image_path = 'lib/assets/images/placeholder_green.png';
            plantData.image_paths = '[]';
        }

        // Process and Validate Videos
        if (videos.length > 0) {
            console.log('Processing and validating', videos.length, 'videos');
            const validVideoPaths = [];
            for (const v of videos) {
                try {
                    if (fs.existsSync(v.path)) {
                        await validateVideo(v.path);
                        validVideoPaths.push(v.path.replace(/\\/g, '/'));
                        console.log('Video validated:', v.path);
                    }
                } catch (validationError) {
                    console.error('Video validation failed for', v.path, ':', validationError.message);
                    // Cleanup uploaded files on failure
                    for (const file of videos) {
                        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                    }
                    return res.status(400).json({ status: 'error', message: `Video Error: ${validationError.message}` });
                }
            }
            if (validVideoPaths.length > 0) {
                plantData.video_path = validVideoPaths[0];
                plantData.video_paths = JSON.stringify(validVideoPaths);
            }
        } else {
            console.log('No video provided for this plant entry');
            plantData.video_paths = '[]';
        }

        console.log('Persisting plant to database...');
        const plantId = await Plant.create(plantData);
        console.log('Plant persistence successful, ID:', plantId);
        res.status(201).json({ status: 'success', message: 'Plant created successfully', plantId });
    } catch (error) {
        console.error('CRITICAL ERROR in createPlant flow:', error);
        res.status(500).json({ status: 'error', message: error.message });
    } finally {
        console.log('--- createPlant REQUEST PROCESSING COMPLETED ---');
    }
};

exports.updatePlant = async (req, res) => {
    try {
        console.log('--- Incoming updatePlant ---');
        const images = req.files && req.files.images ? req.files.images : [];
        const videos = req.files && req.files.video ? req.files.video : [];

        const plantData = { ...req.body };

        // Handle image updates
        const existingImagesStr = req.body.existing_images || "";
        let finalImages = existingImagesStr ? existingImagesStr.split(',') : [];

        if (images.length > 0) {
            console.log('Processing', images.length, 'new images');
            const newImagePaths = images.map(f => f.path.replace(/\\/g, '/'));
            finalImages = [...finalImages, ...newImagePaths];
        }

        if (req.body.existing_images !== undefined || images.length > 0) {
            if (finalImages.length > 0) {
                plantData.image_path = finalImages[0];
                plantData.image_paths = JSON.stringify(finalImages);
            } else {
                plantData.image_path = 'lib/assets/images/placeholder_green.png';
                plantData.image_paths = '[]';
            }
        }

        // Handle video updates
        const existingVideosStr = req.body.existing_videos || "";
        let finalVideos = existingVideosStr ? existingVideosStr.split(',') : [];

        // Process and Validate New Videos
        if (videos.length > 0) {
            console.log('Validating', videos.length, 'new videos');
            const newVideoPaths = [];
            for (const v of videos) {
                try {
                    if (fs.existsSync(v.path)) {
                        await validateVideo(v.path);
                        newVideoPaths.push(v.path.replace(/\\/g, '/'));
                    }
                } catch (validationError) {
                    console.error('New video validation failed:', validationError.message);
                    for (const file of videos) {
                        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                    }
                    return res.status(400).json({ status: 'error', message: validationError.message });
                }
            }
            finalVideos = [...finalVideos, ...newVideoPaths];
        }

        if (req.body.existing_videos !== undefined || videos.length > 0) {
            if (finalVideos.length > 0) {
                plantData.video_path = finalVideos[0];
                plantData.video_paths = JSON.stringify(finalVideos);
            } else {
                plantData.video_path = null;
                plantData.video_paths = '[]';
            }
        } else if (req.body.remove_video === 'true') {
            console.log('Removing video path from plant');
            plantData.video_path = null;
            plantData.video_paths = '[]';
        }

        console.log('Updating plant in database...');
        await Plant.update(req.params.id, plantData);
        console.log('Plant updated successfully');
        res.status(200).json({ status: 'success', message: 'Plant updated' });
    } catch (error) {
        console.error('CRITICAL FAILURE in updatePlant:', error);
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
