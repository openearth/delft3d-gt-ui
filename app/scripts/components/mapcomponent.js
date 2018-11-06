var exports = (function () {
  var MapComponent = Vue.component('map-component', {
    template: "#template-map-component",
    data: function() {
      return {
        map: null
      }
    },
    ready() {
      mapboxgl.accessToken = 'pk.eyJ1IjoiY2FtdmR2cmllcyIsImEiOiJjajA4NXdpNmswMDB2MzNzMjk4dGM2cnhzIn0.lIwd8N7wf0hx7mq-kjTcbQ';
      this.map = new mapboxgl.Map({
          container: 'map', // container id
          style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
          center: [-74.50, 40], // starting position [lng, lat]
          zoom: 9 // starting zoom
      })
      console.log(this.map)
      this.map.resize()
    }
  })

  console.log(MapComponent)
  return {
    MapComponent: MapComponent
  };
}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  console.log('undefined')
  module.exports = exports;
} else {
  // make global
  console.log('yes')
  _.assign(window, exports);
}
