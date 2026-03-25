const db = require('../config/db');

exports.getAllCategories = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM categories ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : null;
        
        const result = await db.query(
            'INSERT INTO categories (name, image_path) VALUES ($1, $2) RETURNING id', 
            [name, imagePath]
        );
        res.status(201).json({ status: 'success', categoryId: result.rows[0].id, image_path: imagePath });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const name = req.body.name;
        
        console.log('--- UPDATE REQUEST RECEIVED ---');
        console.log(`Target ID: ${id}`);
        console.log(`New Name: ${name}`);
        console.log(`File: ${req.file ? req.file.path : 'None'}`);

        if (!id) {
            return res.status(400).json({ status: 'error', message: 'Category ID is required' });
        }

        const categoryId = parseInt(id);
        if (isNaN(categoryId)) {
            return res.status(400).json({ status: 'error', message: 'Invalid Category ID' });
        }

        let query;
        let params;
        
        if (req.file) {
            const imagePath = req.file.path.replace(/\\/g, '/');
            query = 'UPDATE categories SET name = $1, image_path = $2 WHERE id = $3';
            params = [name, imagePath, categoryId];
            console.log('Updating name AND image');
        } else {
            query = 'UPDATE categories SET name = $1 WHERE id = $2';
            params = [name, categoryId];
            console.log('Updating name ONLY');
        }
        
        const dbResult = await db.query(query, params);
        console.log(`Query executed. RowCount: ${dbResult.rowCount}`);

        if (dbResult.rowCount === 0) {
            return res.status(404).json({ status: 'error', message: 'Category not found in database' });
        }

        res.status(200).json({ status: 'success', message: 'Category updated successfully' });
    } catch (error) {
        console.error('CRITICAL UPDATE ERROR:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`DELETING CAT ID: ${id}`);
        const result = await db.query('DELETE FROM categories WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ status: 'error', message: 'Category already deleted or not found' });
        }
        res.status(200).json({ status: 'success', message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
