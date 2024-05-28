console.log("in maps js")

var facilities = [];
let suggestions = [];

function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 49.26264182277888, lng: -123.06925252771276 },
        zoom: 12,
    });
}

window.initMap = initMap;


document.addEventListener('DOMContentLoaded', async () => {
    const input = document.getElementById('auto-suggest');
    const suggestionsBox = document.getElementById('suggestions');
    suggestionsBox.classList.add('container', 'mb-2');
    // suggestionsBox.style.color = 'blue';
    // suggestionsBox.style.border = '1px solid #ccc';
    // suggestionsBox.style.borderRadius = '10px';
    // suggestionsBox.style.boxSizing = 'border-box';

    try {
        const response = await fetch('type.json');
        suggestions = await response.json();
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
                suggestionElement.style.border = '1px solid #F5F5F5';
                suggestionElement.style.borderRadius = '5px';
                suggestionElement.style.cursor = 'pointer';
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
            title: feature.place,
            draggable: false,
            animation: google.maps.Animation.DROP,
        });

        var request = {
            placeId: feature.placeID,
            fields: ['name', 'rating', 'opening_hours']
        };

        service = new google.maps.places.PlacesService(map);
        service.getDetails(request, (place, status) => {
            // console.log(place)
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                const elCard = document.createElement('div');
                elCard.className = 'card';
                elCard.style = 'width: 18rem;';
                elCard.innerHTML = `<div class="card-body">
            <h5 class="card-title">${feature.place}</h5>
            <h6 class="card-subtitle mb-1">Open</h6>`
                if (place.opening_hours.open_now) {
                    for (let i = 0; i < place.opening_hours.weekday_text.length; i++) {
                        elCard.innerHTML += `<h6 class="card-subtitle mb-2 text-muted">${place.opening_hours.weekday_text[i]}</h6>`
                    }

                    elCard.innerHTML += `<a href="${feature.directions}" <button class="btn btn-primary" href="${feature.directions}" target="_blank">Get directions..</button>
                </div>`;
                } else {
                    elCard.className = 'card';
                    elCard.style = 'width: 18rem;';
                    elCard.innerHTML = `<div class="card-body">
                <h5 class="card-title">${feature.place}</h5>
                <h6 class="card-subtitle mb-2 text-danger">Close</h6>
                <button class="btn btn-primary rounded-pill " href="${feature.directions}" target="_blank">Get directions..</button>
                </div>`;
                }

                document.getElementById("infoCard").appendChild(elCard);
            }
        });
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

function getDirections(directions) { }

