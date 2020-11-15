<nav class="navbar navbar-expand-md navbar-dark">

    <!-- main icon  -->
    <a class="navbar-brand" href="/"><img class="img-fluid logo" src="/public/media/img/logo/mcmap_i_c.svg?v=<?= $config['version'] ?>" /> </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>

    <!-- menu  -->
    <div class="collapse navbar-collapse" id="navbarCollapse">
        <ul id="dimension-menu" class="navbar-nav mr-auto">
            <li id="overworld-menu" class="dimension-item nav-item <?= $nav['active'] == 'overworld' ? 'active' : '' ?>">
                <a class="nav-link" href="/">Overworld</a>
            </li>

            <li id="nether-menu" class="dimension-item nav-item <?= $nav['active'] == 'nether' ? 'active' : '' ?>">
                <a class="nav-link" href="/nether">Nether</a>
            </li>
        </ul>


        <!-- layers  -->

        <div class="nav-user ml-md-2 mt-2 mt-md-0">
            <div id="layersDropdown" class="dropdown">

                <button class="btn btn-secondary dropdown-toggle" type="button" id="layersButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-layer-group"></i> Camadas
                </button>

                <?php include "layersDropdown.php"; ?>

            </div>

        </div>

        <!-- submit  -->

        <?php
        //changes nav based if user is logged in / out
        if (isset($_SESSION['user'])) {

            // if the user can add places, or is admin, show the dropdown
            if (in_array("add_place", $_SESSION['user']['flags']) || in_array("is_admin", $_SESSION['user']['flags'])) {
        ?>

                <div class="nav-user ml-md-2 mt-2 mt-md-0">
                    <div id="submitFormDropdown" class="dropdown">

                        <button class="btn btn-secondary dropdown-toggle" type="button" id="submitButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fas fa-map-marker-alt"></i> Adicionar marcação
                        </button>

                        <?php include "addPlaceDropdown.php"; ?>

                    </div>

                </div>

            <?php
            }
            ?>

            <div class="nav-user ml-md-2 mt-2 mt-md-0">
                <div id="userMenu" class="dropdown">

                    <button class="btn btn-outline-light dropdown-toggle" type="button" id="userMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <img class="profilePicture" src="https://cdn.discordapp.com/avatars/<?= $_SESSION['user']['id'] ?>/<?= $_SESSION['user']['avatar'] ?>?size=64" />
                        <?= $_SESSION['user']['username'] ?>#<?= $_SESSION['user']['discriminator'] ?>
                    </button>

                    <?php include "userMenuDropdown.php"; ?>

                </div>

            </div>

        <?php
        } else {
        ?>

            <div class="nav-user ml-md-2 mt-2 mt-md-0">

                <a class="btn btn-secondary" type="button" href="/auth?action=login">
                    <i class="fab fa-discord"></i> Log-in
                </a>

            </div>

        <?php
        }

        ?>





    </div>
</nav>