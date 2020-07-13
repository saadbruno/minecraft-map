<?php

switch ($_GET['q2']) {

    case 'places':

        switch ($_GET['q3']) {
            case 'overworld':
            case 'Overworld':

                $places =  getPlaces('Overworld');
                //debug($icons, 'ICONS');
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

        $icons =  getIcons();

        //debug($icons, 'ICONS');

        header('Content-Type: application/json');
        echo json_encode($icons);

        break;
    default:
        echo 'invalid argument';
}
