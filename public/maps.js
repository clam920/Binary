console.log("in maps js")

var facilities = [];
let suggestions = [];


// async function getMapResult() {
//     // const mapResult = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJw5MD3ZNwhlQRvstXN3AeLXk&key=AIzaSyAcvQ5KvHzy62ujKTFT7b1OzPazsqfhn3E`)
//     // console.log(((mapResult)));
//     axios.get(`https://maps.googleapis.com/maps/api/place/details/json
//     ?fields=name%2Crating%2Cformatted_phone_number
//     &place_id=ChIJN1t_tDeuEmsRUsoyG83frY4
//     &key=${mapsAPIkey}`)
//         .then(function (response) {
//             // handle success
//             console.log(response.data);
//         })
//         .catch(function (error) {
//             // handle error
//             console.log(error.message);
//         })
// }
// getMapResult();

// function initMap() {
//     // Your code using google.maps object goes here
//     // ... (place details retrieval logic from previous response)
//     var map = new google.maps.Map(document.getElementById("map-container")); // Replace "map-container" with your map element's ID
//     var service = new google.maps.places.PlacesService(map);

//     var request = {
//         placeId: "ChIJw5MD3ZNwhlQRvstXN3AeLXk"
//     };

//     service.getDetails(request, function (place, status) {
//         if (status === google.maps.places.PlacesServiceStatus.OK) {
//             // Place details successfully retrieved!
//             console.log(place);
//             // Access place properties like name, address, rating, etc.
//             // For example:
//             var name = place.name;
//             var address = place.formatted_address;
//             // Use this data to display place information or perform other actions
//         } else {
//             console.error("Place details request failed:", status);
//         }
//     });
// }

// function getPlaceDetails(placeId) {
//     console.log("in getPlaceDetails")

//     // var map = new google.maps.Map(document.getElementById("map-container")); // Replace "map-container" with your map element's ID
//     // var service = new google.maps.places.PlacesService(map);

//     // var request = {
//     //     placeId: placeId
//     // };

//     // service.getDetails(request, function (place, status) {
//     //     if (status === google.maps.places.PlacesServiceStatus.OK) {
//     //         // Place details successfully retrieved!
//     //         console.log(place);
//     //         // Access place properties like name, address, rating, etc.
//     //         // For example:
//     //         var name = place.name;
//     //         var address = place.formatted_address;
//     //         // Use this data to display place information or perform other actions
//     //     } else {
//     //         console.error("Place details request failed:", status);
//     //     }
//     // });
// }

// getPlaceDetails('ChIJw5MD3ZNwhlQRvstXN3AeLXk');
// initMap();

function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 49.26264182277888, lng: -123.06925252771276 },
        zoom: 12,
    });
    const request = {
        placeId: "ChIJw5MD3ZNwhlQRvstXN3AeLXk",
        fields: ["name", "formatted_address", "place_id", "geometry"],
    };
    const infowindow = new google.maps.InfoWindow();
    const service = new google.maps.places.PlacesService(map);

    service.getDetails(request, (place, status) => {
        if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            place &&
            place.geometry &&
            place.geometry.location
        ) {
            const marker = new google.maps.Marker({
                map,
                position: place.geometry.location,
            });

            google.maps.event.addListener(marker, "click", () => {
                const content = document.createElement("div");
                const nameElement = document.createElement("h2");

                nameElement.textContent = place.name;
                content.appendChild(nameElement);

                const placeIdElement = document.createElement("p");

                placeIdElement.textContent = place.place_id;
                content.appendChild(placeIdElement);

                const placeAddressElement = document.createElement("p");

                placeAddressElement.textContent = place.formatted_address;
                content.appendChild(placeAddressElement);
                infowindow.setContent(content);
                infowindow.open(map, marker);
            });
        }
    });
}

window.initMap = initMap;


document.addEventListener('DOMContentLoaded', async () => {
    const input = document.getElementById('auto-suggest');
    const suggestionsBox = document.getElementById('suggestions');

    try {
        const response = await fetch('type.json');
        suggestions = await response.json();
        // facilities = await response.json();
        console.log(suggestions);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }

    // Show suggestions based on user input
    input.addEventListener('input', () => {
        const query = input.value.toLowerCase();
        suggestionsBox.innerHTML = '';
        if (query) {
            const filteredSuggestions = suggestions.filter(item => item.type.toLowerCase().includes(query));

            filteredSuggestions.forEach(suggestion => {
                const suggestionElement = document.createElement('div');
                suggestionElement.className = 'container';
                suggestionElement.textContent = suggestion.type;
                suggestionElement.addEventListener('click', () => {
                    input.value = suggestion.type;
                    suggestionsBox.innerHTML = '';
                    suggestionsBox.style.display = 'none';
                });
                suggestionsBox.appendChild(suggestionElement);
            });

            suggestionsBox.style.display = 'block';
        } else {
            suggestionsBox.style.display = 'none';
        }
    });

    // Hide suggestions when clicking outside the input or suggestions box
    document.addEventListener('click', (event) => {
        if (!suggestionsBox.contains(event.target) && event.target !== input) {
            suggestionsBox.style.display = 'none';
        }
    });
});



const getSelected2 = () => {
    var selection = document.getElementById("auto-suggest").value;
    // console.log(selection);
    if (facilities.length > 0) {
        facilities.splice(0, facilities.length);
    }
    suggestions.forEach(el => {
        if (el.type === selection) {
            facilities = el.facility;
        }
    });
    // console.log(facilities + " facilities after loop");

    removeMarkers();
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 49.26264182277888, lng: -123.06925252771276 },
        zoom: 7,
    });

    document.getElementById("infoCard").innerHTML = "";
    // add markers to map
    for (const feature of facilities) {
        // create a HTML element for each feature
        new google.maps.Marker({
            position: { lat: feature.coordinates[1], lng: feature.coordinates[0] },
            map: map,
            label: 'A',
            title: feature.place,
            draggable: false,
            animation: google.maps.Animation.DROP,
            icon: 'images/location-pin.png'
        });

        var request = {
            placeId: feature.placeID,
            fields: ['name', 'rating', 'opening_hours']
        };

        service = new google.maps.places.PlacesService(map);
        service.getDetails(request, (place, status) => {
            console.log(place)
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                const elCard = document.createElement('div');
                if (place.opening_hours.open_now) {
                    elCard.className = 'card';
                    elCard.style = 'width: 18rem;';
                    elCard.innerHTML = `<div class="card-body">
                <h5 class="card-title">${feature.place}</h5>
                <h6 class="card-subtitle mb-2 text-success">Open</h6>
                <h6 class="card-subtitle mb-2 text-success"></h6>
                <a href="${feature.directions}" target="_blank" class="card-link">Get directions..</a>
                </div>`;
                } else {
                    elCard.className = 'card';
                    elCard.style = 'width: 18rem;';
                    elCard.innerHTML = `<div class="card-body">
                <h5 class="card-title">${feature.place}</h5>
                <h6 class="card-subtitle mb-2 text-danger">Close</h6>
                <a href="${feature.directions}" target="_blank" class="card-link">Get directions..</a>
                </div>`;
                }

                document.getElementById("infoCard").appendChild(elCard);
            }
        });

        // function callback(place, status) {
        //     console.log(place)
        //     if (status == google.maps.places.PlacesServiceStatus.OK) {
        //         createMarker(place);
        //     }

        /** info card for features */
        // const elCard = document.createElement('div');
        // elCard.className = 'card';
        // elCard.style = 'width: 18rem;';
        // elCard.innerHTML = `<div class="card-body">
        //         <h5 class="card-title">${feature.place}</h5>
        //         <h6 class="card-subtitle mb-2 text-muted">09.00</h6>
        //         <a href="${feature.directions}" target="_blank" class="card-link">Get directions..</a>
        //         </div>`;
        // document.getElementById("infoCard").appendChild(elCard);
    }



    /** mapbox marker */
    // const el = document.createElement('div');
    // el.className = 'marker';
    // const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(feature.place + "\n\n" + `<a href="${feature.directions}" target="_blank">${feature.directions}</a>`);

    // // make a marker for each feature and add to the map
    // new mapboxgl.Marker(el).setLngLat(feature.coordinates).addTo(map).setPopup(popup);
    // }
}
function removeMarkers() {
    const markers = document.getElementsByClassName('marker');
    while (markers.length > 0) {
        markers[0].parentNode.removeChild(markers[0]);
    }
}

