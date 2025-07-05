<?php
header('Access-Control-Allow-Origin: *');

ini_set('display_errors', 1);
error_reporting(E_ALL);

// SQLite接続
$db = new PDO('sqlite:db/database.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// ID取得
$id = $_GET['id'] ?? null;

if (!$id) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'IDが指定されていません']);
  exit;
}

// groupsテーブルから基本情報取得
$stmt = $db->prepare('SELECT * FROM groups WHERE id = ?');
$stmt->execute([$id]);
$group = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$group) {
  http_response_code(404);
  echo json_encode(['success' => false, 'error' => 'データが見つかりません']);
  exit;
}

// images取得
$stmt = $db->prepare('SELECT * FROM images WHERE group_id = ? ORDER BY id ASC');
$stmt->execute([$id]);
$images = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 各画像に紐づくinstructionsを取得してマージ
foreach ($images as &$img) {
  $stmt = $db->prepare('SELECT * FROM instructions WHERE image_id = ? ORDER BY id ASC');
  $stmt->execute([$img['id']]);
  $img['instructions'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// JSON形式に変換（React用構造に合わせる）
$response = [
  'id' => $group['id'],
  'title' => $group['title'],
  'created_at' => $group['created_at'],
  'updated_at' => $group['updated_at'],
  'created_by' => $group['created_by'],
  'updated_by' => $group['updated_by'],
  'images' => array_map(function ($img) {
    return [
      'image' => $img['image'],
      'title' => $img['title'],
      'url' => $img['url'],
      'instructions' => array_map(function ($inst) {
        return [
          'id' => $inst['id'],
          'x' => (int)$inst['x'],
          'y' => (int)$inst['y'],
          'width' => (int)$inst['width'],
          'height' => (int)$inst['height'],
          'text' => $inst['text'],
          'comment' => $inst['comment'],
        ];
      }, $img['instructions']),
    ];
  }, $images)
];

header('Content-Type: application/json');
echo json_encode($response);
