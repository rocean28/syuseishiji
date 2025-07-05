<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
file_put_contents('debug_save.log', file_get_contents('php://input'));

// CORS対応
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type');
  header('Access-Control-Max-Age: 86400'); // 24時間キャッシュ
  exit;
}
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

try {
  $json = file_get_contents('php://input');
  $data = json_decode($json, true);

  if (!$data) {
    throw new Exception('JSONが無効です');
  }

  $db = new PDO('sqlite:db/database.sqlite');
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  $id = $data['id'] ?? ('group_' . uniqid('', true));
  $title = trim($data['title'] ?? '');
  if ($title === '') $title = '無題の修正指示';

  // groups テーブルに保存
  $stmt = $db->prepare('INSERT OR REPLACE INTO groups (id, title, created_at, updated_at, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)');
  $stmt->execute([
    $id,
    $title,
    $data['created_at'] ?? '',
    $data['updated_at'] ?? '',
    $data['created_by'] ?? 'guest',
    $data['updated_by'] ?? 'guest'
  ]);

  // images・instructions の旧データ削除（編集時）
  $stmtDeleteInstructions = $db->prepare('DELETE FROM instructions WHERE image_id IN (SELECT id FROM images WHERE group_id = ?)');
  $stmtDeleteInstructions->execute([$id]);

  $stmtDeleteImages = $db->prepare('DELETE FROM images WHERE group_id = ?');
  $stmtDeleteImages->execute([$id]);

  // images テーブルに保存
  $stmtImage = $db->prepare('INSERT INTO images (group_id, image, title, url) VALUES (?, ?, ?, ?)');
  $stmtInstruction = $db->prepare('INSERT INTO instructions (image_id, x, y, width, height, text, comment) VALUES (?, ?, ?, ?, ?, ?, ?)');

  foreach ($data['images'] as $img) {
    $imageFile = $img['image'] ?? '';
    if (!$imageFile) throw new Exception('画像ファイル名が指定されていません');

    $stmtImage->execute([
      $id,
      $imageFile,
      $img['title'] ?? '',
      $img['url'] ?? ''
    ]);

    $imageId = $db->lastInsertId();

    foreach ($img['instructions'] as $inst) {
      $stmtInstruction->execute([
        $imageId,
        $inst['x'],
        $inst['y'],
        $inst['width'],
        $inst['height'],
        $inst['text'] ?? '',
        $inst['comment'] ?? ''
      ]);
    }
  }

  echo json_encode(['success' => true, 'id' => $id]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'error' => $e->getMessage()
  ]);
}
