<?php
header('Access-Control-Allow-Origin: *');

ini_set('display_errors', 1);
error_reporting(E_ALL);

// SQLite接続
$db = new PDO('sqlite:db/database.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// groupsを取得
$stmt = $db->prepare('SELECT * FROM groups ORDER BY updated_at DESC');
$stmt->execute();
$groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

$results = [];

foreach ($groups as $group) {
  // 代表画像1件取得（画像がなければnull）
  $stmt = $db->prepare('SELECT image FROM images WHERE group_id = ? ORDER BY id ASC LIMIT 1');
  $stmt->execute([$group['id']]);
  $image = $stmt->fetchColumn();

  $results[] = [
    'id' => $group['id'],
    'title' => $group['title'],
    'created_at' => $group['created_at'],
    'updated_at' => $group['updated_at'],
    'created_by' => $group['created_by'],
    'updated_by' => $group['updated_by'],
    'image' => $image ?: null
  ];
}

header('Content-Type: application/json');
echo json_encode($results);
