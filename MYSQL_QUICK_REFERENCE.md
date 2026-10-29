# 🚀 MySQL Quick Reference - MediKiosk

## ⚡ Quick Start

### 1. Start Laragon
- Open Laragon → Click "Start All"
- Wait for green indicators (Apache + MySQL)

### 2. Setup Database (First Time Only)
- Double-click: `SETUP_MYSQL_DATABASE.bat`

### 3. Access phpMyAdmin
- URL: http://localhost/phpmyadmin
- Database: `medikiosk`

### 4. Start Application
- Run: `START_BACKEND.bat`
- Run: `START_FRONTEND.bat`

## 📊 Database Info

```
Database Name: medikiosk
Server: localhost (127.0.0.1)
Port: 3306
Username: root
Password: (empty)
```

## 🗂️ Tables

| Table | Purpose |
|-------|---------|
| `users` | Admin/Staff accounts |
| `medicines` | Medicine inventory |
| `categories` | Medicine categories |
| `orders` | Sales records |
| `order_items` | Order details |
| `stock_movements` | Stock history |
| `expiry_records` | Batch tracking |

## 💻 Useful Commands

### Access MySQL
```bash
# Via Laragon Terminal
mysql -u root

# Select database
USE medikiosk;

# Show tables
SHOW TABLES;

# View data
SELECT * FROM medicines;
```

### Reset Database
```bash
cd laravel_backend
php artisan migrate:fresh --seed
```

### Backup Database
```bash
mysqldump -u root medikiosk > backup.sql
```

### Restore Database
```bash
mysql -u root medikiosk < backup.sql
```

## 🔍 Common SQL Queries

### View All Medicines
```sql
SELECT * FROM medicines ORDER BY name;
```

### Low Stock Alert
```sql
SELECT name, stock_quantity 
FROM medicines 
WHERE stock_quantity < 50;
```

### Today's Orders
```sql
SELECT * FROM orders 
WHERE DATE(created_at) = CURDATE();
```

### Category Summary
```sql
SELECT category, COUNT(*) as total 
FROM medicines 
GROUP BY category;
```

### Recent Stock Changes
```sql
SELECT m.name, sm.movement_type, sm.quantity_change, sm.created_at
FROM stock_movements sm
JOIN medicines m ON sm.medicine_id = m.id
ORDER BY sm.created_at DESC
LIMIT 10;
```

## 🎯 phpMyAdmin Shortcuts

| Action | Steps |
|--------|-------|
| View data | Click table → Browse |
| Add record | Click table → Insert |
| Edit record | Browse → Click pencil icon |
| Delete record | Browse → Check box → Delete |
| Export DB | Select database → Export → Go |
| Import DB | Select database → Import → Choose file |
| Run SQL | SQL tab → Type query → Go |

## ⚙️ Configuration Files

### Backend (.env)
```
laravel_backend/.env
```

### Database Location (MySQL Data)
```
C:\laragon\data\mysql\
```

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect | Start Laragon, check green indicators |
| Table not found | Run migrations: `php artisan migrate` |
| Access denied | Check username/password in .env |
| Database doesn't exist | Run `SETUP_MYSQL_DATABASE.bat` |

## 📱 URLs

| Service | URL |
|---------|-----|
| phpMyAdmin | http://localhost/phpmyadmin |
| Backend API | http://localhost:8000 |
| Frontend | http://localhost:5173 |
| API Health | http://localhost:8000/api/health |

## 🔐 Default Login

```
Email: admin@medikiosk.com
Password: admin123
```

## 💾 Backup Schedule

- ✅ Daily: Not needed for development
- ✅ Weekly: Export via phpMyAdmin
- ✅ Before updates: Always backup first
- ✅ Before migrations: Run backup

## 📈 Monitoring

### Check Database Size
- phpMyAdmin → medikiosk → Operations tab → "Data size"

### Check Table Rows
```sql
SELECT table_name, table_rows 
FROM information_schema.tables 
WHERE table_schema = 'medikiosk';
```

## 🎨 Status Colors in Laragon

- 🟢 Green: Running (good)
- 🔴 Red: Stopped (need to start)
- 🟡 Yellow: Starting/Stopping

## ⚡ Performance Tips

1. Add indexes on frequently searched columns
2. Use SELECT only needed columns
3. Limit results with LIMIT clause
4. Regular OPTIMIZE TABLE
5. Monitor slow queries

## 🆘 Emergency Commands

### Stop MySQL
```bash
# In Laragon Terminal
net stop mysql
```

### Start MySQL
```bash
net start mysql
```

### Clear Cache
```bash
cd laravel_backend
php artisan cache:clear
php artisan config:clear
```

## 📚 Resources

- Laragon Docs: https://laragon.org/docs/
- MySQL Docs: https://dev.mysql.com/doc/
- phpMyAdmin: https://www.phpmyadmin.net/docs/
- Laravel DB: https://laravel.com/docs/database

---

**Quick Help**: If something doesn't work, restart Laragon first! 🔄
