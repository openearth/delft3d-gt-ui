<template>
  <div id="template-map-component">
  <div id="map">
  </div>
  <div id="map-buttons">
    <button class="btn" v-on:click="initialBbox()">
      <span class="btn-label"><i class="fa fa-fw fa-refresh" aria-hidden="true"></i></span>
        Reset map settings
    </button>
    <button class="btn" v-if="!fixate" v-on:click="fixate = true">
      <span class="btn-label"><i class="fa fa-fw fa-lock" aria-hidden="true" ></i></span>
        Lock bounding box
    </button>
    <button class="btn" v-if="fixate" v-on:click="fixate = false">
      <span class="btn-label"><i class="fa fa-fw fa-unlock-alt" aria-hidden="true" ></i></span>
        Unlock bounding box
    </button>
  </div>
</div>
</template>

<script>
import store from '../store'
import mapboxgl from 'mapbox-gl'

export default {
  store,
  template: '#template-map-component',
  data: function () {
    return {
      map: null,
      popup: null,
      selection: {
        type: 'FeatureCollection',
        features: []
      },
      fixate: false
    }
  },

  watch: {
    $route (to) {
      if (to.name === 'scenarios-create') {
        this.dispatch('setbbox', store.state.bbox)
        this.fixate = false
      }
    }
  },

  methods: {
    getbbox () {
      // Get the bounding box of the current map view
      const bounds = this.map.getBounds()

      const bbox = {
        latmin: bounds.getWest().toFixed(4),
        lonmin: bounds.getSouth().toFixed(4),
        latmax: bounds.getEast().toFixed(4),
        lonmax: bounds.getNorth().toFixed(4)
      }

      return bbox
    },

    setbbox (bbox) {
      this.map.fitBounds([[
        bbox[0],
        bbox[1]
      ], [
        bbox[2],
        bbox[3]
      ]])
    },

    setMapBbox () {
      const bbox = store.state.bbox

      this.map.getSource('boundingbox').setData({
        type: 'LineString',
        coordinates: [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[1]],
          [bbox[2], bbox[3]],
          [bbox[0], bbox[3]],
          [bbox[0], bbox[1]]
        ]
      })
    },
    initialBbox () {
      this.map.setZoom(1)
      this.map.setCenter([0, 0])
      const bbox = this.getbbox()

      this.$parent.validbbox = false
      store.dispatch('setbbox', [bbox.latmin, bbox.lonmin, bbox.latmax, bbox.lonmax])
      if (this.map.getSource('boundingbox') !== undefined) {
        this.map.getSource('boundingbox').setData({
          type: 'LineString',
          coordinates: []
        }
        )
      }
      if (this.map.getSource('selection') !== undefined) {
        this.map.getSource('selection').setData({
          type: 'LineString',
          coordinates: []
        }
        )
      }
      this.fixate = false
    },

    setSelection (bbox) {
      const features = this.map.queryRenderedFeatures(bbox).filter(x => (x.layer.id === 'locations'))
      const insiderect = features.filter(x => {
        const coords = x.geometry.coordinates

        if (coords[0] >= bbox.latmin &
            coords[0] <= bbox.latmax &
            coords[1] >= bbox.lonmin &
            coords[1] <= bbox.lonmax) {
          return x
        }
      })

      this.selection.features = []
      insiderect.forEach((feature) => {
        const location = feature.geometry.coordinates.slice()

        this.selection.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: location
          },
          properties: feature.properties
        })
      })
    }
  },
  mounted () {
    // create a map
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2FtdmR2cmllcyIsImEiOiJjajA4NXdpNmswMDB2MzNzMjk4dGM2cnhzIn0.lIwd8N7wf0hx7mq-kjTcbQ'
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v9',
      center: [0, 0],
      zoom: 1
    })
    this.map.resize()
    this.map.addControl(new mapboxgl.NavigationControl())

    // create empty popup
    this.popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    })

    this.map.on('load', () => {
      if (this.$route.path === '/scenarios/create') {
        this.initialBbox()
      } else {
        this.dispatche('setbbox', store.state.bbox)
      }

      // Add geojson with locations to the map
      this.map.addLayer({
        id: 'locations',
        type: 'circle',
        source: {
          type: 'geojson',
          data: './worldpoints.json'
        },
        paint: {
          'circle-opacity': 0.5,
          'circle-color': '#009AEB',
          'circle-stroke-color': '#000000',
          'circle-stroke-width': 1,
          'circle-radius': 3
        }
      })

      this.map.addLayer({
        id: 'selection',
        type: 'circle',
        source: {
          type: 'geojson',
          data: this.selection
        },
        paint: {
          'circle-opacity': 0,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#00b300'
        }
      })

      this.map.addLayer({
        id: 'boundingbox',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'LineString',
            coordinates: []
          }
        },
        paint: {
        }
      })

      // When hovering over a location, show a popup and change the cursor
      this.map.on('mouseenter', 'locations', (e) => {
        this.map.getCanvas().style.cursor = 'pointer'
        const features = e.features
        const coords = features[0].geometry.coordinates
        const title = features[0].properties.title

        this.popup.setLngLat(coords)
          .setHTML(title.slice(1, -1))
          .addTo(this.map)
      })

      // When done hovering, change the cursor back and remove popup
      this.map.on('mouseleave', 'locations', () => {
        this.map.getCanvas().style.cursor = ''
        this.popup.remove()
      })

      this.map.on('moveend', () => {
        const bboxvar = this.getbbox()

        this.setSelection(bboxvar)

        // If less than X locations are within view, set bounding box
        if (this.selection.features.length < 200 && this.fixate === false) {
          this.map.getSource('selection').setData(this.selection)
          store.dispatch('setbbox', [bboxvar.latmin, bboxvar.lonmin, bboxvar.latmax, bboxvar.lonmax])
          store.dispatch('setbboxvalidation', true)
          this.setMapBbox()
        }
      })
    })
  }
}

</script>

<style lang="scss">
@import '../assets/variables.scss';
@import '~mapbox-gl/dist/mapbox-gl.css';

#map {
  width: 100%;
  height: 50vh;
  left: 0;
}

.mapboxgl-canvas-container.mapboxgl-touch-zoom-rotate.mapboxgl-touch-drag-pan, .mapboxgl-canvas-container.mapboxgl-touch-zoom-rotate.mapboxgl-touch-drag-pan .mapboxgl-canvas {
  position: absolute;
}

.btn-group-vertical {
  position: absolute;
  z-index: 1;
  top: 10px;
  right: 10px;
}

#map-buttons {
  padding-top: $padding
}

</style>
