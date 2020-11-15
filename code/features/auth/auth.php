<?php //taken from https://gist.github.com/Jengas/ad128715cb4f73f5cde9c467edf64b00

if ($_ENV['DEBUG'] == 1) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

ini_set('max_execution_time', 300); //300 seconds = 5 minutes. In case if your CURL is slow and is loading too much (Can be IPv6 problem)


define('OAUTH2_CLIENT_ID', $_ENV['DISCORD_OAUTH2_CLIENT_ID']);
define('OAUTH2_CLIENT_SECRET', $_ENV['DISCORD_OAUTH2_SECRET']);
define('OAUTH2_REDIRECT_URL', $_ENV['DISCORD_OAUTH2_REDIRECT_URL']);

$authorizeURL = 'https://discord.com/api/oauth2/authorize';
$tokenURL = 'https://discord.com/api/oauth2/token';
$apiURLBase = 'https://discord.com/api/users/@me';
$revokeURL = 'https://discordapp.com/api/oauth2/token/revoke';

// session_start();

// Start the login process by sending the user to Discord's authorization page
if (get('action') == 'login') {

    $params = array(
        'client_id' => OAUTH2_CLIENT_ID,
        'redirect_uri' => OAUTH2_REDIRECT_URL,
        'response_type' => 'code',
        'scope' => 'identify guilds'
    );

    // Redirect the user to Discord's authorization page
    header('Location: https://discordapp.com/api/oauth2/authorize' . '?' . http_build_query($params));
    die();
}

if (get('action') == 'logout') {
    apiRequest($revokeURL, array(
        'token' => session('access_token'),
        'client_id' => OAUTH2_CLIENT_ID,
        'client_secret' => OAUTH2_CLIENT_SECRET,
    ));
    unset($_SESSION['access_token']);
    unset($_SESSION['user']);
    header('Location: /auth');
    die();
}

// When Discord redirects the user back here, there will be a "code" and "state" parameter in the query string
if (get('code')) {

    // Exchange the auth code for a token
    $token = apiRequest($tokenURL, array(
        "grant_type" => "authorization_code",
        'client_id' => OAUTH2_CLIENT_ID,
        'client_secret' => OAUTH2_CLIENT_SECRET,
        'redirect_uri' => OAUTH2_REDIRECT_URL,
        'code' => get('code')
    ));
    $logout_token = $token->access_token;
    $_SESSION['access_token'] = $token->access_token;

    header('Location: /auth');
}

if (session('access_token')) {

    // on a successful login, we save the user to the database, and check them against the authorized guilds table, giving the respective role

    // gets user data
    $user = apiRequest($apiURLBase);

    // inserts / update the user data
    addUser($user);

    // if the user is listed as admin on the .env file, add the admin flag
    if ($user->id == $_ENV['ADMIN_DISCORD_ID']) {
        addUserFlag($user->id, 'is_admin');
    }

    // PERMS STUFF
    // Adds flags based on the user's discord guilds

    // gets list of user's guilds from the Discord's API
    $guildsRaw = apiRequest('https://discord.com/api/users/@me/guilds');

    $guilds = array();
    foreach ($guildsRaw as $guild) {
        $guilds[] = $guild->id;
    }

    $authGuild = checkAuthorizedGuilds($guilds);
    debug($authGuild, 'AUTH GUILD');

    // if user is member of an authorized guild, give the "add_place" flag
    if ($authGuild) {
        addUserFlag($user->id, 'add_place');
    } else {
        // we remove the flag in case the user is not part of an authorized guild anymore, or if the authorized list has changed since the last login
        removeUserFlag($user->id, 'add_place');
    }

    // ok, we finished all the user shenanigans.
    // let's add the user data to the session and redirect.

    $_SESSION['user'] = getUser($user->id);
    $_SESSION['user']['flags'] = getUserFlags($user->id);

    header('Location: /');
    
} else {
    // user is accessing the page without an action, and without an access token
    header('Location: /');
}

function apiRequest($url, $post = FALSE, $headers = array()) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

    $response = curl_exec($ch);

    if ($post)
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post));

    $headers[] = 'Accept: application/json';

    if (session('access_token'))
        $headers[] = 'Authorization: Bearer ' . session('access_token');

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    return json_decode($response);
}

function get($key, $default = NULL) {
    return array_key_exists($key, $_GET) ? $_GET[$key] : $default;
}

function session($key, $default = NULL) {
    return array_key_exists($key, $_SESSION) ? $_SESSION[$key] : $default;
}
