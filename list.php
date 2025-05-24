<?php
$dataDir = __DIR__ . '/data';
$items = [];

// フォルダを走査
foreach (glob("$dataDir/*", GLOB_ONLYDIR) as $dir) {
  $id = basename($dir);
  $jsonPath = "$dir/data.json";

  if (!file_exists($jsonPath)) continue;

  $json = json_decode(file_get_contents($jsonPath), true);
  if (!is_array($json) || !isset($json['title']) || !isset($json['items'])) continue;

  $title = $json['title'] ?: '（無題）';
  $thumb = '';

  if (isset($json['items'][0]['image'])) {
    $thumb = "data/$id/" . htmlspecialchars($json['items'][0]['image']);
  }

  $items[] = [
    'id' => $id,
    'title' => $title,
    'thumb' => $thumb,
  ];
}
?>

<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>修正指示一覧</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 text-gray-800 p-6">
<?php
include('header.php');
?>
  <h1 class="text-2xl font-semibold mb-6">修正指示一覧</h1>
  <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
    <?php foreach ($items as $item): ?>
      <a href="view.php?id=<?= htmlspecialchars($item['id']) ?>" class="block bg-white rounded shadow hover:shadow-lg transition p-4">
        <?php if ($item['thumb']): ?>
          <img src="<?= $item['thumb'] ?>" alt="" class="w-full h-48 object-contain mb-3 bg-gray-50 rounded">
        <?php else: ?>
          <div class="w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500 mb-3 rounded">
            No Image
          </div>
        <?php endif; ?>
        <div class="text-lg font-medium truncate"><?= htmlspecialchars($item['title']) ?></div>
        <!-- <div class="text-sm text-gray-500">ID: <?= htmlspecialchars($item['id']) ?></div> -->
      </a>
    <?php endforeach; ?>
  </div>
</body>
</html>
