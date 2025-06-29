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

include('header.php');
?>
<!-- 編集ボタン -->
<div class="flex justify-end mb-10">
  <a href="http://localhost:5173/edit/<?= htmlspecialchars($id) ?>" class="btn-blue">
    編集する
  </a>
</div>

<!-- タブ -->
<div class="tabs">
  <?php foreach ($items as $index => $item): ?>
    <div class="tab <?= $index === 0 ? 'active' : '' ?>" data-tab="<?= $index ?>">
      <?= htmlspecialchars($item['title'] ?: '画像 ' . ($index + 1)) ?>
    </div>
  <?php endforeach; ?>
</div>

<!-- 各画像＆指示表示 -->
<?php foreach ($items as $index => $item): ?>
  <div class="tab-content <?= $index !== 0 ? 'hidden' : '' ?>" data-content="<?= $index ?>">
    <div class="flex gap-10">
      <!-- 画像表示 -->
      <div class="w-1500 card pd-10 relative bg-white">
        <img src="data/<?= htmlspecialchars($id) ?>/<?= htmlspecialchars($item['image']) ?>" class="block max-w-full rounded" />
        <?php foreach ($item['instructions'] as $i => $ins): ?>
          <div
            id="rect-<?= $index ?>-<?= $i ?>"
            data-index="<?= $i ?>"
            class="fix-area"
            style="top:<?= $ins['y'] ?>px; left:<?= $ins['x'] ?>px; width:<?= $ins['width'] ?>px; height:<?= $ins['height'] ?>px;"
          >
            <span class="fix-area-num"><?= $i + 1 ?></span>
          </div>
        <?php endforeach; ?>
      </div>

      <!-- 修正指示一覧 -->
      <div class="ins-list card pd-15 w-full">
        <h3 class="ins-list__label mb-15 fsz-15">修正指示一覧（<?= count($item['instructions']) ?>件）</h3>
        <ul class="space-y-4" id="instruction-list-<?= $index ?>">
          <?php foreach ($item['instructions'] as $i => $ins): ?>
            <li id="item-<?= $index ?>-<?= $i ?>" class="ofh mb-30 rounded fsz-13">
              <div class="ins-list__num bg-lightgray py-5 px-15"> <?= $i + 1 ?></div>
              <div class="ins-list__text pd-10 fsz-15"><?= htmlspecialchars($ins['text'] ?: '') ?></div>
            </li>
          <?php endforeach; ?>
        </ul>
      </div>
    </div>
  </div>
<?php endforeach; ?>


  <script>
    // タブ切り替え
    document.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
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
