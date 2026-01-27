# Epics and Stories - WaterHouse Application

**Date:** 26 January 2026  
**Author:** John (Product Manager)  
**Based on PRD:** WaterHouse PRD v1.0

## Overview

This document outlines the epics and user stories for the WaterHouse MVP, derived from the Product Requirements Document. Epics represent major features that will be broken down into smaller, implementable user stories.

## Epics

### Epic 1: User Authentication and Authorization

**Description:** Implement secure user authentication and role-based access control for all user types (Meter Readers, Property Managers, Tenants).

**Priority:** High  
**Estimated Effort:** 2-3 weeks

### Epic 2: Property and Asset Management

**Description:** Create and manage properties, buildings, apartments, and water meters with their specifications.

**Priority:** High  
**Estimated Effort:** 3-4 weeks

### Epic 3: Meter Reading Management

**Description:** Enable meter readers to capture readings with photos, validate data, and sync offline/online.

**Priority:** High  
**Estimated Effort:** 4-5 weeks

### Epic 4: Billing and Invoice Generation

**Description:** Automatically calculate consumption, generate invoices, and manage billing cycles.

**Priority:** High  
**Estimated Effort:** 3-4 weeks

### Epic 5: Communication and Notifications

**Description:** Send invoices and notifications via SMS, email, and in-app notifications.

**Priority:** High  
**Estimated Effort:** 2-3 weeks

### Epic 6: Admin Dashboard and Reporting

**Description:** Provide web interface for property managers to oversee operations and generate reports.

**Priority:** Medium  
**Estimated Effort:** 3-4 weeks

### Epic 7: Mobile App Core Functionality

**Description:** Develop the Android mobile app with intuitive UI for meter reading workflow.

**Priority:** High  
**Estimated Effort:** 5-6 weeks

### Epic 8: Offline Mode and Synchronization

**Description:** Ensure full offline capability with reliable data synchronization when online.

**Priority:** High  
**Estimated Effort:** 2-3 weeks

### Epic 9: Data Import/Export

**Description:** Import existing data from Excel and export reports in various formats.

**Priority:** Medium  
**Estimated Effort:** 1-2 weeks

### Epic 10: System Administration

**Description:** Backend administration, monitoring, and maintenance features.

**Priority:** Medium  
**Estimated Effort:** 2-3 weeks

## User Stories

### Epic 1: User Authentication and Authorization

**Story 1.1:** As a Meter Reader, I want to log in with my phone number and OTP so that I can securely access the app.  
**Acceptance Criteria:**

- Phone number input with country code
- OTP sent via SMS
- Session timeout after 24 hours
- Invalid OTP attempts limited to 3

**Story 1.2:** As a Property Manager, I want to log in with email and password so that I can access the admin dashboard.  
**Acceptance Criteria:**

- Email/password authentication
- Password reset via email
- Two-factor authentication option
- Role-based access to features

**Story 1.3:** As a Tenant, I want to view my invoices without logging in so that I can check my bills easily.  
**Acceptance Criteria:**

- Public access to invoice view via unique link
- No authentication required for viewing
- Secure link generation

### Epic 2: Property and Asset Management

**Story 2.1:** As a Property Manager, I want to create and manage buildings so that I can organize my properties.  
**Acceptance Criteria:**

- Add/edit/delete buildings
- Address, number of floors, total apartments
- Associate buildings with managers

**Story 2.2:** As a Property Manager, I want to create and manage apartments so that I can track rental units.  
**Acceptance Criteria:**

- Add/edit/delete apartments
- Floor, number, size, rent amount
- Link to buildings and tenants

**Story 2.3:** As a Property Manager, I want to register water meters so that I can track consumption.  
**Acceptance Criteria:**

- Meter number, brand, diameter, installation date
- Link to specific apartments
- Previous reading index

**Story 2.4:** As a Property Manager, I want to manage tenant information so that I can maintain accurate records.  
**Acceptance Criteria:**

- Name, phone, email, lease dates
- Link tenants to apartments
- Multiple tenants per apartment support

### Epic 3: Meter Reading Management

**Story 3.1:** As a Meter Reader, I want to view my assigned meters for reading so that I know what to do.  
**Acceptance Criteria:**

- List of meters by building/apartment
- Sort by priority or location
- Show last reading date and status

**Story 3.2:** As a Meter Reader, I want to capture meter readings with photos so that I have proof of the reading.  
**Acceptance Criteria:**

- Large numeric input field
- Camera integration (take photo or select from gallery)
- Photo preview and retake option
- Mandatory photo requirement

**Story 3.3:** As a Meter Reader, I want validation alerts for suspicious readings so that I can correct errors.  
**Acceptance Criteria:**

- Alert if current reading < previous reading
- Warning for unusually high consumption
- Confirmation dialog for suspicious values

**Story 3.4:** As a Meter Reader, I want to add notes to readings so that I can explain anomalies.  
**Acceptance Criteria:**

- Optional text field for remarks
- Character limit (500 chars)
- Save with reading data

### Epic 4: Billing and Invoice Generation

**Story 4.1:** As the System, I want to automatically calculate consumption so that bills are accurate.  
**Acceptance Criteria:**

- Consumption = current reading - previous reading
- Handle meter resets (if current < previous)
- Store calculation history

**Story 4.2:** As the System, I want to generate invoices based on consumption and tariffs so that tenants receive bills.  
**Acceptance Criteria:**

- Apply correct tariff rates
- Calculate taxes and fees
- Generate PDF invoice
- Include consumption details and period

**Story 4.3:** As a Property Manager, I want to customize billing rules per property so that I can handle different scenarios.  
**Acceptance Criteria:**

- Fixed fees, tiered pricing
- Tax rates configuration
- Billing cycle configuration (monthly, etc.)

**Story 4.4:** As a Property Manager, I want to manually adjust invoices so that I can handle special cases.  
**Acceptance Criteria:**

- Edit amounts before sending
- Add adjustment notes
- Audit trail of changes

### Epic 5: Communication and Notifications

**Story 5.1:** As the System, I want to send invoices via SMS so that tenants receive bills immediately.  
**Acceptance Criteria:**

- SMS with invoice summary and PDF link
- Use reliable SMS provider (Africa's Talking/Twilio)
- Delivery confirmation tracking

**Story 5.2:** As the System, I want to send email invoices as backup so that tenants have alternatives.  
**Acceptance Criteria:**

- Email with PDF attachment
- HTML email template
- Send if SMS fails

**Story 5.3:** As a Property Manager, I want to resend invoices so that I can handle delivery issues.  
**Acceptance Criteria:**

- Manual resend option
- Choose SMS or email
- Track resend history

### Epic 6: Admin Dashboard and Reporting

**Story 6.1:** As a Property Manager, I want a dashboard overview so that I can monitor operations.  
**Acceptance Criteria:**

- Total readings completed this month
- Pending readings count
- Invoices sent vs pending
- Revenue summary

**Story 6.2:** As a Property Manager, I want to view and edit reading data so that I can correct errors.  
**Acceptance Criteria:**

- List all readings with photos
- Edit reading values
- Approve/reject readings
- Bulk operations

**Story 6.3:** As a Property Manager, I want to generate reports so that I can analyze performance.  
**Acceptance Criteria:**

- Export to Excel/CSV
- Consumption reports
- Payment status reports
- Reading completion reports

### Epic 7: Mobile App Core Functionality

**Story 7.1:** As a Meter Reader, I want an intuitive home screen so that I can quickly access features.  
**Acceptance Criteria:**

- Clear navigation menu
- Quick access to today's readings
- Status indicators (online/offline)

**Story 7.2:** As a Meter Reader, I want offline reading capability so that I can work without network.  
**Acceptance Criteria:**

- Store readings locally
- Sync when network available
- Conflict resolution for concurrent edits

**Story 7.3:** As a Meter Reader, I want to view my reading history so that I can track my work.  
**Acceptance Criteria:**

- Personal reading log
- Filter by date/building
- Show completion status

### Epic 8: Offline Mode and Synchronization

**Story 8.1:** As a Meter Reader, I want automatic sync when online so that my data is always up to date.  
**Acceptance Criteria:**

- Background sync when network detected
- Progress indicator
- Error handling for sync failures

**Story 8.2:** As a Meter Reader, I want manual sync option so that I can control when to sync.  
**Acceptance Criteria:**

- Sync button in app
- Show sync status and last sync time
- Retry failed syncs

**Story 8.3:** As the System, I want to handle sync conflicts so that data integrity is maintained.  
**Acceptance Criteria:**

- Detect conflicting readings
- User choice to keep local or server version
- Audit trail of conflict resolution

### Epic 9: Data Import/Export

**Story 9.1:** As a Property Manager, I want to import existing data from Excel so that I can migrate from manual systems.  
**Acceptance Criteria:**

- Excel template provided
- Validate data before import
- Error reporting for invalid data
- Rollback on critical errors

**Story 9.2:** As a Property Manager, I want to export data regularly so that I can backup and analyze.  
**Acceptance Criteria:**

- Export buildings, apartments, tenants, meters
- Export readings and invoices
- CSV and Excel formats
- Scheduled export option

### Epic 10: System Administration

**Story 10.1:** As an Admin, I want user management so that I can control access.  
**Acceptance Criteria:**

- Create/edit/delete users
- Assign roles and permissions
- User activity logs

**Story 10.2:** As an Admin, I want system monitoring so that I can ensure reliability.  
**Acceptance Criteria:**

- Error logs and alerts
- Performance metrics
- Database backup status

**Story 10.3:** As an Admin, I want configuration management so that I can customize the system.  
**Acceptance Criteria:**

- SMS provider settings
- Tariff configurations
- System parameters

---

## Implementation Notes

- **MVP Focus:** Prioritize Epics 1, 2, 3, 4, 5, 7, 8 for core functionality
- **Technology Stack:** React Native (mobile), Node.js/NestJS (backend), PostgreSQL (database), React (web admin)
- **Offline-First:** Ensure all critical features work offline
- **Security:** Implement proper authentication and data validation
- **Testing:** Unit tests for calculations, integration tests for sync, manual testing for UX

## Next Steps

1. Review and prioritize stories with development team
2. Create detailed acceptance criteria for high-priority stories
3. Estimate effort and create sprint backlog
4. Begin implementation with authentication and core data models
