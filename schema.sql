-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plants Table
CREATE TABLE IF NOT EXISTS plants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_path VARCHAR(255),
    category_id INT,
    description TEXT,
    height VARCHAR(100),
    width VARCHAR(100),
    flower_color VARCHAR(100) DEFAULT 'Unknown',
    water_requirement VARCHAR(100) DEFAULT 'Medium',
    hedge_type VARCHAR(100) DEFAULT 'Screening',
    variety VARCHAR(100) DEFAULT 'Common',
    shade VARCHAR(100) DEFAULT 'Partial',
    is_featured BOOLEAN DEFAULT FALSE,
    image_paths JSONB DEFAULT '[]'::jsonb, -- Added for multiple images
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Insert Default Categories
INSERT INTO categories (name) VALUES 
('Indoor Plants'),
('Outdoor Plants'),
('Succulents'),
('Flowering Plants'),
('Hedges')
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Plants (Matching PlantService data)
-- Note: category_ids are 1, 1, 2, 1 based on insertion order above
INSERT INTO plants (name, image_path, category_id, description, height, width, flower_color, water_requirement, variety, shade, is_featured, image_paths) VALUES 
('Snake Plant', 'lib/assets/images/snake_plant.png', 1, 'The Snake Plant, also known as mother-in-law\'s tongue, is a resilient houseplant with upright, sword-like leaves.', '28 cm', '18 cm', 'White', 'Low', 'Common', 'Partial', FALSE, '["lib/assets/images/snake_plant.png"]'),
('Fiddle Leaf', 'lib/assets/images/fiddle_leaf.png', 1, 'The Fiddle Leaf Fig is a popular ornamental tree with large, violin-shaped leaves.', '45 cm', '30 cm', 'None', 'Moderate', 'Common', 'Partial', FALSE, '["lib/assets/images/fiddle_leaf.png"]'),
('Aloe Vera', 'lib/assets/images/aloe_vera.png', 2, 'Aloe Vera is a well-known succulent prized for its medicinal properties.', '15 cm', '10 cm', 'Yellow', 'Very Low', 'Common', 'Partial', FALSE, '["lib/assets/images/aloe_vera.png"]'),
('Golden Pothos', 'lib/assets/images/golden_pothos.png', 1, 'Golden Pothos, or Devil\'s Ivy, is a versatile climbing vine with heart-shaped, variegated leaves.', '10 cm', '25 cm', 'Greenish', 'Moderate', 'Common', 'Partial', FALSE, '["lib/assets/images/golden_pothos.png"]');
