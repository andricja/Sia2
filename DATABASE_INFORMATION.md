# 🗄️ Database Information - MediKiosk Pharmacy System

## Your Database Type
**SQLite** - A lightweight, file-based database

## Database Location
📁 **File Path**: `laravel_backend/database/database.sqlite`

This is a single file that contains ALL your data:
- ✅ Medicines
- ✅ Categories
- ✅ Orders
- ✅ Users (Admin/Staff accounts)
- ✅ Stock Movements
- ✅ Expiry Records
- ✅ Sessions
- ✅ Cache

## Why SQLite?
SQLite is perfect for your project because:
- ✅ **Easy to Use**: No separate database server needed
- ✅ **Portable**: Just one file - easy to backup
- ✅ **Fast**: Great performance for small to medium applications
- ✅ **Simple Setup**: Works out of the box
- ✅ **No Configuration**: No need to install MySQL, PostgreSQL, etc.

## Database Configuration
From your `.env` file:
```
DB_CONNECTION=sqlite
```

This tells Laravel to use SQLite instead of MySQL/PostgreSQL.

## How to View Your Database

### Option 1: DB Browser for SQLite (Recommended)
1. Download: https://sqlitebrowser.org/
2. Open the file: `laravel_backend/database/database.sqlite`
3. Browse all tables and data visually

### Option 2: VS Code Extensions
Install one of these VS Code extensions:
- **SQLite Viewer** by Florian Klampfer
- **SQLite** by alexcvzz

### Option 3: Command Line
```bash
cd laravel_backend/database
sqlite3 database.sqlite
.tables        # Show all tables
.schema        # Show table structures
SELECT * FROM categories;   # View categories
SELECT * FROM medicines;    # View medicines
```

## Database Tables Structure

### 1. **users**
- Admin and Staff accounts
- Passwords (hashed)
- Roles (admin/staff)

### 2. **medicines**
- Medicine code, barcode, name, description
- Category, price, stock quantity
- Reorder level, expiry date

### 3. **categories**
- Category name, description
- Active status, display order
- Medicine count

### 4. **orders**
- Order details
- Customer information
- Order status, total amount
- Payment information

### 5. **order_items**
- Individual items in each order
- Quantity, price per order

### 6. **stock_movements**
- All stock changes (received, sold, adjusted, damaged, expired)
- Quantity changes
- User who made the change
- Reason and notes

### 7. **expiry_records**
- Batch tracking for medicines
- Expiry dates per batch
- Quantities per batch

### 8. **personal_access_tokens**
- API authentication tokens
- Used for login sessions

## How to Backup Your Database

### Quick Backup
Simply copy the file:
```bash
# Windows
copy laravel_backend\database\database.sqlite laravel_backend\database\database.backup.sqlite

# Or just copy it in File Explorer
```

### Restore from Backup
Replace the current file with your backup:
```bash
copy laravel_backend\database\database.backup.sqlite laravel_backend\database\database.sqlite
```

## Data Flow

```
Frontend (React)
    ↓
API Requests (http://127.0.0.1:8000/api)
    ↓
Laravel Backend (PHP)
    ↓
Eloquent ORM (Database Queries)
    ↓
SQLite Database File (database.sqlite)
```

## Where Data is Stored by Feature

### Medicine Management
- **Table**: `medicines`
- **Related**: `categories`, `stock_movements`, `expiry_records`

### Categories Management
- **Table**: `categories`
- **Related**: `medicines` (foreign key)

### POS (Point of Sale)
- **Table**: `orders`, `order_items`
- **Related**: `medicines`, `users`

### Stock Movements
- **Table**: `stock_movements`
- **Related**: `medicines`, `users`

### User Authentication
- **Table**: `users`, `personal_access_tokens`

## Database File Size
Currently: Check the file size of `laravel_backend/database/database.sqlite`

SQLite can handle:
- ✅ Small apps: 1-10 MB
- ✅ Medium apps: 10-100 MB
- ✅ Large apps: Up to 281 TB (theoretical limit)

For a pharmacy system, you'll likely stay under 100 MB unless you have thousands of medicines and millions of transactions.

## Reset Database (Fresh Start)

If you want to start over:

```bash
cd laravel_backend

# Delete current database
del database\database.sqlite    # Windows
rm database/database.sqlite     # Mac/Linux

# Create fresh database with structure
php artisan migrate:fresh

# Add sample data (optional)
php artisan db:seed
```

⚠️ **Warning**: This will delete ALL your data!

## Switching to MySQL/PostgreSQL (Future)

If you need to scale up later, you can switch:

1. Install MySQL/PostgreSQL
2. Update `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=medikiosk
DB_USERNAME=root
DB_PASSWORD=your_password
```
3. Run migrations: `php artisan migrate`
4. Export data from SQLite and import to MySQL

## Current Database Status

✅ **Active**: Your database is working
✅ **Location**: `laravel_backend/database/database.sqlite`
✅ **Type**: SQLite (file-based)
✅ **Size**: Check file properties
✅ **Backup**: Recommended to copy file regularly

## Pro Tips

1. **Regular Backups**: Copy the `.sqlite` file weekly
2. **Version Control**: Add to `.gitignore` (already done) to avoid committing sensitive data
3. **Monitor Size**: If it grows beyond 100 MB, consider MySQL
4. **Performance**: SQLite is fast for reads, but can slow down with many concurrent writes

## Need Help?

- View data: Use DB Browser for SQLite
- Backup: Just copy the file
- Reset: Delete file and run `php artisan migrate:fresh`
- Query: Use SQLite commands or Laravel Tinker

---

**Your data is safe in**: `laravel_backend/database/database.sqlite` 🎉
