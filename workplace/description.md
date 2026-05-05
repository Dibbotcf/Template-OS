# Template OS — Project Description

## Overview
**Template OS** is a robust, dynamic platform designed to modernize and streamline organizational data collection and template management. It serves as a centralized hub where administrators can design complex data entry forms (templates), and employees can use those templates to submit, track, and manage operational data.

Built with a high-fidelity React frontend and a scalable Node.js/MySQL backend, Template OS replaces fragmented spreadsheets and legacy systems with a polished, professional workspace.

---

## Core Value Proposition
- **Flexibility**: Build any type of data collection form without writing code.
- **Reliability**: Centralized database ensures data integrity and accessibility.
- **Accountability**: Role-based access and activity logs track every change.
- **Professionalism**: Premium UI/UX designed for modern business environments.

---

## Key Features

### 1. Dynamic Template Builder
The heart of the platform. Admins can create custom templates using a wide array of specialized field types:
- **Standard Inputs**: Short text, Paragraphs, Numbers, Emails, Phone numbers.
- **Choice Inputs**: Multi-choice, Dropdowns, Checkboxes.
- **Advanced Controls**: Linear scales (1-5), Star ratings.
- **Complex Data**: Multiple-choice grids and Tick-box grids (fully customizable rows and columns).
- **Media Support**: Integrated file and image upload zones with live previews.

### 2. Workspace Management
- **Dashboard**: High-level overview of workspace growth, activity, and key metrics.
- **Template Library**: Browse and access all active templates in the organization.
- **Data Entry**: Smooth, user-friendly interface for submitting entries with real-time validation.

### 3. Admin Console
Comprehensive administrative controls to ensure platform security and data hygiene:
- **User Management**: Add, remove, and manage roles (Admin vs. Employee).
- **Template Delete Module**: Hard-delete templates with cascading removal of all associated data.
- **Deletion Requests**: Workflow for employees to request template removal with admin approval/rejection.
- **Audit Trail**: Detailed activity logs showing who did what and when.

### 4. Advanced Analytics
Visualize data collection trends and template distribution through an integrated analytics dashboard, providing operational insights at a glance.

---

## Technical Stack
- **Frontend**: React (Vite), Axios, Framer Motion (animations), Lucide Icons.
- **Backend**: Node.js, Express, MySQL (mysql2), JWT (authentication).
- **Deployment**: Git-driven workflow with automated frontend FTP deployment and cPanel backend management.

---

## Target Audience
Template OS is ideal for organizations that handle frequent data reporting, inventory tracking, performance reviews, or any operational task requiring structured, consistent data collection across a team.
