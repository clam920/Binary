var facilities = [];
const data = [
    {
        "type": "glass",
        "facility": [
            {
                "place": "NORTH SHORE RECYCLING AND WASTE CENTRE",
                "coordinates": [-123.01809661781101, 49.30128946964686]
            },
            {
                "place": "POWELL STREET RETURN-IT BOTTLE DEPOT",
                "coordinates": [-123.06668623130273, 49.28432306230311]
            }
        ]
    },
    {
        "type": "plastic",
        "facility": [
            {
                "coordinates": [-122.46152803131277, 9.090931848515034],
                "place": "BLUE PLANET RECYCLING",
            },
            {
                "coordinates": [-122.81127270247502, 49.118203173139264],
                "place": "EMTERRA ENVIRONMENTAL - SURREY",
            },
            {
                "coordinates": [-123.10084884294041, 49.25716962771798],
                "place": "URBAN SOURCE",
            },
            {
                "coordinates": [-122.62682891358655, 49.20014503465938],
                "place": "WESTCOAST PLASTIC RECYCLING",
            }
        ]
    },
    {
        "type": "cardboard",
        "facility": [
            {
                "coordinates": [-123.06668623130273, 49.28432306230311],
                "place": "POWELL STREET RETURN-IT BOTTLE DEPOT",
            },
            {
                "coordinates": [-123.09190007177935, 49.20640098139237],
                "place": "BEGG CARTON EXCHANGE",
            }
        ]
    },
    {
        "type": "paper",
        "facility": [
            {
                "coordinates": [-123.06668623130273, 49.28432306230311],
                "place": "POWELL STREET RETURN-IT BOTTLE DEPOT",
            },
            {
                "coordinates": [-123.10642038874201, 49.20894031159841],
                "place": "SOUTH VAN BOTTLE DEPOT",
            },
            {
                "coordinates": [-123.1149743134225, 49.20867115835692],
                "place": "VANCOUVER ZERO WASTE CENTER",
            },
        ]
    },
    {
        "type": "paper",
        "facility": [
            {
                "coordinates": [-123.06668623130273, 49.28432306230311],
                "place": "POWELL STREET RETURN-IT BOTTLE DEPOT",
            },
            {
                "coordinates": [-123.10642038874201, 49.20894031159841],
                "place": "SOUTH VAN BOTTLE DEPOT",
            },
            {
                "coordinates": [-123.1149743134225, 49.20867115835692],
                "place": "VANCOUVER ZERO WASTE CENTER",
            },
        ]
    },
    {
        "type": "metal",
        "facility": [
            {
                "coordinates": [-123.08198097141488, 49.27338112280383],
                "place": "REGIONAL RECYCLING - VANCOUVER",
            },
            {
                "coordinates": [-122.57650130520572, 49.20857510585476],
                "place": "WESTERN DRUM RECYCLERS",
            },
        ]
    }
]

const getSelected = () => {
    var selection = document.getElementById("mySelection").value;
    if (facilities.length > 0) {
        facilities.splice(0, facilities.length);
    }
    data.forEach(el => {
        if (el.type === selection) {
            facilities = el.facility;
        }
    });

    removeMarkers();

    // add markers to map
    for (const feature of facilities) {
        // console.log(feature)
        // create a HTML element for each feature
        const el = document.createElement('div');
        el.className = 'marker';
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(feature.place);


        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el).setLngLat(feature.coordinates).addTo(map).setPopup(popup);
    }
}

function removeMarkers() {
    const markers = document.getElementsByClassName('marker');
    while (markers.length > 0) {
        markers[0].parentNode.removeChild(markers[0]);
    }
}