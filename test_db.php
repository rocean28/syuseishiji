<?php
try {
  $db = new PDO('sqlite:db/database.sqlite');
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  echo "<p style='color: green;'>✅ SQLite接続成功！</p>";

  // テーブル一覧の確認（おまけ）
  $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'");
  echo "<h3>存在するテーブル一覧：</h3><ul>";
  foreach ($tables as $table) {
    echo "<li>" . htmlspecialchars($table['name']) . "</li>";
  }
  echo "</ul>";

} catch (PDOException $e) {
  echo "<p style='color: red;'>❌ SQLite接続失敗: " . htmlspecialchars($e->getMessage()) . "</p>";
}
