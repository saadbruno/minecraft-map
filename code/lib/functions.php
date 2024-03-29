<?php


// relative time
function findTimeAgo($past, $now = "now", $length = "long")
{
    // sets the default timezone if required
    // list of supported timezone identifiers
    // http://php.net/manual/en/timezones.php
    // date_default_timezone_set("Asia/Calcutta");
    $secondsPerMinute = 60;
    $secondsPerHour = 3600;
    $secondsPerDay = 86400;
    $secondsPerMonth = 2592000;
    $secondsPerYear = 31104000;
    // finds the past in datetime
    $past = strtotime($past);
    // finds the current datetime
    $now = strtotime($now);

    // creates the "time ago" string. This always starts with an "about..."
    $timeAgo = "";

    // finds the time difference
    $timeDifference = $now - $past;

    // less than 29secs
    if ($timeDifference <= 29) {
        if ($length == "short") {
            $timeAgo = "now";
        } else {
            $timeAgo = "less than a minute";
        }
    }
    // more than 29secs and less than 1min29secss
    else if ($timeDifference > 29 && $timeDifference <= 89) {
        if ($length == "short") {
            $timeAgo = "1 m";
        } else {
            $timeAgo = "1 minute";
        }
    }
    // between 1min30secs and 44mins29secs
    else if (
        $timeDifference > 89 &&
        $timeDifference <= (($secondsPerMinute * 44) + 29)
    ) {
        $minutes = floor($timeDifference / $secondsPerMinute);
        if ($length == "short") {
            $timeAgo = $minutes . " m";
        } else {
            $timeAgo = $minutes . " minutes";
        }
    }
    // between 44mins30secs and 1hour29mins29secs
    else if (
        $timeDifference > (($secondsPerMinute * 44) + 29)
        &&
        $timeDifference < (($secondsPerMinute * 89) + 29)
    ) {
        if ($length == "short") {
            $timeAgo = "1 h";
        } else {
            $timeAgo = "about 1 hour";
        }
    }
    // between 1hour29mins30secs and 23hours59mins29secs
    else if (
        $timeDifference > (
            ($secondsPerMinute * 89) +
            29)
        &&
        $timeDifference <= (
            ($secondsPerHour * 23) +
            ($secondsPerMinute * 59) +
            29)
    ) {
        $hours = floor($timeDifference / $secondsPerHour);
        if ($length == "short") {
            $timeAgo = $hours . " h";
        } else {
            $timeAgo = $hours . " hours";
        }
    }
    // between 23hours59mins30secs and 47hours59mins29secs
    else if (
        $timeDifference > (
            ($secondsPerHour * 23) +
            ($secondsPerMinute * 59) +
            29)
        &&
        $timeDifference <= (
            ($secondsPerHour * 47) +
            ($secondsPerMinute * 59) +
            29)
    ) {
        if ($length == "short") {
            $timeAgo = "1 d";
        } else {
            $timeAgo = "1 day";
        }
    }
    // between 47hours59mins30secs and 29days23hours59mins29secs
    else if (
        $timeDifference > (
            ($secondsPerHour * 47) +
            ($secondsPerMinute * 59) +
            29)
        &&
        $timeDifference <= (
            ($secondsPerDay * 29) +
            ($secondsPerHour * 23) +
            ($secondsPerMinute * 59) +
            29)
    ) {
        $days = floor($timeDifference / $secondsPerDay);
        if ($length == "short") {
            $timeAgo = $days . " d";
        } else {
            $timeAgo = $days . " days";
        }
    }
    // between 29days23hours59mins30secs and 59days23hours59mins29secs
    else if (
        $timeDifference > (
            ($secondsPerDay * 29) +
            ($secondsPerHour * 23) +
            ($secondsPerMinute * 59) +
            29)
        &&
        $timeDifference <= (
            ($secondsPerDay * 59) +
            ($secondsPerHour * 23) +
            ($secondsPerMinute * 59) +
            29)
    ) {
        if ($length == "short") {
            $timeAgo = "1 mo";
        } else {
            $timeAgo = "about 1 month";
        }
    }
    // between 59days23hours59mins30secs and 1year (minus 1sec)
    else if (
        $timeDifference > (
            ($secondsPerDay * 59) +
            ($secondsPerHour * 23) +
            ($secondsPerMinute * 59) +
            29)
        &&
        $timeDifference < $secondsPerYear
    ) {
        $months = round($timeDifference / $secondsPerMonth);
        // if months is 1, then set it to 2, because we are "past" 1 month
        if ($months == 1) {
            $months = 2;
        }
        if ($length == "short") {
            $timeAgo = $months . " mo";
        } else {
            $timeAgo = $months . " months";
        }
    }
    // between 1year and 2years (minus 1sec)
    else if (
        $timeDifference >= $secondsPerYear
        &&
        $timeDifference < ($secondsPerYear * 2)
    ) {
        if ($length == "short") {
            $timeAgo = "1 y";
        } else {
            $timeAgo = "about 1 year";
        }
    }
    // 2years or more
    else {
        $years = floor($timeDifference / $secondsPerYear);
        if ($length == "short") {
            $timeAgo = $years . " y";
        } else {
            $timeAgo = "over " . $years . " years";
        }
    }

    if ($length == "short") {
        return $timeAgo;
    } else {
        return $timeAgo . " ago";
    }
}

// Discord dwebhook, ref: https://gist.github.com/Mo45/cb0813cb8a6ebcd6524f6a36d4f8862c
function sendDiscordWebhook($id, $thumb, $title, $description, $dimension, $coords, $action = "add")
{
    $username = "Mapa do Requeijão";
    $footer = $_ENV['DOMAIN_NAME'];
    $avatar = $_SERVER['REQUEST_SCHEME'] . '://' . $_ENV['DOMAIN_NAME'] . "/public/media/img/logo/avatar.png?v=" . $_ENV['VERSION'];

    if ($id) {
        $url = $_SERVER['REQUEST_SCHEME'] . '://' . $_ENV['DOMAIN_NAME'] . "/?p=" . $id;
    } else {
        $url = $_SERVER['REQUEST_SCHEME'] . '://' . $_ENV['DOMAIN_NAME'];
    }

    switch ($action) {
        case 'update':
            $content = 'Localização no mapa atualizada';
            break;

        case 'add':
        default:
            $content = 'Nova marcação no mapa!';
            break;
    }

    $json_data = json_encode([

        "username" => $username,
        "avatar_url" => $avatar,
        "content" => $content,

        "embeds" => [
            [
                "title" => $title,
                "type" => "rich",
                "description" => $description,
                "url" => $url,
                "color" => hexdec("2993cf"),
                "footer" => [
                    "text" => $footer,
                ],
                "thumbnail" => [
                    "url" => $thumb
                ],
                // // if we ever add users
                // "author" => [
                //     "name" => $author,
                //     "url" => $url
                // ],

                "fields" => [
                    [
                        "name" => "Dimensão",
                        "value" => $dimension,
                        "inline" => false
                    ],
                    [
                        "name" => "Coordenadas",
                        "value" => $coords,
                        "inline" => false
                    ]
                ]
            ]
        ]

    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);


    $ch = curl_init($_ENV['DISCORD_WEBHOOK']);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: application/json'));
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $json_data);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    $response = curl_exec($ch);
    // If you need to debug, or find out why you can't send message uncomment line below, and execute script.
    // echo $response;
    curl_close($ch);
}

//Logging to terminal
// this requires the "DEBUG=1" in the /docker/.env file
// messages here will be readable by running `make logs-php`
function debug($message, $title = 'DEBUG', $location = 'logs')
{
    // we only wanna print if debug is set in the .env
    if ($_ENV['DEBUG'] != 1) {
        return;
    }

    // converts arrays and objects to string
    if (!is_string($message)) {
        $message = print_r($message, 1);
    }

    // truncate to 8k characters
    substr($message, 8000);


    // adds formatting
    $message = "\n:\n========== $title ==========\n $message\n:\n";

    switch ($location) {
        case 'console':
            // logs to javascript console
            $message = json_encode($message);
            echo '<script>console.log(' . $message . ')</script>';
            break;
        case 'html':
            // display as an html comment
            echo "<!--\n" . $message . "\n-->";
            break;
        case 'logs':
        default:
            // logs to terminal
            $stdout = fopen('php://stdout', 'w');
            fwrite($stdout, $message);
            fclose($stdout);
            break;
    }
}
