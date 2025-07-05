<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$db = new PDO('sqlite:db/database.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// groups テーブル
$db->exec('
  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    title TEXT,
    created_at TEXT,
    updated_at TEXT,
    created_by TEXT,
    updated_by TEXT
  )
');

// images テーブル
$db->exec('
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id TEXT,
    image TEXT,
    title TEXT,
    url TEXT,
    FOREIGN KEY (group_id) REFERENCES groups(id)
  )
');

// instructions テーブル
$db->exec('
  CREATE TABLE IF NOT EXISTS instructions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id INTEGER,
    x REAL,
    y REAL,
    width REAL,
    height REAL,
    text TEXT,
    comment TEXT,
    FOREIGN KEY (image_id) REFERENCES images(id)
  )
');

echo 'DB初期化完了';
