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
        const id = noteData.id;
        const title = noteData.title;
        const content = noteData.content;
        const blocks = noteData.blocks;
        const date_time = noteData.date_time || noteData.dateTime || new Date();
        const color_value = noteData.color_value || noteData.colorValue;
        const category = noteData.category;
        const image_size = noteData.image_size || noteData.imageSize || 'large';
        const video_paths = noteData.video_paths || '[]';

        await db.query(
            'INSERT INTO notes (id, title, content, blocks, date_time, color_value, category, image_size, video_paths) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [id, title, content, JSON.stringify(blocks), date_time, color_value, category, image_size, video_paths]
        );
        return id;
    }

    static async update(id, noteData) {
        const title = noteData.title;
        const content = noteData.content;
        const blocks = noteData.blocks;
        const date_time = noteData.date_time || noteData.dateTime;
        const color_value = noteData.color_value || noteData.colorValue;
        const category = noteData.category;
        const image_size = noteData.image_size || noteData.imageSize;
        const video_paths = noteData.video_paths || '[]';

        await db.query(
            'UPDATE notes SET title = $1, content = $2, blocks = $3, date_time = $4, color_value = $5, category = $6, image_size = $7, video_paths = $8 WHERE id = $9',
            [title, content, JSON.stringify(blocks), date_time, color_value, category, image_size, video_paths, id]
        );
    }

    static async delete(id) {
        await db.query('DELETE FROM notes WHERE id = $1', [id]);
    }
}

module.exports = Note;
