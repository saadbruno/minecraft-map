<?php

function getPlaces($dimension = 'Overworld')
{
    global $pdo;

    // get plugins
    $stmt = $pdo->prepare("SELECT places.id,places.title,places.coordX,places.coordY,places.coordZ,places.comment,icons.url AS icon FROM mcmap.places LEFT JOIN mcmap.icons ON places.icon = icons.id WHERE places.published = 1 AND places.dimension = ?");
    $stmt->execute([$dimension]);
    $result = $stmt->fetchAll();

    return $result;
}

function getIcons()
{
    global $pdo;

    // get plugins
    $stmt = $pdo->prepare("SELECT * FROM mcmap.icons WHERE `published` = 1 ORDER BY name ASC");
    $stmt->execute();
    $result = $stmt->fetchAll();

    return $result;
}

function savePlace($formData)
{
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

    debug($formData['dimension']);

  // USERS db insert
  $sql = "INSERT INTO `mcmap`.`places`
        (`title`, `coordX`, `coordY`, `coordZ`, `comment`, `dimension`, `icon`)
        VALUES (?, ?, ?, ?, ?, ?, ?)
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
  header('Content-Type: application/json; charset=UTF-8');
  echo json_encode($result, true);

}
