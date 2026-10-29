# PHARMACY SELF-SERVICE ORDERING SYSTEM - REQUIREMENTS DOCUMENT

**Project Name:** MediKiosk  
**Version:** 1.0  
**Date:** October 16, 2026  
**Status:** Phase 1 - Foundation Complete

---

## 1. PROJECT OVERVIEW

### 1.1 Purpose
MediKiosk is a web-based Pharmacy Self-Service Ordering System that enables customers to:
- Browse and search medicines independently
- Select items and quantities
- Submit orders for pharmacy staff confirmation
- Receive order receipts

And enables pharmacy staff to:
- Manage medicine inventory
- Process customer orders
- Confirm payments/transactions
- Generate reports
- Monitor stock levels

### 1.2 Technology Stack

**Backend:**
- Laravel 13 (PHP 8.3+)
- MySQL/SQLite Database
- Laravel Eloquent ORM
- RESTful JSON API
- Laravel Sanctum (Authentication)

**Frontend:**
- React 18
- Vite 6
- Tailwind CSS 3
- React Router
- Lucide React Icons
- Fetch API

**Development Environment:**
- Windows OS
- Visual Studio Code
- Kiro AI
- Laragon/XAMPP (optional)
- Git/GitHub

### 1.3 Current Implementation Status

**✅ Completed:**
- Laravel backend installed and configured
- React frontend with Vite build system
- Database schema (medicines, orders, order_items)
- Medicine and Order models with relationships
- API controllers with validation
- 12 RESTful API endpoints
- Professional landing page
- Interactive demo interface
- CORS configuration
- 10 seeded demo medicines

**🚧 In Progress:**
- Full customer ordering workflow
- Real API integration in frontend
- Authentication system

**📋 Planned:**
- Staff dashboard
- Inventory management interface
- Order processing workflow
- Transaction system
- Receipt generation
- Reports and analytics

---

## 2. USER ROLES AND PERMISSIONS

### 2.1 Customer (Unauthenticated)

**Access:**
- Landing page
- Medicine catalog
- Medicine search
- Shopping cart
- Order submission
- Order status view

**Restrictions:**
- No access to staff dashboard
- No inventory management
- No order processing functions
- No administrative features
- No direct database access

**Notes:**
- Initially no customer accounts required
- Consider optional accounts for order history only

### 2.2 Pharmacy Staff

**Access:**
- Staff login
- Staff dashboard
- View all medicines
- Add/edit medicines
- Update stock levels
- View stock movements
- View customer orders
- Process orders (confirm/reject)
- Record payment confirmation
- Complete transactions
- Print receipts
- View transaction history
- View basic reports

**Restrictions:**
- Cannot access admin-only functions
- Cannot manage other staff accounts
- Cannot modify system settings
- Actions must be logged

### 2.3 Administrator

**Access:**
- All staff functions
- Manage staff accounts
- Assign roles and permissions
- Manage categories
- View all transactions
- Access advanced reports
- View audit logs
- Configure system settings
- Manage database backups

**Security Requirements:**
- Backend enforcement of all permissions
- Route-level authorization
- No security through UI hiding alone

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Landing Page (✅ COMPLETED)

**Requirements:**
- [x] Professional pharmacy-themed design
- [x] Responsive navigation bar with mobile menu
- [x] Hero section with value proposition
- [x] System capabilities showcase
- [x] Feature descriptions with icons
- [x] 5-step workflow explanation
- [x] Interactive system preview/demo
- [x] About section
- [x] Contact form with validation
- [x] Footer with links
- [x] Green/white/gray color scheme
- [x] Tailwind CSS styling
- [x] Mobile responsive

### 3.2 Medicine Catalog (✅ BACKEND / 🚧 FRONTEND)

**Backend Requirements:**
- [x] Medicine model with attributes
- [x] API endpoints (GET /api/medicines)
- [x] Search by name, code, category
- [x] Filter by category
- [x] Filter by stock availability
- [x] Pagination support
- [x] Proper validation
- [x] Error handling

**Frontend Requirements:**
- [x] Display medicine cards (demo only)
- [ ] Connect to real API
- [ ] Implement search functionality
- [ ] Category filtering
- [ ] Sort options
- [ ] Loading states
- [ ] Empty states
- [ ] Error messages
- [ ] Responsive grid

**Medicine Attributes:**
- Medicine code (unique)
- Barcode value
- Name
- Description
- Category
- Price
- Stock quantity
- Expiry date
- Active/inactive status

### 3.3 Medicine Code Entry (📋 PLANNED)

**Requirements:**
- [ ] Manual code input field
- [ ] Code validation
- [ ] Medicine lookup by code
- [ ] Display medicine details
- [ ] Add to cart option
- [ ] Error messages for invalid codes
- [ ] Loading indicator
- [ ] Future barcode scanner support

**Scanner Support (Future):**
- Store barcode values in database
- Prevent duplicate barcodes
- Handle scanner as keyboard input
- Test with actual hardware before deployment

### 3.4 Shopping Cart (🚧 PARTIAL)

**Current Status:**
- [x] Demo cart in SystemPreview component
- [ ] Persistent cart state
- [ ] Local storage backup
- [ ] API integration for stock validation

**Requirements:**
- [ ] Add medicine to cart
- [ ] Remove medicine from cart
- [ ] Update quantity (increase/decrease)
- [ ] Direct quantity input
- [ ] Clear entire cart
- [ ] Display item subtotals
- [ ] Display order total
- [ ] Validate against stock levels
- [ ] Prevent negative quantities
- [ ] Prevent zero quantities
- [ ] Handle out-of-stock items
- [ ] Show cart item count
- [ ] Empty cart message
- [ ] Decimal-safe calculations

**Business Rules:**
- Cart does not reserve stock
- Stock validated at order submission
- Prices fetched from backend
- Browser cannot set prices
- One line per medicine
- Maximum quantity limits enforced

### 3.5 Order Review and Submission (📋 PLANNED)

**Requirements:**
- [ ] Display order summary
- [ ] Show all cart items
- [ ] Display quantities and prices
- [ ] Calculate accurate totals
- [ ] Show any warnings/notices
- [ ] Confirm order button
- [ ] Return to catalog option
- [ ] Prevent duplicate submission
- [ ] Generate unique order number
- [ ] Display order confirmation
- [ ] Show order status

**Order Statuses:**
- Pending Review
- Awaiting Payment
- Confirmed
- Completed
- Rejected
- Cancelled

**Backend Validation:**
- Revalidate all prices
- Check current stock levels
- Verify product availability
- Check for expired products
- Prevent restricted items
- Use database transactions
- Implement row locking

### 3.6 Inventory Management (📋 PLANNED)

**Staff Interface Requirements:**
- [ ] Medicine list page
- [ ] Add medicine form
- [ ] Edit medicine form
- [ ] Search and filter
- [ ] Stock adjustment interface
- [ ] Stock movement history
- [ ] Low-stock warnings
- [ ] Out-of-stock alerts
- [ ] Expiry monitoring
- [ ] Category management
- [ ] Bulk operations (careful)
- [ ] Archive/deactivate medicines

**Stock Management:**
- [ ] Record all stock changes
- [ ] Track adjustment reasons
- [ ] Log responsible user
- [ ] Timestamp all movements
- [ ] Prevent unauthorized changes
- [ ] Support stock corrections
- [ ] Calculate stock value
- [ ] Generate stock reports

**Data Integrity:**
- Never delete medicines with order history
- Archive instead of delete
- Preserve transaction data
- Use soft deletes where appropriate

### 3.7 Order Processing (📋 PLANNED)

**Staff Order Management:**
- [ ] View all orders
- [ ] Search by order number
- [ ] Filter by status
- [ ] Filter by date range
- [ ] View order details
- [ ] Display customer (if tracked)
- [ ] Show order items
- [ ] Display order total
- [ ] Confirm orders
- [ ] Reject orders with reason
- [ ] Record payment
- [ ] Complete transactions
- [ ] Cancel orders
- [ ] Track status history

**Status Transitions:**
```
Pending Review → Awaiting Payment → Confirmed → Completed
                      ↓                ↓          
                  Rejected         Cancelled
```

**Stock Deduction Rules:**
- Stock NOT deducted on order submission
- Stock deducted when order confirmed/completed
- Use database transactions
- Implement row-level locking
- Prevent duplicate deduction
- Handle concurrent orders
- Revalidate stock before completion

### 3.8 Payment Workflow (📋 PLANNED)

**Initial Implementation:**
- Staff confirmation workflow
- No payment gateway
- Manual payment verification
- Payment status tracking

**Payment Attributes:**
- Payment status (pending/confirmed/failed/refunded)
- Payment method (cash/card/etc)
- Amount
- Confirmation timestamp
- Confirmed by (staff ID)
- Reference number (optional)

**Requirements:**
- [ ] Record payment confirmation
- [ ] Validate payment amount matches order
- [ ] Log confirming staff member
- [ ] Timestamp confirmation
- [ ] Prevent duplicate payment
- [ ] Support payment status changes
- [ ] Handle failed payments
- [ ] Support refunds (future)

**Security:**
- Never trust browser-provided payment status
- Verify on backend only
- Do not store card numbers/CVVs
- Follow PCI compliance if cards handled

### 3.9 Transaction History (📋 PLANNED)

**Requirements:**
- [ ] Transaction list view
- [ ] Search by transaction number
- [ ] Search by order number
- [ ] Filter by date range
- [ ] Filter by status
- [ ] View transaction details
- [ ] Display items sold
- [ ] Show payment information
- [ ] Display staff member
- [ ] Print/reprint receipts
- [ ] Export to CSV
- [ ] Pagination

**Transaction Record:**
- Transaction number (unique)
- Order reference
- Date and time
- Items sold (snapshot)
- Quantities
- Unit prices (historical)
- Subtotals
- Total amount
- Payment status
- Payment method
- Staff member
- Timestamps

**Data Preservation:**
- Never modify completed transactions
- Store price snapshots
- Preserve product names
- Use reversal/refund procedures
- Maintain audit trail

### 3.10 Receipt Generation (📋 PLANNED)

**Initial Implementation:**
- Browser-based printing
- CSS print styles
- Standard paper format

**Receipt Content:**
- [ ] Pharmacy name/logo
- [ ] Business information
- [ ] Receipt number
- [ ] Order number
- [ ] Date and time
- [ ] Medicine names
- [ ] Quantities
- [ ] Unit prices
- [ ] Item subtotals
- [ ] Total amount
- [ ] Payment method/status
- [ ] Staff identifier
- [ ] Thank you message

**Requirements:**
- [ ] Dedicated receipt component
- [ ] Print-specific CSS
- [ ] Browser print dialog
- [ ] Reprint capability (authorized)
- [ ] Prevent receipt for incomplete orders
- [ ] Future thermal printer support

**Printer Integration (Future):**
- Test with actual thermal printer
- Determine paper width (58mm/80mm)
- Use appropriate print library
- Handle printer errors
- Queue print jobs

### 3.11 Reports and Analytics (📋 PLANNED)

**Sales Reports:**
- [ ] Daily sales summary
- [ ] Weekly sales summary
- [ ] Monthly sales summary
- [ ] Sales by medicine
- [ ] Sales by category
- [ ] Top-selling products
- [ ] Revenue trends
- [ ] Transaction counts

**Inventory Reports:**
- [ ] Current stock levels
- [ ] Low-stock items
- [ ] Out-of-stock items
- [ ] Expiring products
- [ ] Expired products
- [ ] Stock movement history
- [ ] Stock value calculation
- [ ] Reorder recommendations

**Order Reports:**
- [ ] Order volume by period
- [ ] Order status distribution
- [ ] Cancelled/rejected orders
- [ ] Average order value
- [ ] Processing time metrics

**Export Options:**
- [ ] CSV export
- [ ] PDF export (future)
- [ ] Date range filtering
- [ ] Custom filters

**Important:**
- All figures from real database
- Document calculation methods
- No fabricated sales data
- Clear data source labels

### 3.12 Authentication & Authorization (📋 PLANNED)

**Authentication:**
- [ ] Staff login page
- [ ] Secure password hashing (bcrypt)
- [ ] Session management
- [ ] Remember me option
- [ ] Logout functionality
- [ ] Password reset (future)
- [ ] Account lockout after failed attempts
- [ ] Rate limiting

**Authorization:**
- [ ] Role-based access control
- [ ] Route protection (backend)
- [ ] Middleware guards
- [ ] Permission checks in controllers
- [ ] Frontend route guards
- [ ] Component-level permissions
- [ ] API token authentication

**Roles:**
- Staff
- Administrator

**Security Measures:**
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] SQL injection prevention
- [ ] Rate limiting
- [ ] Secure cookies
- [ ] HTTPS in production
- [ ] Environment-based secrets
- [ ] No credentials in React code
- [ ] No secrets in Git

### 3.13 Audit Logging (📋 PLANNED)

**Logged Actions:**
- [ ] Staff login/logout
- [ ] Medicine creation/modification
- [ ] Stock adjustments
- [ ] Order status changes
- [ ] Payment confirmations
- [ ] Transaction completion
- [ ] Receipt reprints
- [ ] Failed login attempts
- [ ] Permission violations

**Log Attributes:**
- User ID
- Action type
- Entity type
- Entity ID
- Changes made
- IP address
- Timestamp
- Result (success/failure)

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance
- Page load time < 2 seconds
- API response time < 500ms
- Support 50+ concurrent users
- Efficient database queries
- Pagination for large datasets
- Optimized React rendering

### 4.2 Security
- HTTPS in production
- Secure password storage
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting
- Input validation
- Output sanitization
- Secure session management
- Regular security updates

### 4.3 Usability
- Intuitive navigation
- Clear labels and instructions
- Helpful error messages
- Loading indicators
- Success confirmations
- Touch-friendly controls (future kiosk)
- Keyboard navigation support
- Screen reader compatible
- Consistent design language

### 4.4 Reliability
- Data validation
- Error handling
- Transaction rollback on failure
- Database backups
- Logging and monitoring
- Graceful degradation
- Recovery procedures

### 4.5 Maintainability
- Clean code structure
- Component reusability
- Clear documentation
- Consistent naming
- Version control
- Automated tests
- Development environment docs

### 4.6 Scalability
- Efficient database design
- Indexed queries
- Caching strategy (future)
- API pagination
- Optimized assets
- CDN support (future)

---

## 5. BUSINESS RULES

### 5.1 Critical Rules

**Pricing and Calculations:**
- Backend is sole authority for prices
- Browser cannot set prices
- Use decimal-safe arithmetic
- Revalidate totals on backend

**Stock Management:**
- Cart does not reserve stock
- Stock validated at order submission
- Stock deducted only on confirmation/completion
- Prevent overselling with row locking
- No duplicate stock deduction

**Order Processing:**
- Each order gets unique number
- Status transitions must be validated
- Completed orders cannot be re-completed
- Historical data must be preserved
- Order items store price snapshots

**Payment:**
- Payment status reflects real verification
- No fabricated payment success
- Staff confirmation required initially
- Future gateway must use server-side verification

**Medicine Eligibility:**
- Expired products cannot be ordered
- Inactive products not shown to customers
- Prescription items need authorization
- Stock availability checked

**Data Integrity:**
- No deletion of historical transaction data
- Archive instead of delete
- Preserve order item details
- Log all critical changes
- Use database transactions

### 5.2 Validation Rules

**Medicine:**
- Code must be unique
- Barcode must be unique (if provided)
- Price must be positive
- Stock quantity must be non-negative
- Category required
- Name required

**Order:**
- Must contain at least 1 item
- Each item must have valid medicine ID
- Quantity must be positive integer
- Stock must be available
- Price validation on backend

**Stock Adjustment:**
- Reason required
- User must be authenticated
- Changes must be logged
- Final stock cannot be negative

**Transaction:**
- Order must be confirmed
- Payment must be verified
- Items must match order
- Total must match order
- Staff member required

---

## 6. CONSTRAINTS AND LIMITATIONS

### 6.1 Current Limitations

**Hardware:**
- No physical kiosk available yet
- No barcode scanner
- No thermal printer
- Standard browser and computer used

**Features:**
- No online payment gateway
- Staff confirmation workflow only
- Browser printing only
- SQLite database (can migrate to MySQL)

### 6.2 Future Considerations

**Hardware Integration:**
- Test with actual touchscreen/tablet
- Evaluate barcode scanner compatibility
- Test thermal printer integration
- Consider kiosk mode browser

**Advanced Features:**
- Customer accounts (optional)
- Loyalty programs
- Prescription verification
- E-prescriptions
- SMS notifications
- Email receipts
- Online payment gateway
- Multi-location support
- Advanced analytics

---

## 7. ACCEPTANCE CRITERIA

### 7.1 Phase 1 (Foundation) ✅ COMPLETE
- [x] Laravel backend installed
- [x] React frontend initialized
- [x] Database designed and migrated
- [x] Basic models created
- [x] API endpoints working
- [x] Landing page complete
- [x] Demo interface functional

### 7.2 Phase 2 (Customer Ordering) 🚧 CURRENT
- [ ] Medicine catalog page
- [ ] Real API integration
- [ ] Search functionality
- [ ] Medicine code entry
- [ ] Shopping cart
- [ ] Order submission
- [ ] Order confirmation

### 7.3 Phase 3 (Staff Inventory) 📋 PLANNED
- [ ] Staff login
- [ ] Inventory list
- [ ] Add/edit medicines
- [ ] Stock adjustments
- [ ] Low-stock alerts

### 7.4 Phase 4 (Order Processing) 📋 PLANNED
- [ ] Order management page
- [ ] Status transitions
- [ ] Payment confirmation
- [ ] Stock deduction

### 7.5 Phase 5 (Transactions) 📋 PLANNED
- [ ] Transaction records
- [ ] Receipt generation
- [ ] Transaction history
- [ ] Reprint capability

### 7.6 Phase 6 (Security) 📋 PLANNED
- [ ] Authentication system
- [ ] Role-based authorization
- [ ] Audit logging
- [ ] Security testing

### 7.7 Phase 7 (Reports) 📋 PLANNED
- [ ] Sales reports
- [ ] Inventory reports
- [ ] Dashboard analytics
- [ ] CSV exports

### 7.8 Phase 8 (Production Ready) 📋 PLANNED
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Deployment configured
- [ ] Backup system
- [ ] Monitoring setup

---

## 8. OUT OF SCOPE

**Not Included in Initial Version:**
- Customer accounts and profiles
- Online payment processing
- Physical kiosk deployment
- Hardware integration
- Mobile native apps
- Multi-pharmacy management
- Supplier management
- Purchase orders
- Advanced analytics
- SMS/Email notifications
- Prescription scanning
- Insurance processing
- Multi-language support

**These may be considered for future versions after core functionality is stable.**

---

## 9. GLOSSARY

**Medicine Code:** Unique internal identifier for each medicine  
**Barcode:** External barcode/QR code value for scanning  
**Order:** Customer request for medicines, pending staff approval  
**Transaction:** Completed and confirmed sale  
**Stock Movement:** Any change in medicine quantity  
**Receipt:** Printed record of completed transaction  
**Kiosk:** Customer-facing self-service interface  
**Staff Dashboard:** Administrative interface for pharmacy staff  
**Audit Log:** Record of important system actions  

---

**Document Version:** 1.0  
**Last Updated:** October 16, 2026  
**Next Review:** After Phase 2 completion
