# 🔄 Migration Guide: SQLite to MySQL (Laragon)

## Why Switch to MySQL?

✅ **Better for Production**: Industry standard for web applications
✅ **phpMyAdmin**: Easy visual database management
✅ **Better Concurrent Access**: Multiple users can write simultaneously
✅ **Advanced Features**: Better for complex queries and relationships
✅ **Scalability**: Handles larger datasets better

## Prerequisites

### 1. Make Sure Laragon is Running
- Open Laragon
- Click **"Start All"** button
- Wait for MySQL indicator to turn **green**
- Verify Apache and MySQL are running

### 2. Backup Current SQLite Data (Optional)
If you have important data in SQLite:
```bash
copy laravel_backend\database\database.sqlite laravel_backend\database\database.backup.sqlite
```

## Migration Steps

### Step 1: Update Configuration ✅ (DONE)
The `.env` file has been updated to:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=medikiosk
DB_USERNAME=root
DB_PASSWORD=
```

### Step 2: Run Database Setup
Double-click: **`SETUP_MYSQL_DATABASE.bat`**

This will:
1. ✅ Create MySQL database named `medikiosk`
2. ✅ Run all migrations (create tables)
3. ✅ Seed initial data (categories, admin user, sample medicines)

### Step 3: Verify Setup
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click on `medikiosk` database in the left sidebar
3. You should see these tables:
   - cache
   - cache_locks
   - categories
   - expiry_records
   - failed_jobs
   - job_batches
   - jobs
   - medicines
   - migrations
   - order_items
   - orders
   - personal_access_tokens
   - sessions
   - stock_movements
   - users

### Step 4: Test the Application
1. Start backend: `START_BACKEND.bat`
2. Start frontend: `START_FRONTEND.bat`
3. Login with:
   - Email: `admin@medikiosk.com`
   - Password: `admin123`

## What Changed?

### Before (SQLite)
```
Database File: laravel_backend/database/database.sqlite
Type: Single file database
Management: DB Browser for SQLite
```

### After (MySQL)
```
Database Server: MySQL (via Laragon)
Database Name: medikiosk
Management: phpMyAdmin
URL: http://localhost/phpmyadmin
```

## Database Tables Structure

### Core Tables
1. **users** - Admin and staff accounts
2. **medicines** - Medicine inventory
3. **categories** - Medicine categories
4. **orders** - Sales orders
5. **order_items** - Order line items
6. **stock_movements** - Stock history tracking
7. **expiry_records** - Batch expiry tracking
8. **personal_access_tokens** - API authentication

### System Tables
- **migrations** - Database version tracking
- **cache** - Application cache
- **sessions** - User sessions
- **jobs** - Background jobs queue
- **failed_jobs** - Failed job logs

## Using phpMyAdmin

### Access phpMyAdmin
1. Make sure Laragon is running
2. Open: http://localhost/phpmyadmin
3. Click on `medikiosk` database

### View Data
- Click on any table name (e.g., `medicines`)
- Click "Browse" tab to see data
- Click "Structure" tab to see columns

### Search Data
- Select a table
- Click "Search" tab
- Enter search criteria

### Export Database
1. Select `medikiosk` database
2. Click "Export" tab
3. Choose "Quick" or "Custom"
4. Click "Go"
5. Save the .sql file

### Import Database
1. Select `medikiosk` database
2. Click "Import" tab
3. Choose file
4. Click "Go"

## Common phpMyAdmin Tasks

### Add New Medicine Manually
1. Click `medicines` table
2. Click "Insert" tab
3. Fill in the form
4. Click "Go"

### Edit Data
1. Browse to the table
2. Click "Edit" icon (pencil) on the row
3. Modify values
4. Click "Go"

### Delete Data
1. Browse to the table
2. Check the checkbox next to row(s)
3. Click "Delete" at bottom
4. Confirm

### Run Custom SQL Query
1. Click "SQL" tab at top
2. Write your query:
```sql
SELECT * FROM medicines WHERE stock_quantity < 50;
SELECT * FROM orders WHERE created_at >= '2024-01-01';
```
3. Click "Go"

## Useful SQL Queries

### View All Medicines
```sql
SELECT * FROM medicines ORDER BY name;
```

### View Low Stock Items
```sql
SELECT name, stock_quantity FROM medicines 
WHERE stock_quantity < reorder_level 
ORDER BY stock_quantity;
```

### View Recent Orders
```sql
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
```

### View Categories with Medicine Count
```sql
SELECT c.name, COUNT(m.id) as medicine_count
FROM categories c
LEFT JOIN medicines m ON m.category = c.name
GROUP BY c.id, c.name;
```

### View Stock Movements
```sql
SELECT sm.*, m.name as medicine_name, u.name as user_name
FROM stock_movements sm
JOIN medicines m ON sm.medicine_id = m.id
JOIN users u ON sm.user_id = u.id
ORDER BY sm.created_at DESC
LIMIT 20;
```

## Backup & Restore

### Backup via phpMyAdmin
1. Select `medikiosk` database
2. Click "Export"
3. Select "Quick" method
4. Format: SQL
5. Click "Go"
6. Save file: `medikiosk_backup_2024_10_22.sql`

### Restore via phpMyAdmin
1. Select `medikiosk` database
2. Click "Import"
3. Choose file
4. Click "Go"

### Backup via Command Line
```bash
# In Laragon's Terminal (or use Laragon Menu > MySQL > Dump)
mysqldump -u root medikiosk > medikiosk_backup.sql
```

### Restore via Command Line
```bash
mysql -u root medikiosk < medikiosk_backup.sql
```

## Troubleshooting

### Error: "Connection refused"
**Problem**: MySQL is not running
**Solution**: 
- Open Laragon
- Click "Start All"
- Wait for MySQL indicator to turn green

### Error: "Access denied for user 'root'"
**Problem**: Wrong password in .env
**Solution**: 
- In Laragon, MySQL root password is usually empty
- Check `.env` file: `DB_PASSWORD=` (should be empty)

### Error: "Database 'medikiosk' does not exist"
**Problem**: Database not created
**Solution**: 
- Run `SETUP_MYSQL_DATABASE.bat` again
- Or manually create in phpMyAdmin: Click "New" > Name: `medikiosk`

### Error: "Table doesn't exist"
**Problem**: Migrations not run
**Solution**: 
```bash
cd laravel_backend
php artisan migrate:fresh --seed
```

### Can't See Tables in phpMyAdmin
**Problem**: Wrong database selected
**Solution**: 
- Click `medikiosk` in left sidebar
- Refresh the page

## Comparing SQLite vs MySQL

| Feature | SQLite | MySQL |
|---------|---------|-------|
| **Setup** | Zero config | Requires server |
| **Performance (Small)** | Fast | Fast |
| **Performance (Large)** | Slower | Faster |
| **Concurrent Writes** | Limited | Excellent |
| **Management Tool** | DB Browser | phpMyAdmin |
| **Production Ready** | Small apps | All sizes |
| **Backup** | Copy file | Export SQL |
| **File Size** | One file | Multiple files |

## Next Steps

1. ✅ Configuration updated
2. ⏳ Run `SETUP_MYSQL_DATABASE.bat`
3. ⏳ Verify in phpMyAdmin
4. ⏳ Test login and features
5. ⏳ Add your medicines and categories

## Default Admin Account

After setup, use this to login:
```
Email: admin@medikiosk.com
Password: admin123
```

**⚠️ Change this password in production!**

## Tips

- 💾 **Regular Backups**: Export database weekly via phpMyAdmin
- 📊 **Monitor Size**: Check database size in phpMyAdmin
- 🔍 **Use Search**: phpMyAdmin search is powerful
- 📝 **SQL Tab**: Learn basic SQL for complex queries
- 🚀 **Optimize**: Run "Optimize table" in phpMyAdmin occasionally

---

## Need Help?

- **Laragon Issues**: Check if MySQL is running (green indicator)
- **phpMyAdmin**: http://localhost/phpmyadmin
- **MySQL Port**: Default 3306
- **Username**: root
- **Password**: (empty by default in Laragon)

🎉 **You're now using MySQL with phpMyAdmin!**
