// Load the tile layer
baseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})


// Initialize LayerGroups for layer control
let layers = {
    fireFacilities: new L.LayerGroup(),
    fireZones: new L.LayerGroup()
};

// Create the map with our layers.
let map = L.map('map', {
    center: [36.778, -119.417],
    zoom: 8,
    layers: [
      layers.fireFacilities,
      layers.fireZones
    ]
});

baseMap.addTo(map);

// Create overlays object to add to the layer control 
let overlays = {
    "Fire Facilities": layers.fireFacilities,
    "Fire Zones": layers.fireZones,
};
  
// Create control for layers, and add the overlays 
L.control.layers(null, overlays).addTo(map);

// Load GeoJSON data
d3.json('https://raw.githubusercontent.com/supvadakkeveetil/Project3_Group1/main/FireFacility1/firefac.geojson').then(data => {
            // Filter GeoJSON features for Active stations
        var activeStations = data.features.filter(feature => feature.properties.FACILITY_S === 'Active');

            // Create markers and popups for each active station
        activeStations.forEach(station => {
            var coordinates = [station.properties.LAT, station.properties.LON]; 
            var stationName = station.properties.NAME;
            var stationCity= station.properties.CITY;
            var stationCounty =station.properties.COUNTY;
           
            // Add marker icons to the fireFacilities layer 

            var smallerMarker = L.icon({
                iconUrl: 'fire_station.png',
                iconSize: [20, 20], // Adjust the size as needed
                iconAnchor: [6, 20],
                popupAnchor: [0, -16],
                
              });

            L.marker((coordinates), {icon: smallerMarker })
                //.bindPopup(stationName)
                .bindPopup("<h3><h3>Station Name:" + stationName + "<h3><h3>County: " + stationCounty +  "<h3><h3>City: " + stationCity + "</h3>")
                .addTo(layers.fireFacilities);
        });
        })
        .catch(error => console.error('Error loading GeoJSON:', error));


// Load Heatmap GeoJSON 
d3.json('California_FHSZ.geojson').then(data => {

    // Create an object to map severity to colors 
    var severityColors = {
        'Moderate': '#FFE233',
        'High': '#FFBA33',
        'Very High': '#FF6133'
    }
    //Opacity code
    var severityOpacity = {
        'Moderate': '0.7',
        'High': '1.0',
        'Very High': '1.5'
    }
    // Process data and create heat layers for each category 
    data.features.forEach(function(feature) {

        // Extract severity information from GeoJSON 
        var severity = feature.properties["HAZ_CLASS"];

        // Create a polygon layer for fire severity 
        var polygonLayer = L.geoJSON(feature, {
            style: {
                fillColor: severityColors[severity],
                weight: .2,
                opacity: .5,
                color: 'blue',
                fillOpacity: severityOpacity[severity]
            }
        }).addTo(layers.fireZones);
    });

    //Create Legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = ['Moderate','High','Very High'],
        colors = ["#FFE233","#FFBA33","#FF6133"];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);
});



