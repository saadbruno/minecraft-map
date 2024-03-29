// ================
// GENERAL STUFF
// ================

// bootstrap tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

// ================
// NAV MENU
// ================

$('.dimension-item').click(function(e) {
    e.preventDefault();

    dimension = $(this).children('a').html().toLowerCase();

    // console.log(dimension);
    switchMap(dimension);

  });

function switchMap(dimension) {

    // console.log("switching map to " + dimension);

    // UI Stuff. Updates the menu and the browser URL
    $('.dimension-item').each(function (i, obj) {
        $(obj).removeClass('active');
    });


    switch (dimension) {
        case 'nether':
            $('#nether-menu').addClass('active');
            window.history.pushState('nether', 'nether', '/nether');
            currDimension = 'nether';

            placesLayers['overworld'].removeFrom(mcMap);
            tilesLayer['overworld'].removeFrom(mcMap);
            placesLayers['the_end'].removeFrom(mcMap);
            tilesLayer['the_end'].removeFrom(mcMap);

            tilesLayer['nether'].addTo(mcMap);

            // if visibility is ON, add places to map
            if (document.getElementById('placesCheckbox').checked == true) {
                placesLayers['nether'].addTo(mcMap);
            }

            // changes css classes for the mapContainer
            document.getElementById('mapContainer').classList.remove('the_end','overworld');
            document.getElementById('mapContainer').classList.add('nether');

            break;

        case 'the end':
        case 'the_end':
            $('#the-end-menu').addClass('active');
            window.history.pushState('the_end', 'the_end', '/the_end');
            currDimension = 'the_end';

            placesLayers['overworld'].removeFrom(mcMap);
            tilesLayer['overworld'].removeFrom(mcMap);
            placesLayers['nether'].removeFrom(mcMap);
            tilesLayer['nether'].removeFrom(mcMap);


            tilesLayer['the_end'].addTo(mcMap);

            // if visibility is ON, add places to map
            if (document.getElementById('placesCheckbox').checked == true) {
                placesLayers['the_end'].addTo(mcMap);
            }

            // changes css classes for the mapContainer
            document.getElementById('mapContainer').classList.remove('nether','overworld');
            document.getElementById('mapContainer').classList.add('the_end');

            break;

        case 'overworld':
        default:
            $('#overworld-menu').addClass('active');
            window.history.pushState('overworld', 'overworld', '/');
            currDimension = 'overworld';

            // removes nether places from the map
            placesLayers['nether'].removeFrom(mcMap);
            tilesLayer['nether'].removeFrom(mcMap);
            placesLayers['the_end'].removeFrom(mcMap);
            tilesLayer['the_end'].removeFrom(mcMap);
            // adds tiles (background images)
            tilesLayer['overworld'].addTo(mcMap);

            // if visibility is ON, add places to map
            if (document.getElementById('placesCheckbox').checked == true) {
                placesLayers['overworld'].addTo(mcMap);
            }

            // changes css classes for the mapContainer
            document.getElementById('mapContainer').classList.remove('the_end','nether');
            document.getElementById('mapContainer').classList.add('overworld');

            break;
    }
}

// visibility filter dropdown for places
$('#placesCheckbox').change(function() {

    // When checked
    if(this.checked) {
        // adds current dimension's icon to the map
        switch (currDimension) {
            case 'nether':
                placesLayers['nether'].addTo(mcMap);
                break;

            case 'the_end':
                placesLayers['the_end'].addTo(mcMap);
                break;

            case 'overworld':
            default:
                placesLayers['overworld'].addTo(mcMap);
                break;
        }

    // When unchecked
    } else {
        placesLayers['nether'].removeFrom(mcMap);
        placesLayers['the_end'].removeFrom(mcMap);
        placesLayers['overworld'].removeFrom(mcMap);
    }

});

// ================
// NEW MARKER DROPDOWN
// ================

// this allows us to force bootstrap to only close the dropdown when WE want it.
// it checks for the ".keepopen" class on the dropdown container div, and only closes it if the class is not present.
// thanks Vartan https://stackoverflow.com/a/25089383
$('#submitFormDropdown').on('hide.bs.dropdown', function (e) {
    var target = $(e.target);
    // console.log(target);
    if(target.hasClass("keepopen") || target.parents(".keepopen").length){
        return false; // returning false should stop the dropdown from hiding.
    }else{
        return true;
    }
});

// The "submit new marker" button adds the ".keepopen" class to the dropdown, so it doesn't close on accident
$('#submitButton').on('click', function (event) {
    $('#submitFormDropdown').toggleClass('keepopen');
});

// let's reset the dropdown form every time the dropdown is hidden, to prevent accidentally editing an existing place
$('#submitFormDropdown').on('hidden.bs.dropdown', function () {
    resetForm('submit-form');
})

// validation for submit button
$('#submit-form').on('submit', function (e) {
    e.preventDefault();

    // clears CSS class to perform validation
    $('#submit-form').find('input').removeClass('is-invalid');
    $('#genericFeedback').html('');

    var formData = new FormData(this);

    $.ajax({
        url: "/",
        data: formData,
        processData: false,
        contentType: false,
        type: "POST",

        // this success doesn't mean it sucessfully added a new entry to th database. It just means the server got the POST succesfully, and will do validation
        success: function (data, textStatus, jqXHR) {
            //console.log(data);

            // decides what to do with the reply
            // if the message was 'success', adds icon to map without reloading the page, and move map view
            if (data.status == 'success') {

                // allows dropdown to close
                $('#submitFormDropdown').removeClass('keepopen');

                // location.reload();
                if (data.id == 0) {
                    console.log('no change detected');
                } else {
                    $.getJSON("/api/places/" + data.id, function (newMarker, status) {

                        var dimension = newMarker['dimension'].toLowerCase();

                        // UI. Changes the map we're currently seeing
                        if (currDimension != dimension) {
                            switchMap(dimension);
                        }

                        // deletes the old marker if it was an update
                        if (data.action == 'update') {
                            clearMarker(data.id);
                        }

                        // creates a new marker, with the popup open
                        createMarker(newMarker, true, dimension);

                        // moves map view to the submitted thing
                        var coords = [-newMarker['coordZ'], newMarker['coordX']];
                        mcMap.setView(coords, -1);

                        // closes the dropdown
                        $('#submitButton').dropdown('hide');

                    });
                }

            } else if (data.status == 'auth_error') {
                $('#genericFeedback').html('Not authorized');
            } else if (data.status == 'error') {
                // loops through error messages, adding feedback to the user
                const keys = Object.keys(data.validation);
                for (const key of keys) {

                    var input = 'input[name="' + key + '"]';
                    $('#submit-form').find(input).addClass('is-invalid');
                    $('#submit-form').find(input).siblings('.invalid-feedback').html(data.validation[key]);
                }

            }

        },
        // the server never got the data
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Server error");
        }
    });

});

// reset form
function resetForm(formId) {
    // console.log('resetting form ' + formId);
    document.forms[formId].reset();
    $('#' + formId).find('textarea[name="comment"]').html('').val('');
    $('#' + formId).find('input[name="id"]').val('');
    $('#' + formId).find('.is-invalid').removeClass('is-invalid');
}

// EDIT place
function editPlace(btn) {

    // resets the form, just in case
    $('#submitButton').dropdown('hide');
    resetForm('submit-form');

    // adds the keepopen class to the dropdown
    $('#submitFormDropdown').addClass('keepopen');

    var placeId = $(btn).data('placeid');
    // console.log('request to edit ' + placeId);

    // gets current data from the database
    $.getJSON("/api/places/" + placeId, function (data, status) {
        // console.log(data);

        // opens the edit dropdown
        $('#submitButton').dropdown('show');

        // updates the data on it
        $('#submit-form').find('input[name="id"]').val(data['id']);
        $('#submit-form').find('input[name="title"]').val(data['title']);
        $('#submit-form').find('select[name="dimension"]').val(data['dimension']);
        $('#submit-form').find('input[name="coordX"]').val(data['coordX']);
        $('#submit-form').find('input[name="coordY"]').val(data['coordY']);
        $('#submit-form').find('input[name="coordZ"]').val(data['coordZ']);
        $('#submit-form').find('input[name="icon"]').val(data['icon']);
        $('#submit-form').find('textarea[name="comment"]').html(data['comment']).val(data['comment']);

        // updates selected icon
        replaceIcon(document.querySelector('#icon-selector') , data['icon_url']);

    });

}

// function to replace the icon picker image
function replaceIcon(button, iconUrl) {
    button.removeChild(button.firstChild);
    const img = document.createElement('img');
    img.src = iconUrl;
    img.className = "icon-preview";
    button.appendChild(img);
}

// ================
// MAP STUFF
// ================


// Gets all the places via ajax, and loops through each, adding markers to the map
var placesLayers = [];
function getPlaces(clear = false, dimension = 'overworld', hidden = false) {

    // defines a global level variable with the layer group
    placesLayers[dimension] = L.layerGroup();

    if (clear == true) {
        // let's first remove all current markers
        markers.clearLayers();
    }

    switch (dimension) {
        case 'nether':
            var apiUrl = '/api/places/nether';
            break;

        case 'the_end':
            var apiUrl = '/api/places/the_end';
            break;

        case 'overworld':
        default:
            var apiUrl = '/api/places/overworld';
            break;
    }

    $.getJSON(apiUrl, function (data, status) {
        // console.log(data);
        // console.log(data[1]['title']);

        var tempMarkers = [];
        var i;
        for (i = 0; i < data.length; i++) {

            tempMarkers.push( createMarker(data[i], false, dimension) );
        }

        // Creates checkbox in the control menu
        // layerControl.addOverlay(placesLayers[dimension], dimension + 'Places');

        // if not hidden, add it to the map right away
        if (hidden == false) {
            placesLayers[dimension].addTo(mcMap);
        }
    });

}

var tilesLayer = [];
function getMinedMapTiles(dimension = 'overworld', hidden = false) {
    // console.log('getting minedmap tiles for ' + dimension);

    var dataPath;

    // data that changes depending on the dimension
    switch (dimension) {
        case 'the_end':
            dataPath = 'data_the_end';
            break;

        case 'nether':
            dataPath = 'data_nether';
            break;

        case 'overworld':
        default:
            dataPath = 'data';
            break;
    }


    var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		var res = JSON.parse(this.responseText),
		    mipmaps = res.mipmaps,
		    spawn = res.spawn;

        // console.log('res ' + dimension, res);
        // console.log('mipmaps ' + dimension, mipmaps);


		tilesLayer[dimension] = new MinedMapLayer(mipmaps, 'map', dataPath);

        //mcMap.addLayer(tilesLayer[dimension]);
        // layerControl.addOverlay(tilesLayer[dimension], dimension + 'Tiles');
        // console.log(tilesLayer);

        // if not hidden, add it to the map right away
        if (hidden == false) {
            tilesLayer[dimension].addTo(mcMap);
        }

	};


    xhr.open('GET', '/public/minedmap/'+dataPath+'/info.json', true);
	xhr.send();

}

// adding and removing markers
var markers = []
function createMarker(markerData, open = false, dimension = 'overworld') {

    // defining data

    var coords = [-markerData['coordZ'], markerData['coordX']];
    var icon = new blockIcon({ iconUrl: markerData['icon_url'] });

    var popup = '<h4>' + markerData['title'] + '</h4>';
    popup += '<h6><i class="fas fa-map-marker-alt"></i> Coordenadas:</h6>';
    popup += '<p>X: ' + markerData['coordX'];
    if (markerData['coordY']) {
        popup += '<br>Y: ' + markerData['coordY'];
    }

    popup += '<br>Z: ' + markerData['coordZ'] + '</p>';

    if (markerData['comment'] != null) {
        popup += '<h6><i class="fas fa-comment-dots"></i> Comentários:</h6>';
        popup += '<p>' + markerData['comment'] + '</p>';
    }

    popup += '<button onclick="editPlace(this)" class="editPlace btn btn-secondary btn-sm" data-placeId="' + markerData['id'] + '"><i class="fas fa-edit"></i> Editar</button>';

    // actually adding marker to map

    myMarker = L.marker(coords, { icon: icon }).addTo(placesLayers[dimension]);
    myMarker._id = markerData['id'];

    if (open == true) {
        var myPopup = myMarker.bindPopup(popup).openPopup();
    } else {
        var myPopup = myMarker.bindPopup(popup);
    }

    markers.push(myMarker);
    return myMarker;
    // mcMap.addLayer(myMarker);


}

function clearMarker(id, dimension) {
    //console.log(markers)

    var new_markers = []
    markers.forEach(function (marker) {
        if (marker._id == id) {
            marker.removeFrom(placesLayers['overworld']);
            marker.removeFrom(placesLayers['nether']);
            marker.removeFrom(placesLayers['the_end']);
        } else  {
            new_markers.push(marker);
        }
    })
    markers = new_markers
}



// icons
var blockIcon = L.Icon.extend({
    options: {
        iconSize: [30, -1],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    }
});

// // Overworld map
var mcMap = L.map('mapContainer', {
    crs: L.CRS.Simple,
    minZoom: -5
});


var bounds = [[-5000, -5000], [5000, 5000]];


// adds coordinates UI
var coordControl = new CoordControl();
coordControl.addTo(mcMap);

mcMap.on('mousemove', function(e) {
    coordControl.update(Math.round(e.latlng.lng), Math.round(-e.latlng.lat));
});

//console.log(coordControl);

// adds scale UI to bottom left
L.control.scale({ imperial: false }).addTo(mcMap);

// adds the XZ map axis to the bottom left of the map
var mapAxis = L.control({ position: "bottomleft" });

mapAxis.onAdd = function (mcMap) {
    var div = L.DomUtil.create("div", "info legend");
    div.innerHTML = '<img class="mapAxis" src="/public/media/img/axis.svg">';
    return div;
}
mapAxis.addTo(mcMap);


// var layerControl = L.control.layers().addTo(mcMap);

var currDimension;
window.onload = function () {

    var pathArray = window.location.pathname.split('/');
    //console.log (pathArray);



    // loads places and tiles (and hides them depending on the currently select dimension)
    switch (pathArray[1]) {
        case 'nether':
            currDimension = 'nether';
            getPlaces(false, 'overworld', true);
            getPlaces(false, 'nether', false);
            getPlaces(false, 'the_end', true);
            getMinedMapTiles('overworld', true);
            getMinedMapTiles('nether', false);
            getMinedMapTiles('the_end', true);            
            break;
    
        case 'the_end':
            currDimension = 'the_end';
            getPlaces(false, 'overworld', true);
            getPlaces(false, 'nether', true);
            getPlaces(false, 'the_end', false);
            getMinedMapTiles('overworld', true);
            getMinedMapTiles('nether', true);
            getMinedMapTiles('the_end', false);
            break

        case 'overworld':
        default:
            currDimension = 'overworld';
            getPlaces(false, 'overworld');
            getPlaces(false, 'nether', true);
            getPlaces(false, 'the_end', true);
            getMinedMapTiles('overworld', false);
            getMinedMapTiles('nether', true);
            getMinedMapTiles('the_end', true);
            break;
    }
};

// ========
// HASH funcions. These update the URL on map move, and zoom, in case of a page refresh / sharing links
// taken partially from the MinedMap.js
// ========
var x, z, zoom;

var updateParams = function () {
    var args = parseHash();

    zoom = parseInt(args['zoom']);
    x = parseFloat(args['x']);
    z = parseFloat(args['z']);

    if (isNaN(zoom))
        zoom = 0;
    if (isNaN(x))
        x = 8;
    if (isNaN(z))
        z = 230;
};

updateParams();

// sets map view
mcMap.setView([-z, x], zoom);


var makeHash = function () {
    var ret = '#x='+x+'&z='+z;

    if (zoom != 0)
        ret += '&zoom='+zoom;

    return ret;
};

var updateHash = function () {
    window.location.hash = makeHash();
};

var refreshHash = function () {
    zoom = mcMap.getZoom();
    center = mcMap.getCenter();
    x = Math.round(center.lng);
    z = Math.round(-center.lat);

    updateHash();
}

updateHash();

mcMap.on('moveend', refreshHash);
mcMap.on('zoomend', refreshHash);
mcMap.on('layeradd', refreshHash);
mcMap.on('layerremove', refreshHash);

window.onhashchange = function () {
    if (window.location.hash === makeHash())
        return;

    updateParams();

    mcMap.setView([-z, x], zoom);

    updateHash();
};