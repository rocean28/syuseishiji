<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$baseDir = __DIR__ . '/data';
$logFile = __DIR__ . '/log.txt';

// ログ出力用関数
function logMessage($message) {
  global $logFile;
  $timestamp = date('[Y-m-d H:i:s]');
  file_put_contents($logFile, "$timestamp $message\n", FILE_APPEND);
}

// 画像アップロード + 指示データ取得関数
function handleImageUpload($dir) {
  $results = [];

  foreach ($_FILES as $key => $file) {
    if (strpos($key, 'image_') !== 0) continue;

    $index = str_replace('image_', '', $key);
    $instKey = "instructions_$index";

    if (!isset($_POST[$instKey])) {
      // logMessage("instructions_$index がPOSTに存在しません");
      continue;
    }

    $instructions = json_decode($_POST[$instKey], true);
    if (!is_array($instructions)) {
      // logMessage("instructions_$index の形式が不正");
      continue;
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'png';
    $filename = "image_$index.$ext";
    $destination = "$dir/$filename";

    if (move_uploaded_file($file['tmp_name'], $destination)) {
      // logMessage("画像保存成功: $filename");
    } else {
      // logMessage("画像保存失敗: $filename (エラーコード: {$file['error']})");
      continue;
    }

    $results[] = [
      'image' => $filename,
      'title' => '',
      'instructions' => $instructions,
    ];
  }

  return $results;
}

// === 本処理開始 ===
// logMessage('=== 処理開始 ===');

if (!file_exists($baseDir)) {
  mkdir($baseDir, 0777, true);
  // logMessage("ディレクトリ作成: $baseDir");
}

$isUpdate = !empty($_POST['id']);
$groupId = $isUpdate ? preg_replace('/[^a-z0-9]/', '', $_POST['id']) : uniqid();
$dir = "$baseDir/$groupId";

if (!file_exists($dir)) {
  mkdir($dir, 0777, true);
  // logMessage("グループディレクトリ作成: $dir");
}

if ($isUpdate) {
  $json = $_POST['json'] ?? '';
  $decoded = json_decode($json, true);

  if (!is_array($decoded) || !isset($decoded['title']) || !isset($decoded['items'])) {
    http_response_code(400);
    $error = 'Invalid JSON structure';
    // logMessage("エラー: $error");
    echo json_encode(['error' => $error]);
    exit;
  }

  file_put_contents("$dir/data.json", json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
  // logMessage("json: $json");
  // logMessage("更新完了: ID=$groupId");

  handleImageUpload($dir); // 新規画像があれば保存

  echo json_encode(['success' => true, 'id' => $groupId]);
  exit;
}

// 新規保存処理
$title = $_POST['title'] ?? '';
$dataList = handleImageUpload($dir);

file_put_contents("$dir/data.json", json_encode([
  'title' => $title,
  'items' => $dataList,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// logMessage("新規保存完了: ID=$groupId");

echo json_encode([
  'success' => true,
  'id' => $groupId,
]);
exit;
