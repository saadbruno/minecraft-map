<?php

// if something was sent through a form

if ($_POST['form'] == 'addPlace') {

    $_POST  = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);

    debug($_POST, 'POST');

    savePlace($_POST);

    die();
}


$nav['active'] = 'overworld';

$iconList = getIcons();

// debug($iconList, 'ICONS');

// loads view
include_once("views/home/home.php");
