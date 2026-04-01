const db = require('../config/db');

class Note {
    static async getAll() {
        const result = await db.query('SELECT * FROM notes ORDER BY created_at DESC');
        return result.rows;
    }

    static async getById(id) {
        const result = await db.query('SELECT * FROM notes WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create(noteData) {
        const { id, title, content, blocks, date_time, color_value, category, image_size } = noteData;
        await db.query(
            'INSERT INTO notes (id, title, content, blocks, date_time, color_value, category, image_size) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [id, title, content, JSON.stringify(blocks), date_time || new Date(), color_value, category, image_size || 'large']
        );
        return id;
    }

    static async update(id, noteData) {
        const { title, content, blocks, date_time, color_value, category, image_size } = noteData;
        await db.query(
            'UPDATE notes SET title = $1, content = $2, blocks = $3, date_time = $4, color_value = $5, category = $6, image_size = $7 WHERE id = $8',
            [title, content, JSON.stringify(blocks), date_time, color_value, category, image_size, id]
        );
    }

    static async delete(id) {
        await db.query('DELETE FROM notes WHERE id = $1', [id]);
    }
}

module.exports = Note;
