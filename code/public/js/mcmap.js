// bootstrap tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

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

                        // deletes the old marker if it was an update
                        if (data.action == 'update') {
                            clearMarker(data.id);
                        }

                        // creates a new marker, with the popup open
                        createMarker(newMarker, true);

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
function getPlaces(clear = false) {

    if (clear == true) {
        // let's first remove all current markers
        markers.clearLayers();
    }

    $.getJSON("/api/places/overworld", function (data, status) {
        // console.log(data);
        // console.log(data[1]['title']);

        var i;
        for (i = 0; i < data.length; i++) {

            createMarker(data[i]);
        }

    });

}

function getMinedMapTiles() {
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


		var mapLayer = new MinedMapLayer(mipmaps, 'map');

		mapLayer.addTo(mcMap);

        // console.log(mapLayer);

	};

	xhr.open('GET', '/public/minedmap/data/info.json', true);
	xhr.send();

}

// adding and removing markers
var markers = []
function createMarker(markerData, open = false) {

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

    myMarker = L.marker(coords, { icon: icon });
    myMarker._id = markerData['id'];

    mcMap.addLayer(myMarker);
    markers.push(myMarker);

    if (open == true) {
        var myPopup = myMarker.bindPopup(popup).openPopup();
    } else {
        var myPopup = myMarker.bindPopup(popup);
    }
}

function clearMarker(id) {
    //console.log(markers)
    var new_markers = []
    markers.forEach(function (marker) {
        if (marker._id == id) mcMap.removeLayer(marker)
        else new_markers.push(marker)
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


mcMap.setView([0, 500], -1);

L.control.scale({ imperial: false }).addTo(mcMap);
// adds the XZ map axis to the bottom left of the map 

var mapAxis = L.control({ position: "bottomleft" });
mapAxis.onAdd = function (mcMap) {
    var div = L.DomUtil.create("div", "info legend");
    div.innerHTML = '<img class="mapAxis" src="/public/media/img/axis.svg">';
    return div;
}
mapAxis.addTo(mcMap);

window.onload = function () {

    // var overworldMap = drawMap('overworld');
    getPlaces();
    getMinedMapTiles();
};
