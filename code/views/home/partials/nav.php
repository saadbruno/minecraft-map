<nav class="navbar navbar-expand-md navbar-dark">

    <!-- main icon  -->
    <a class="navbar-brand" href="/"><img class="img-fluid logo" src="/public/media/img/logo/mcmap_i_c.svg?v=<?= $config['version'] ?>" /> </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>

    <!-- menu  -->
    <div class="collapse navbar-collapse" id="navbarCollapse">
        <ul class="navbar-nav mr-auto">
            <li class="nav-item <?= $nav['active'] == 'overworld' ? 'active' : '' ?>">
                <a class="nav-link" href="/">Overworld <span class="sr-only">(current)</span></a>
            </li>
        </ul>


        <!-- submit  -->

        <div class="nav-user ml-md-2 mt-2 mt-md-0">
            <div class="dropdown">

                <button class="btn btn-secondary dropdown-toggle" type="button" id="submitButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-map-marker-alt"></i> Adicionar marcação
                </button>

                <?php include "addPlaceDropdown.php"; ?>

            </div>


        </div>



    </div>
</nav>