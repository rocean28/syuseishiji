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
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    throw new Exception('Invalid request method');
  }

  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);

  if (!isset($data['id'])) {
    throw new Exception('IDが指定されていません');
  }

  $id = $data['id'];

  // SQLite接続
  $db = new PDO('sqlite:db/database.sqlite');
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  // 対応する画像ファイルを削除
  $stmt = $db->prepare('SELECT image FROM images WHERE group_id = ?');
  $stmt->execute([$id]);
  $images = $stmt->fetchAll(PDO::FETCH_COLUMN);

  $uploadDir = __DIR__ . '/uploads/' . $id . '/';
  foreach ($images as $filename) {
    $filePath = $uploadDir . $filename;
    if (file_exists($filePath)) {
      unlink($filePath);
    }
  }

  // ディレクトリも削除
  if (is_dir($uploadDir)) {
    rmdir($uploadDir);
  }

  // instructions → images → groups の順に削除
  $stmt = $db->prepare('DELETE FROM instructions WHERE image_id IN (SELECT id FROM images WHERE group_id = ?)');
  $stmt->execute([$id]);

  $stmt = $db->prepare('DELETE FROM images WHERE group_id = ?');
  $stmt->execute([$id]);

  $stmt = $db->prepare('DELETE FROM groups WHERE id = ?');
  $stmt->execute([$id]);

  echo json_encode(['success' => true]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
