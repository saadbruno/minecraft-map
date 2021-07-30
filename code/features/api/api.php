<?php

switch ($_GET['q2']) {

    case 'places':

        switch (strtolower($_GET['q3'])) {
            case 'overworld':

                $places =  getPlaces('Overworld');
                // debug($places, 'PLACES');
                header('Content-Type: application/json');
                echo json_encode($places);

                break;

            case 'nether':

                $places =  getPlaces('Nether');
                // debug($places, 'PLACES');
                header('Content-Type: application/json');
                echo json_encode($places);

                break;

            case 'the_end':

                $places =  getPlaces('The_End');
                // debug($places, 'PLACES');
                header('Content-Type: application/json');
                echo json_encode($places);

                break;

            default:
                $place =  getPlace($_GET['q3']);
                //debug($icons, 'ICONS');
                header('Content-Type: application/json');
                echo json_encode($place);
        }

        break;

    case 'icons':

        switch ($_GET['format']) {
            case 'emoji-button':
                $icons =  getIcons('emoji-button');
                break;
            
            default:
                $icons =  getIcons();
                break;
        }

        //debug($icons, 'ICONS');

        header('Content-Type: application/json');
        echo json_encode($icons);

        break;
    default:
        echo 'invalid argument';
}
