console.log("in script js")

var facilities = [];
let suggestions = [];

document.addEventListener('DOMContentLoaded', async () => {
    const input = document.getElementById('auto-suggest');
    const suggestionsBox = document.getElementById('suggestions');



    // let suggestions = [];

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
    console.log(facilities + " facilities after loop");

    removeMarkers();

    document.getElementById("infoCard").innerHTML = "";
    // add markers to map
    for (const feature of facilities) {
        // create a HTML element for each feature
        const el = document.createElement('div');
        el.className = 'marker';
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(feature.place + "\n\n" + `<a href="${feature.directions}" target="_blank">${feature.directions}</a>`);

        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el).setLngLat(feature.coordinates).addTo(map).setPopup(popup);

        // info card for features
        const elCard = document.createElement('div');
        elCard.className = 'card';
        elCard.style = 'width: 18rem;';
        elCard.innerHTML = `<div class="card-body">
<h5 class="card-title">${feature.place}</h5>
<h6 class="card-subtitle mb-2 text-muted">09.00 - 16.30</h6>
<a href="${feature.directions}" target="_blank" class="card-link">Get directions..</a>
</div>`;

        document.getElementById("infoCard").appendChild(elCard);

    }
}
function removeMarkers() {
    const markers = document.getElementsByClassName('marker');
    while (markers.length > 0) {
        markers[0].parentNode.removeChild(markers[0]);
    }
}

