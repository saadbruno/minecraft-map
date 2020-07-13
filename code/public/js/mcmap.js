// bootstrap tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

// validation for submit button
$('#submit-form').on('submit', function (e) {
    e.preventDefault();

    // clears CSS class to perform validation
    $('#submit-form').find('input').removeClass('is-invalid');

    var formData = new FormData(this);
    console.log(formData);


    $.ajax({
        url: "/",
        data: formData,
        processData: false,
        contentType: false,
        type: "POST",

        // this success doesn't mean it sucessfully added a new entry to th database. It just means the server got the POST succesfully, and will do validation
        success: function (data, textStatus, jqXHR) {
            console.log(data);



            // decides what to do with the reply

            // if the message was 'success', adds icon to map without reloading the page, and move map view
            if (data.status == 'success') {

                location.reload();


                // WIP CODE TO SHOW NEW PLACE WITHOUT RELOADING THE PAGE

                // var serialized = $('form').serializeArray(data);
                // var formattedData = {};

                // $.each(serialized, function (i, field) {
                //     // console.log(field.name);
                //     formattedData[field.name] = field.value;
                // });
                // console.log('formatted:');
                // console.log(formattedData);

                // // moves map view to the submitted thing
                // mcMap.setView([formattedData['coordZ'], formattedData['coordX']], -1);


                // // hides bootstrap dropdown and resets the form
                // $('#submitButton').dropdown('hide')
                // document.forms["submit-form"].reset();

            } else if (data.status == 'error') {
                console.log('erro?');
                // loops through error messages, adding feedback to the user
                const keys = Object.keys(data.validation);
                for (const key of keys) {

                    var input = 'input[name="' + key + '"]';
                    console.log(input);
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



// ================
// MAP STUFF 
// ================


window.onload = function () {

    // var overworldMap = drawMap('overworld');
    getPlaces();
};


// icons

var blockIcon = L.Icon.extend({
    options: {
        iconSize: [30, 30],
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


// Gets all the places via ajax, and loops through each, adding markers to the map
function getPlaces(clear = false) {

    if (clear == true) {
        // let's first remove all current markers
        markers.clearLayers();
    }

    $.getJSON("/api/places/overworld", function (data, status) {
        console.log(data);
        console.log(data[1]['title']);

        var i;
        for (i = 0; i < data.length; i++) {

            // defines marker data

            var coords = [data[i]['coordZ'], data[i]['coordX']];
            var icon = new blockIcon({ iconUrl: data[i]['icon'] });

            var popup = '<h4>' + data[i]['title'] + '</h4>';
            popup += '<h6><i class="fas fa-map-marker-alt"></i> Coordenadas:</h6>';
            popup += '<p>X: ' + data[i]['coordX'];
            popup += '<br>Y: ' + data[i]['coordY'];
            popup += '<br>Z: ' + data[i]['coordZ'] + '</p>';

            if (data[i]['comment'] != null) {
                popup += '<h6><i class="fas fa-comment-dots"></i> Comentários:</h6>';
                popup += data[i]['comment'];
            }

            // creates marker

            var marker = L.marker(coords, { icon: icon }).addTo(mcMap).bindPopup(popup);
        }

    });

}