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


    $(this).addClass('active');

    dimension = $(this).children('a').html().toLowerCase();
    switchMap(dimension);


  });

function switchMap(dimension) {

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
            placesLayers['nether'].addTo(mcMap);
            break;
    
        case 'overworld':
        default:
            $('#overworld-menu').addClass('active');
            window.history.pushState('overworld', 'overworld', '/');
            currDimension = 'overworld';

            placesLayers['overworld'].addTo(mcMap);
            tilesLayer['overworld'].addTo(mcMap);
            placesLayers['nether'].removeFrom(mcMap);
            break;
    }
}

// ================
// NEW MARKER DROPDOWN
// ================

// let's reset the dropdown form every time the dropdown is hidden, to prevent accidentally editing an existing place
$('#submitFormDropdown').on('hidden.bs.dropdown', function () {
    resetForm('submit-form');
})

// validation for submit button
$('#submit-form').on('submit', function (e) {
    e.preventDefault();

    // clears CSS class to perform validation
    $('#submit-form').find('input').removeClass('is-invalid');

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
                        console.log(formData);
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

    var placeId = $(btn).data('placeid');
    // console.log('request to edit ' + placeId);

    // gets current data from the database
    $.getJSON("/api/places/" + placeId, function (data, status) {
        // console.log(data);

        // opens the edit dropdown
        $('#submitButton').dropdown('show');

        $('#submit-form').find('input[name="id"]').val(data['id']);
        $('#submit-form').find('input[name="title"]').val(data['title']);
        $('#submit-form').find('select[name="dimension"]').val(data['dimension']);
        $('#submit-form').find('input[name="coordX"]').val(data['coordX']);
        $('#submit-form').find('input[name="coordY"]').val(data['coordY']);
        $('#submit-form').find('input[name="coordZ"]').val(data['coordZ']);
        $('#submit-form').find('select[name="icon"]').val(data['icon']);
        $('#submit-form').find('textarea[name="comment"]').html(data['comment']).val(data['comment']);

    });

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
    // console.log('getting minedmap tiles');

    var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		var res = JSON.parse(this.responseText),
		    mipmaps = res.mipmaps,
		    spawn = res.spawn;

        // console.log('res');
        // console.log(res);

        // console.log('mipmaps');
        // console.log(mipmaps);


		tilesLayer[dimension] = new MinedMapLayer(mipmaps, 'map');

        //mcMap.addLayer(tilesLayer[dimension]);
        // layerControl.addOverlay(tilesLayer[dimension], dimension + 'Tiles');
        // console.log(tilesLayer);

        // if not hidden, add it to the map right away
        if (hidden == false) {
            tilesLayer[dimension].addTo(mcMap); 
        }

	};

	xhr.open('GET', '/public/minedmap/data/info.json', true);
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
var mcMap = L.map('overworld', {
    crs: L.CRS.Simple,
    minZoom: -5
});


var bounds = [[-5000, -5000], [5000, 5000]];
var image = L.imageOverlay('/public/media/img/10k_grid.svg', bounds).addTo(mcMap);


// var bounds = [[-470, -370], [397, 977]];
// var image = L.imageOverlay('/public/media/img/map/overworld1.jpg', bounds, {opacity: 0.3, zIndex: -1 }).addTo(mcMap);

// sets map view
mcMap.setView([0, 500], -1);

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



    // if it's /nether, we hide the overworld stuff. otherwise, do the opposite
    if (pathArray[1] == 'nether') {
        currDimension = 'nether';
        getPlaces(false, 'overworld', true);
        getPlaces(false, 'nether', false);
        getMinedMapTiles('overworld', true);
    } else {
        currDimension = 'overworld';
        getPlaces(false, 'overworld');
        getPlaces(false, 'nether', true);
        getMinedMapTiles('overworld', false);
    }

};
