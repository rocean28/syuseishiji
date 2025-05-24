<?php
header('Content-Type: application/json');

$allowed_origin = 'http://localhost:5173/';
if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === $allowed_origin) {
  header("Access-Control-Allow-Origin: $allowed_origin");
}

$id = $_GET['id'] ?? '';
$index = $_POST['index'] ?? null;
$done = isset($_POST['done']) ? filter_var($_POST['done'], FILTER_VALIDATE_BOOLEAN) : null;
$checked = isset($_POST['checked']) ? filter_var($_POST['checked'], FILTER_VALIDATE_BOOLEAN) : null;

if (!preg_match('/^[a-z0-9]+$/', $id) || !is_numeric($index)) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid parameters']);
  exit;
}

$dir = __DIR__ . "/data/$id";
$dataPath = "$dir/data.json";

if (!file_exists($dataPath)) {
  http_response_code(404);
  echo json_encode(['error' => 'data.json not found']);
  exit;
}

$json = file_get_contents($dataPath);
$instructions = json_decode($json, true);

if (!isset($instructions[$index])) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid instruction index']);
  exit;
}

// 状態を更新
$instructions[$index]['done'] = $done;
$instructions[$index]['checked'] = $checked;

file_put_contents($dataPath, json_encode($instructions, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo json_encode(['success' => true]);
