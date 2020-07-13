<div class="dropdown-menu dropdown-menu-right submit-dropdown" aria-labelledby="submitButton">

    <!-- form -->
    <form id="submit-form" action="/" method="post" class="needs-validation" novalidate>

        <input type="hidden" name="form" value="addPlace">

        <input type="hidden" name="id" value="">

        <!-- name  -->
        <div class="form-group">
            <label for="title" class="w-100"> Nome</label>
            <input class="form-control" name="title" type="text" maxlength="255" placeholder="Ex: Ilha das Flores">
            <div class="invalid-feedback">
            </div>
        </div>

        <!-- dimension -->
        <div class="form-group">
            <label for="icon">Dimensão</label>
            <select class="form-control" name="dimension">
                <option value='Overworld'>Overworld</option>
                <option value='Nether'>Nether</option>
            </select>
            <div class="invalid-feedback"> </div>
        </div>

        <!-- coordinates  -->
        Coordenadas
        <div class="form-group row">
            <div class="col">
                <input type="number" class="form-control form-control-sm" name="coordX" maxlength="6" max="999999" placeholder="X">
                <div class="invalid-feedback"> </div>
            </div>
            <div class="col">
                <input type="number" class="form-control form-control-sm" name="coordY" maxlength="6" max="999999" placeholder="Y">
                <div class="invalid-feedback"> </div>
            </div>
            <div class="col">
                <input type="number" class="form-control form-control-sm" name="coordZ" maxlength="6" min="-999999" max="999999" placeholder="Z">
                <div class="invalid-feedback"> </div>
            </div>
        </div>

        <!-- icon  -->
        <div class="form-group">
            <label for="icon">Ícone</label>
            <select class="form-control" name="icon">
                <?php foreach ($iconList as $icon) {
                    echo "<option value='" . $icon['id'] . "'>" . $icon['name'] . "</option>";
                } ?>
            </select>
            <div class="invalid-feedback"> </div>
        </div>

        <!-- Comments -->
        <div class="form-group">
            <label for="comment">Comentários</label>
            <textarea class="form-control" name="comment" rows="3"></textarea>
            <div class="invalid-feedback"> </div>
        </div>

        <button type="submit" class="btn btn-primary"><i class="fas fa-check"></i> Enviar</button>

    </form>
</div>