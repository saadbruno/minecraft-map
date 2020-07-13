<?php

switch ($_GET['q2']) {

    case 'places':

        switch ($_GET['q3']) {
            case 'overworld':


                $places =  getPlaces('Overworld');

                //debug($icons, 'ICONS');

                header('Content-Type: application/json');
                echo json_encode($places);

                break;

            default:
                echo 'please provide a dimension';
                break;
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
