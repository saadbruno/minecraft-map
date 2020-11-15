<?php

// Map places

function getPlaces($dimension = 'Overworld')
{
    global $pdo;

    // get plugins
    $stmt = $pdo->prepare("SELECT places.id,places.title,places.coordX,places.coordY,places.coordZ,places.comment,places.icon,icons.url AS icon_url FROM mcmap.places LEFT JOIN mcmap.icons ON places.icon = icons.id WHERE places.published = 1 AND places.dimension = ?");
    $stmt->execute([$dimension]);
    $result = $stmt->fetchAll();

    return $result;
}

function getPlace($id)
{
    global $pdo;

    if (!$id) {
        $result['status'] = 'error';
        $result['message'] = 'Please provide a place ID or dimension';
        return $result;
    }

    // get single place
    $stmt = $pdo->prepare("SELECT places.id,places.title,places.coordX,places.coordY,places.coordZ,places.dimension,places.comment,places.icon,icons.url AS icon_url FROM mcmap.places LEFT JOIN mcmap.icons ON places.icon = icons.id WHERE places.published = 1 AND places.id = ?");
    $stmt->execute([$id]);
    $result = $stmt->fetch();

    return $result;

}

function getIcons()
{
    global $pdo;

    // get places
    $stmt = $pdo->prepare("SELECT * FROM mcmap.icons WHERE `published` = 1 ORDER BY name ASC");
    $stmt->execute();
    $result = $stmt->fetchAll();

    return $result;
}

function getIcon($id)
{
    global $pdo;

    if (!$id) {
        $result['status'] = 'error';
        $result['message'] = 'Please provide am icon id';
        return $result;
    }

    // get single place
    $stmt = $pdo->prepare("SELECT * FROM mcmap.icons WHERE `published` = 1 AND id = ?");
    $stmt->execute([$id]);
    $result = $stmt->fetch();

    return $result;

}

function savePlace($formData)
{

    // if the user doesn't have the add_place or the admin flag, return an error
    if ( !in_array("add_place", $_SESSION['user']['flags']) || !in_array("is_admin", $_SESSION['user']['flags'])) {
      debug('Non authorized user sending form. Aborting', 'Auth Error');
      header('Content-Type: application/json; charset=UTF-8');
      $result = array();
      $result['status'] = 'auth_error';
      $result['message'] = 'Not authorized';
      die(json_encode($result));
    }

    global $pdo;

    debug($formData, 'FORM');

    // validation
    if (!$formData['title']) {
        $error['title'] = 'Insira um título';
    }

    if (!is_numeric($formData['coordX'])) {
        $error['coordX'] = 'Insira uma coordenada X';
    }

    if (!is_numeric($formData['coordZ'])) {
        $error['coordZ'] = 'Insira uma coordenada Z';
    }

    if (!$formData['icon']) {
        $error['icon'] = 'Escola um ícone';
    }

    // if there were any errors, return with the error messages
    if ($error) {

        header('Content-Type: application/json; charset=UTF-8');
        $result = array();
        $result['status'] = 'error';
        $result['validation'] = $error;

        die(json_encode($result));
    }


    // if there were no validation errors, let's try to insert it in the database


    if (!$formData['coordY']) {
        $formData['coordY'] = NULL;
    }

    if (!$formData['comment']) {
        $formData['comment'] = NULL;
    }

    if (!$formData['id']) {
        $formData['id'] = NULL;
    }

    debug($formData['dimension']);

  // USERS db insert
  $sql = "INSERT INTO `mcmap`.`places`
        (`id`,`title`, `coordX`, `coordY`, `coordZ`, `comment`, `dimension`, `icon`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        `title` = ?,
        `coordX` = ?, 
        `coordY` = ?,
        `coordZ` = ?,
        `comment` = ?,
        `dimension` = ?,
        `icon` = ?
        ;";
  try {
    $pdo->prepare($sql)->execute([
        $formData['id'],
        $formData['title'],
        $formData['coordX'],
        $formData['coordY'],
        $formData['coordZ'],
        $formData['comment'],
        $formData['dimension'],
        $formData['icon'],
        $formData['title'],
        $formData['coordX'],
        $formData['coordY'],
        $formData['coordZ'],
        $formData['comment'],
        $formData['dimension'],
        $formData['icon']
    ]);
    
  } catch (Exception $e) {
    header('Content-Type: application/json; charset=UTF-8');
    $result = array();
    $result['status'] = 'error';
    $result['message'] = $e;
    die(json_encode($result));
  }

  $result = array();
  $result['status'] = 'success';
  $result['message'] = 'success';

  if ($formData['id']) {
    $result['action'] = 'update';
  } else {
    $result['action'] = 'insert';
  }

  $result['id'] = $pdo->lastInsertId();

  // =============
  // Discord webhook stuff
  // =============

  // we need to get the icon URL form the database lul
  $iconData = getIcon($formData['icon']);

  // let's format the coords:
  $coords = "**X:** " . $formData['coordX'];
  if ($formData['coordY']) {
      $coords .= " | **Y:** " . $formData['coordY'];
  }
  $coords .= " | **Z:** " . $formData['coordZ'];

  if ($result['action'] == 'update') {
    sendDiscordWebhook("update", $result['id'], $iconData['url'], $formData['title'], $formData['comment'], $formData['dimension'], $coords);
  } else {
    sendDiscordWebhook("add", $result['id'], $iconData['url'], $formData['title'], $formData['comment'], $formData['dimension'], $coords);
  }
  // =============
  // End Discord Webhook
  // =============

  // sets the header, and finishes everything
  header('Content-Type: application/json; charset=UTF-8');
  echo json_encode($result, true);

}

// User management
function addUser($discord)
{

  global $pdo;

  $sql = "INSERT INTO `users` (`id`, `username`, `avatar`, `discriminator`, `locale`) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
  `username` = ?,
  `avatar` = ?, 
  `discriminator` = ?,
  `locale` = ?";
  try {
    $pdo->prepare($sql)->execute([
      $discord->id,
      $discord->username,
      $discord->avatar, 
      $discord->discriminator, 
      $discord->locale,
      $discord->username,
      $discord->avatar, 
      $discord->discriminator, 
      $discord->locale
      ]);
  } catch (Exception $e) {
    debug($e, 'NEW USER INSERT ERROR');
  }

}

function getUser($id)
{
  global $pdo;

  if (!$id) {
      $result['status'] = 'error';
      $result['message'] = 'Please provide an user ID';
      return $result;
  }

  // get single place
  $stmt = $pdo->prepare("SELECT * FROM `users` WHERE `id` = ?");
  $stmt->execute([$id]);
  $result = $stmt->fetch();

  return $result;

}

function checkAuthorizedGuilds($guilds)
{
    global $pdo;

  // this checks if the guild ids given on the $guilds array matches 1 or more entries in the `authorized_guilds` table

    $query = "SELECT `authorized_guilds`.`guild_id` FROM `authorized_guilds` WHERE `guild_id` = 0";
    foreach ($guilds as $value) {
      $query .= " OR `guild_id` = ?";
    }

    // debug($query, 'GUILDS QUERY');

    // get places
    $stmt = $pdo->prepare($query);
    $stmt->execute($guilds);
    $count = $stmt->fetchColumn();

    // if there are matches, return true, otherwise return false
    if ($count) {
      return true;
    } else {
      return false;
    }
}

function addUserFlag($id, $flag)
{

  global $pdo;

  $sql = "INSERT INTO `user_flags` (`id`, `flag`) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=id";
  try {
    $pdo->prepare($sql)->execute([$id, $flag]);
  } catch (Exception $e) {
    debug($e, 'USER FLAG ERROR');
  }

}

function removeUserFlag($id, $flag)
{

  global $pdo;

  $sql = "DELETE FROM `user_flags` WHERE (`id` = ?) and (`flag` = ?)";
  try {
    $pdo->prepare($sql)->execute([$id, $flag]);
  } catch (Exception $e) {
    debug($e, 'USER FLAG ERROR');
  }

}

function getUserFlags($id)
{
    global $pdo;

    // get places
    $stmt = $pdo->prepare("SELECT `flag` FROM `user_flags` WHERE `id` = ?");
    $stmt->execute([$id]);
    $flagsRaw = $stmt->fetchAll();

    $flags = array();
    foreach ($flagsRaw as $flag) {
        $flags[] = $flag['flag'];
    }


    return $flags;
}