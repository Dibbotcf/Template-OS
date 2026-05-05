-- Template OS Database Schema
-- Run this file once to set up all tables

CREATE DATABASE IF NOT EXISTS templateos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE templateos;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login  DATETIME NULL,
  is_deleted  TINYINT(1) DEFAULT 0
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  color       VARCHAR(7) NOT NULL DEFAULT '#378ADD',
  created_by  INT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted  TINYINT(1) DEFAULT 0,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Template fields table
CREATE TABLE IF NOT EXISTS template_fields (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  template_id   INT NOT NULL,
  label         VARCHAR(100) NOT NULL,
  type          ENUM('short_text','paragraph','number','email','phone','date','time','dropdown','multiple_choice','checkbox','file_upload','image_upload','linear_scale','rating','multiple_choice_grid','tick_box_grid') NOT NULL,
  placeholder   VARCHAR(150) NULL,
  is_required   TINYINT(1) DEFAULT 0,
  default_value TEXT NULL,
  options       JSON NULL,
  position      INT DEFAULT 0,
  FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- Template data entries
CREATE TABLE IF NOT EXISTS template_data (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  created_by  INT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES templates(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Template data values (EAV pattern)
CREATE TABLE IF NOT EXISTS template_data_values (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  data_id   INT NOT NULL,
  field_id  INT NOT NULL,
  value     TEXT NULL,
  FOREIGN KEY (data_id)  REFERENCES template_data(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES template_fields(id)
);

-- Delete requests
CREATE TABLE IF NOT EXISTS delete_requests (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  template_id  INT NOT NULL,
  requested_by INT NOT NULL,
  reason       TEXT NULL,
  status       ENUM('pending','approved','rejected') DEFAULT 'pending',
  reviewed_by  INT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at  DATETIME NULL,
  FOREIGN KEY (template_id)  REFERENCES templates(id),
  FOREIGN KEY (requested_by) REFERENCES users(id),
  FOREIGN KEY (reviewed_by)  REFERENCES users(id)
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  action      VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id   INT NOT NULL,
  details     JSON NULL,
  timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_templates_created_by   ON templates(created_by);
CREATE INDEX IF NOT EXISTS idx_template_fields_tid    ON template_fields(template_id);
CREATE INDEX IF NOT EXISTS idx_template_data_tid      ON template_data(template_id);
CREATE INDEX IF NOT EXISTS idx_tdv_data_id            ON template_data_values(data_id);
CREATE INDEX IF NOT EXISTS idx_tdv_field_id           ON template_data_values(field_id);
CREATE INDEX IF NOT EXISTS idx_delete_requests_status ON delete_requests(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user     ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity   ON activity_logs(entity_type, entity_id);
