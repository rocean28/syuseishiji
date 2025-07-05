<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['success' => false, 'error' => 'Invalid request']);
  exit;
}

if (!isset($_POST['group_id'])) {
  echo json_encode(['success' => false, 'error' => 'IDが指定されていません']);
  exit;
}

$groupId = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $_POST['group_id']); // 安全なフォルダ名に変換

$uploadDir = __DIR__ . '/uploads/' . $groupId . '/';

if (!file_exists($uploadDir)) {
  mkdir($uploadDir, 0777, true);
}

$result = [];

foreach ($_FILES as $key => $file) {
  if ($file['error'] !== UPLOAD_ERR_OK) {
    $result[] = ['file' => $key, 'success' => false, 'error' => 'アップロードエラー'];
    continue;
  }

  $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
  $filename = 'img_' . uniqid() . '.' . $ext;
  $filepath = $uploadDir . $filename;

  if (move_uploaded_file($file['tmp_name'], $filepath)) {
    $result[] = ['file' => $key, 'success' => true, 'filename' => $filename];
  } else {
    $result[] = ['file' => $key, 'success' => false, 'error' => '保存に失敗しました'];
  }
}

echo json_encode(['success' => true, 'results' => $result, 'filename' => $filename]);
