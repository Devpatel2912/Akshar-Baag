const db = require('../config/db');

class Plant {
    static async getAll() {
        const result = await db.query('SELECT plants.*, categories.name as category_name FROM plants JOIN categories ON plants.category_id = categories.id');
        return result.rows;
    }

    static async getById(id) {
        const result = await db.query('SELECT * FROM plants WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async getByCategory(categoryName) {
        const result = await db.query('SELECT plants.* FROM plants JOIN categories ON plants.category_id = categories.id WHERE categories.name = $1', [categoryName]);
        return result.rows;
    }

    static async create(plantData) {
        const { name, image_path, category_id, description, height, width, flower_color, water_requirement, hedge_type, variety, shade, is_featured, image_paths, video_path } = plantData;
        const result = await db.query(
            'INSERT INTO plants (name, image_path, category_id, description, height, width, flower_color, water_requirement, hedge_type, variety, shade, is_featured, image_paths, video_path) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id',
            [name, image_path, category_id, description, height, width, flower_color, water_requirement, hedge_type, variety, shade, is_featured, image_paths || '[]', video_path || null]
        );
        return result.rows[0].id;
    }

    static async update(id, plantData) {
        const { name, image_path, category_id, description, height, width, flower_color, water_requirement, hedge_type, variety, shade, is_featured, image_paths, video_path } = plantData;

        // Build dynamic query to avoid overwriting with null/undefined
        let query = 'UPDATE plants SET name = $1, category_id = $2, description = $3, height = $4, width = $5, flower_color = $6, water_requirement = $7, hedge_type = $8, variety = $9, shade = $10, is_featured = $11';
        let params = [name, category_id, description, height, width, flower_color, water_requirement, hedge_type, variety, shade, is_featured];
        let count = 12;

        if (image_path) {
            query += `, image_path = $${count}`;
            params.push(image_path);
            count++;
        }
        if (image_paths) {
            query += `, image_paths = $${count}`;
            params.push(image_paths);
            count++;
        }
        if (video_path !== undefined) { // Check for undefined to allow setting to null if needed
            query += `, video_path = $${count}`;
            params.push(video_path);
            count++;
        }

        query += ` WHERE id = $${count}`;
        params.push(id);

        await db.query(query, params);
    }

    static async delete(id) {
        await db.query('DELETE FROM plants WHERE id = $1', [id]);
    }
}

module.exports = Plant;
