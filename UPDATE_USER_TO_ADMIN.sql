-- Update the Staff User account to be an Admin
-- Run this SQL command in your database

UPDATE users 
SET role = 'admin', 
    name = 'Admin User'
WHERE email = 'staff@medikiosk.com';

-- OR if you want to update by name:
UPDATE users 
SET role = 'admin'
WHERE name = 'Staff User';
