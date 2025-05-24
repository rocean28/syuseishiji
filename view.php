<?php
$id = $_GET['id'] ?? '';
if (!preg_match('/^[a-z0-9]+$/', $id)) {
  http_response_code(400);
  echo "Invalid ID";
  exit;
}

$dir = __DIR__ . "/data/$id";
$dataFile = "$dir/data.json";
if (!file_exists($dataFile)) {
  http_response_code(404);
  echo "Data not found";
  exit;
}

$dataRaw = json_decode(file_get_contents($dataFile), true);
if (!is_array($dataRaw) || !isset($dataRaw['items'])) {
  http_response_code(500);
  echo "Invalid data format";
  exit;
}

$groupTitle = $dataRaw['title'] ?? '';
$items = $dataRaw['items'];
?>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title><?= htmlspecialchars($groupTitle ?: '修正指示ビュー') ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    integrity="sha512-dRnfUO/VwPpMBNdTeKgInHXP0YI4+7heH9+zAAuPco+DfXL+81Slk3T+1bR6XeZfLgOYlH5rcjQ8lxLGMGdg3g=="
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
  />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .highlight { outline: 4px solid gold; z-index: 10; }
    .rect:hover { cursor: pointer; }
  </style>
</head>
<body class="bg-gray-50 text-gray-800 p-6">
  <h1 class="text-xl font-semibold mb-4">
    <?= htmlspecialchars($groupTitle ?: '修正指示ビュー') ?>
  </h1>

  <div class="mb-4">
    <a href="http://localhost:5173/editor?id=<?= htmlspecialchars($id) ?>"
       class="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      編集画面へ
    </a>
  </div>

  <!-- タブ -->
  <div class="mb-6 flex space-x-2">
    <?php foreach ($items as $index => $item): ?>
      <button
        class="tab-btn px-4 py-2 rounded-t <?= $index === 0 ? 'bg-white' : 'bg-gray-200' ?>"
        data-tab="<?= $index ?>"
      >
        <?= htmlspecialchars($item['title'] ?: '画像 ' . ($index + 1)) ?>
      </button>
    <?php endforeach; ?>
  </div>

  <!-- 各画像＆指示表示 -->
  <?php foreach ($items as $index => $item): ?>
    <div class="tab-content <?= $index !== 0 ? 'hidden' : '' ?>" data-content="<?= $index ?>">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 画像 -->
        <div class="relative inline-block max-w-full rounded-lg shadow bg-white p-2">
          <img src="data/<?= htmlspecialchars($id) ?>/<?= htmlspecialchars($item['image']) ?>" class="block max-w-full" />
          <?php foreach ($item['instructions'] as $i => $ins): ?>
            <div
              id="rect-<?= $index ?>-<?= $i ?>"
              data-index="<?= $i ?>"
              class="rect absolute border-2 border-red-500 bg-red-500/10 text-xs text-white font-bold px-1"
              style="top:<?= $ins['y'] ?>px; left:<?= $ins['x'] ?>px; width:<?= $ins['width'] ?>px; height:<?= $ins['height'] ?>px;"
            >
              #<?= $i + 1 ?>
            </div>
          <?php endforeach; ?>
        </div>

        <!-- 指示一覧 -->
        <div class="w-full lg:w-96">
          <h2 class="text-lg font-semibold mb-2">修正指示一覧（<?= count($item['instructions']) ?>件）</h2>
          <ul class="space-y-4" id="instruction-list-<?= $index ?>">
            <?php foreach ($item['instructions'] as $i => $ins): ?>
              <li
                id="item-<?= $index ?>-<?= $i ?>"
                class="bg-white p-4 rounded shadow"
              >
                <div class="text-sm text-gray-500 mb-1">
                  #<?= $i + 1 ?>（x: <?= round($ins['x']) ?>, y: <?= round($ins['y']) ?>）
                </div>
                <div class="text-sm whitespace-pre-wrap">
                  <?= htmlspecialchars($ins['text'] ?: '（未入力）') ?>
                </div>
              </li>
            <?php endforeach; ?>
          </ul>
        </div>
      </div>
    </div>
  <?php endforeach; ?>

  <script>
    // タブ切り替え
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('bg-white'));
        btn.classList.add('bg-white');
        document.querySelectorAll('.tab-content').forEach(c => {
          c.classList.toggle('hidden', c.dataset.content !== tab);
        });
      });
    });

    // ハイライト連動
    <?php foreach ($items as $tab => $item): ?>
      <?php foreach ($item['instructions'] as $i => $ins): ?>
        document.getElementById("rect-<?= $tab ?>-<?= $i ?>").addEventListener("click", () => {
          const el = document.getElementById("item-<?= $tab ?>-<?= $i ?>");
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          document.querySelectorAll('.highlight').forEach(x => x.classList.remove('highlight'));
          document.getElementById("rect-<?= $tab ?>-<?= $i ?>").classList.add('highlight');
        });

        document.getElementById("item-<?= $tab ?>-<?= $i ?>").addEventListener("click", () => {
          const el = document.getElementById("rect-<?= $tab ?>-<?= $i ?>");
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          document.querySelectorAll('.highlight').forEach(x => x.classList.remove('highlight'));
          el.classList.add('highlight');
        });
      <?php endforeach; ?>
    <?php endforeach; ?>
  </script>
</body>
</html>
