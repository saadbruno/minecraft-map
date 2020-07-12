<?php
session_start();



require_once "lib/functions.php";
require_once "lib/view_functions.php";
require_once "lib/db/db_conn.php";
require_once "lib/db/getUser.php";
require_once "lib/db/submit.php";



// loads envs to a friendlier array
$config = array(
    'TLD' => $_ENV['TLD'],
    'version' => $_ENV['VERSION'],
);

// fallbacks for the above
$config['TLD'] = $config['TLD'] ? $config['TLD'] : 'com';
$config['version'] = $config['version'] ? $config['version'] : '1.0.0';

// Global Meta tags that can be overriden
$meta['title'] = 'Minecraft Map - Requeijão';
$meta['description'] = 'Mapa de coordenadas do servidor do Minecraft do Clã Requeijão';
$meta['image'] = $_SERVER['REQUEST_SCHEME'] . '://' . $_ENV['DOMAIN_NAME'] . '/public/media/img/og-thumbnail.jpg';
$meta['url'] = $_SERVER['REQUEST_SCHEME'] . '://' . $_ENV['DOMAIN_NAME'] . $_SERVER['REQUEST_URI'];

// GET variables
// $p = preg_replace('/[^0-9]/', '', filter_input(INPUT_GET, 'p', FILTER_SANITIZE_NUMBER_INT));
// $p = $p ? $p : 1;

switch ($_GET['q1']) {

    case 'home':
    default:

        require_once("./features/home/home.php");

        break;
}

// debugging
debug($_GET, 'GET');
// debug($_ENV, 'ENV');
// debug($_POST, 'POST');
// debug($db_status, 'DB status');
// debug($_COOKIE, 'COOKIE');
