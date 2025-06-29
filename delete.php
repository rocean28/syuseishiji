<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$dataDir = __DIR__ . '/data';
$id = $_POST['id'] ?? '';

$targetDir = $dataDir . '/' . basename($id);

if (!preg_match('/^[a-zA-Z0-9_\-]+$/', $id)) {
  echo json_encode(['success' => false, 'error' => 'Invalid ID']);
  exit;
}

function deleteDir($dir) {
  if (!is_dir($dir)) return false;
  foreach (scandir($dir) as $item) {
    if ($item === '.' || $item === '..') continue;
    $path = $dir . DIRECTORY_SEPARATOR . $item;
    is_dir($path) ? deleteDir($path) : unlink($path);
  }
  return rmdir($dir);
}

if (is_dir($targetDir) && deleteDir($targetDir)) {
  echo json_encode(['success' => true]);
} else {
  echo json_encode(['success' => false, 'error' => '削除失敗または対象なし']);
}
