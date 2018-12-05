/* global Vue, mapboxgl, store*/

var exports = (function () {
  "use strict";

  // The map component
  var MapComponent = Vue.component("map-component", {
    template: "#template-map-component",
    data: function() {
      return {
        map: null,
        popup: null,
        selection: {
          "type": "FeatureCollection",
          "features": []
        }
      };
    },

    watch: {
      $route (to) {
        if (to.name === "scenarios-create") {
          console.log(store.state.bbox);
          this.setbbox(store.state.bbox);
        }
      }
    },

    methods: {
      getbbox() {
        // Get the bounding box of the current map view
        var bounds = this.map.getBounds();

        var bbox = {
          "latmin": bounds.getWest().toFixed(4),
          "lonmin": bounds.getSouth().toFixed(4),
          "latmax": bounds.getEast().toFixed(4),
          "lonmax": bounds.getNorth().toFixed(4)
        };

        return bbox;
      },

      setbbox(bbox) {
        this.map.fitBounds([[
            bbox[0],
            bbox[1]
        ], [
            bbox[2],
            bbox[3]
        ]]);
      },

      initialBbox() {
        this.map.setZoom(1);
        this.map.setCenter([0, 0]);
        var bbox = this.getbbox();

        store.setbbox([bbox.latmin, bbox.lonmin, bbox.latmax, bbox.lonmax]);
      },

      setSelection(bbox) {
        var features = this.map.queryRenderedFeatures(bbox).filter(x => (x.layer.id === "locations"));
        var insiderect = features.filter(x => {
          var coords = x.geometry.coordinates;

          if(coords[0] >= bbox.latmin &
            coords[0] <= bbox.latmax &
            coords[1] >= bbox.lonmin &
            coords[1] <= bbox.lonmax) {
            return x;
          }
        });

        this.selection.features = [];
        insiderect.forEach((feature) => {
          var location = feature.geometry.coordinates.slice();

          this.selection.features.push({
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": location
            },
            "properties": feature.properties
          });
        });
      }
    },
    ready() {
      // create a map
      mapboxgl.accessToken = "pk.eyJ1IjoiY2FtdmR2cmllcyIsImEiOiJjajA4NXdpNmswMDB2MzNzMjk4dGM2cnhzIn0.lIwd8N7wf0hx7mq-kjTcbQ";
      this.map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v9",
        center: [0, 0],
        zoom: 1
      });
      this.map.resize();

      // create empty popup
      this.popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      this.map.on("load", () => {
        if(this.$route.path === "/scenarios/create") {
          this.initialBbox();
        } else {
          this.setbbox(store.state.bbox);
        }

        // Add geojson with locations to the map
        this.map.addLayer({
          "id": "locations",
          "type": "circle",
          "source": {
            "type": "geojson",
            "data": "./images/worldpoints.json"
          },
          "paint": {
            "circle-opacity": 0.5,
            "circle-color": "#45afd9",
            "circle-stroke-color": "#000000",
            "circle-stroke-width": 1,
            "circle-radius": 3
          }
        });

        this.map.addLayer({
          "id": "selection",
          "type": "circle",
          "source": {
            "type": "geojson",
            "data": this.selection
          },
          "paint": {
            "circle-opacity": 0,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#00b300"
          }
        });

          // When hovering over a location, show a popup and change the cursor
        this.map.on("mouseenter", "locations", (e) => {
          this.map.getCanvas().style.cursor = "pointer";
          var features = e.features;
          var coords = features[0].geometry.coordinates;
          var title = features[0].properties.title;

          this.popup.setLngLat(coords)
            .setHTML(title.slice(1, -1))
            .addTo(this.map);
        });

        // When done hovering, change the cursor back and remove popup
        this.map.on("mouseleave", "locations", () => {
          this.map.getCanvas().style.cursor = "";
          this.popup.remove();
        });

        this.map.on("moveend", () => {
          var bboxvar = this.getbbox();

          this.setSelection(bboxvar);

          // If less than 10 locations are within view, set bounding box
          if(this.selection.features.length < 10) {
            this.map.getSource("selection").setData(this.selection);
            store.setbbox([bboxvar.latmin, bboxvar.lonmin, bboxvar.latmax, bboxvar.lonmax]);
            store.setbboxvalidation(true);
          }
        });
      });
    }
  });

  return {
    MapComponent: MapComponent
  };
}());

// If we"re in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
