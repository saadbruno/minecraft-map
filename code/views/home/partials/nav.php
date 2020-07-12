<nav class="navbar navbar-expand-md navbar-dark">
    <a class="navbar-brand" href="/"><img class="img-fluid logo" src="/public/media/img/logo/mcmap_i_c.svg?v=<?= $config['version'] ?>" /> </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarCollapse">
        <ul class="navbar-nav mr-auto">
            <li class="nav-item <?= $nav['active'] == 'home' ? 'active' : '' ?>">
                <a class="nav-link" href="/">Home <span class="sr-only">(current)</span></a>
            </li>
        </ul>

    </div>
</nav>