<?php
$env = require __DIR__ . '/.env.php';
$baseUrl = $env['BASE_URL'];
$dataDir = $env['DATA_DIR'];
$viteUrl = $env['VITE_URL'];
?>

<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>Syusei</title>
<meta name="viewport" content="width=device-width">
<link rel="stylesheet" href="./asset/css/style.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Noto+Sans+JP:wght@100..900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body id="body" class="body">
<div class="wrap">
<header class="header">
  <h1 class="header__logo">
    <a href="<?= $baseUrl ?>list.php" class="header__logoLink">Syusei</a>
  </h1>
  <nav class="header__nav">
    <a href="<?= $baseUrl ?>list.php" class="header__navLink"><i class="fa-solid fa-list-ul"></i></a>
    <a href="<?= $viteUrl ?>" class="header__navLink btn-new"><i class="fa-solid fa-plus"></i></a>
  </nav>
</header>
<main class="main">