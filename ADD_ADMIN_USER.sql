-- Use medikiosk database
USE medikiosk;

-- Update admin user password (if already exists)
-- Password: admin123 (hashed with bcrypt)
UPDATE users 
SET password = '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role = 'admin',
    updated_at = NOW()
WHERE email = 'admin@medikiosk.com';

-- Insert admin user only if doesn't exist
INSERT IGNORE INTO users (name, email, email_verified_at, password, role, remember_token, created_at, updated_at) 
VALUES (
    'Admin User',
    'admin@medikiosk.com',
    NOW(),
    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    NULL,
    NOW(),
    NOW()
);

-- Insert some sample categories (with slugs)
INSERT INTO categories (name, slug, description, is_active, display_order, created_at, updated_at) VALUES
('Pain Relief', 'pain-relief', 'Medicines for pain management', 1, 1, NOW(), NOW()),
('Antibiotics', 'antibiotics', 'Antibacterial medications', 1, 2, NOW(), NOW()),
('Vitamins & Supplements', 'vitamins-supplements', 'Health supplements and vitamins', 1, 3, NOW(), NOW()),
('Cold & Flu', 'cold-flu', 'Cold and flu remedies', 1, 4, NOW(), NOW()),
('Digestive Health', 'digestive-health', 'Digestive system medications', 1, 5, NOW(), NOW()),
('Allergy', 'allergy', 'Allergy relief medications', 1, 6, NOW(), NOW()),
('Cardiovascular', 'cardiovascular', 'Heart and blood pressure medications', 1, 7, NOW(), NOW()),
('Diabetes', 'diabetes', 'Diabetes management medications', 1, 8, NOW(), NOW()),
('Respiratory', 'respiratory', 'Respiratory system medications', 1, 9, NOW(), NOW()),
('Skin Care', 'skin-care', 'Dermatological products', 1, 10, NOW(), NOW());

SELECT 'Admin user and categories added successfully!' as Result;
