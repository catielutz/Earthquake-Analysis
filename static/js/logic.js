var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(queryURL).then(function (data) {
    // console.log(data.features);

    // set colors
    function setColor(depth) {
        if (depth > 90)
            return "#ff5f65"
        else if (depth > 70)
            return "#fe8d46"
        else if (depth > 50)
            return "#fbb22d"
        else if (depth > 30)
            return "#f7dc11"
        else if (depth > 10)
            return "#dcf400"
        else
            return "#a4f600"
    };

    // set circle size
    function markerSize(mag) {
        return mag * 25000;
    };

    function createMarker(feature, latlng) {
        return L.circle(latlng, {
            radius: markerSize(feature.properties.mag),
            fillColor: setColor(feature.geometry.coordinates[2]),
            opacity: 1,
            fillOpacity: 1,
            color: "#000000",
            stroke: true,
            weight: 0.5,
        })
    }

    var eqLayer = L.geoJSON(data, {
        pointToLayer: createMarker,
        onEachFeature(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><h4>" + "Magnitude: " + feature.properties.mag + "</h4>" +
                "</h4><hr><h4>" + "Depth: " + feature.geometry.coordinates[2] + " km" + "</h4>")
        }
    });

    createMap(eqLayer);

    function createMap(earthquakes) {
        var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });

        var baseMaps = {
            "Street Map": street,
            "Topographic Map": topo
        };

        var overlayMaps = {
            Earthquakes: earthquakes
        };

        var myMap = L.map("map", {
            center: [45.547, -99.454],
            zoom: 4,
            layers: [street, earthquakes]
        });

        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);
    
        // // Set up the legend.
        var legend = L.control({ position: 'bottomright' });
        legend.onAdd = function () {
            var div = L.DomUtil.create('div', 'info legend');
            var depths = [-10, 10, 30, 50, 70, 90];
            // labels =['<strong> Depth (km) </strong><br>'] // don't like how the legend title looks

            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < depths.length; i++) {
                // labels.push(
                div.innerHTML +=
                    '<i style="background:' + setColor(depths[i] + 1) + '"></i> ' +
                    depths[i] + (depths[i + 1] ?'&ndash;' + depths[i + 1] + '<br>':'+');
            }
            // div.innerHTML = labels.join('<br>');
            return div;
        };
        legend.addTo(myMap);
}
});