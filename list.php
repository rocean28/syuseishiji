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

include('header.php');
?>

<h2 class="heading-lv2 mb-20">作成履歴</h2>
<ul class="cardList">
  <?php foreach ($items as $item): ?>
    <li class="cardList__item">
      <a href="http://localhost:5173/view/<?= htmlspecialchars($item['id']) ?>" class="cardList__item-inner card pd-10">
        <div class="cardList__image mb-5">
          <?php if ($item['thumb']): ?>
          <img src="<?= $item['thumb'] ?>" alt="" class="object-fit object-cover rounded">
          <?php else: ?>
          <div class="mb-5 rounded bg-gray">
            No Image
          </div>
          <?php endif; ?>
        </div>
        <div class="cardList__text">
          <div class="fsz-14"><?= htmlspecialchars($item['title']) ?></div>
          <div class="text-gray fsz-14 text-right">ID: <?= htmlspecialchars($item['id']) ?></div>
        </div>
      </a>
    </li>
  <?php endforeach; ?>
</ul>
<?php
include('footer.php');
?>

