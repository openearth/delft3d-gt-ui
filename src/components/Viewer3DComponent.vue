<template id="template-viewer-threedee">
<div id="viewer-3d" class="panel-body viewer-3d">
  <div class="btn-group btn-group-justified" v-if="!started || !isFinished">
    <div class="btn-group" role="group">
      <button type="button" class="btn btn-outline-secondary btn-spaced-right" :class="{'disabled': !isFinished }" @click="start3dviewer">
        <span class="btn-label"><i class="fa fa-fw fa-play" aria-hidden="true"></i></span> Start 3D Viewer <span v-if="!isFinished">(please wait for simulation to finish)</span>
      </button>
    </div>
  </div>

  <div class="row" v-if="started && isFinished">
    <div class="col-sm-10 text-center">
      <h4>Sediment Fraction</h4>
    </div>
  </div>

  <div class="row" v-if="started && isFinished">
    <div id="col-glcanvas-container" class="col-xs-10" :style="canvasStyle">
      <div id="glcanvas-container" class="glcanvas-container text-center" :style="canvasStyle" v-show="started && isFinished">
        <canvas id="glcanvas" class="glcanvas">Your browser doesn't appear to support the <code>&lt;canvas&gt;</code> element.</canvas>
      </div>
    </div>
    <div class="col-xs-2">
      <div id="svg-container" class="svg-container" v-show="started && isFinished">
        <svg :style="svgStyle" width="100" :height="height">

          <line x1="0" y1="1" x2="20" y2="1" style="stroke:#999;stroke-width:3" />
          <line x1="0" :y1="height - 1" x2="20" :y2="height - 1" style="stroke:#999;stroke-width:3" />
          <text x="24" :y="18" fill="#999" style="font-size: 1.5em;">1</text>
          <text x="20" :y="height - 6" fill="#999" style="font-size: 1.5em;">0</text>

          <div v-for="(x, index) in 9" :key="index">
            <line x1="0" x2="10" :y1="(x + 1) / 10 * height" :y2="(x + 1) / 10 * height" style="stroke:#999;stroke-width:2" />
            <text x="13" :y="((x + 1) / 10 * height) + 5" fill="#999">0.{{9 - x}}</text>
          </div>

          <div v-for="(x, index) in 10" :key="index">
            <line x1="0" x2="5" :y1="(x + 0.5)  / 10 * height" :y2="(x + 0.5)  / 10 * height" style="stroke:#aaa;stroke-width:2" />
          </div>

        </svg>
      </div>
      <div id="legend-container" class="legend-container text-center" v-show="started && isFinished">
        <div clas="legend" :style="gradientStyle"></div>
      </div>
    </div>
  </div>

  <div class="text-center" v-if="started && isFinished">

    <div class="control-buttons">
      <div class="btn-group mb-2" role="group">
        <button type="button" class="btn btn-outline-secondary btn-spaced-right" @click="camera('reset')">Reset</button>
        <button type="button" class="btn btn-outline-secondary btn-spaced-right" @click="camera('fit')">Fit</button>
      </div>

      <div class="btn-group mx-2 mb-2" role="group">
        <button type="button" class="btn btn-outline-secondary btn-spaced-right" @click="camera('left')">South</button>
        <button type="button" class="btn btn-outline-secondary btn-spaced-right" @click="camera('back')">West</button>
        <button type="button" class="btn btn-outline-secondary btn-spaced-right" @click="camera('right')">North</button>
        <button type="button" class="btn btn-outline-secondary btn-spaced-right" @click="camera('front')">East</button>
      </div>

      <div class="btn-group mb-2" role="group">
        <button type="button" class="btn btn-outline-secondary btn-spaced-right" @click="camera('top')">Top</button>
        <button type="button" class="btn btn-outline-secondary btn-spaced-right" @click="camera('bottom')">Bottom</button>
      </div>

      <div class="btn-group">
        <button type="button" class="btn btn-primary" @click="goStart">
          <span class="fa fa-fast-backward"></span>
        </button>
        <button type="button" class="btn btn-primary" @click="goPrev">
          <span class="fa fa-backward"></span>
        </button>
        <button type="button" class="btn btn-primary">
          {{ curTimeStep + 1 }}
        </button>
        <button type="button" class="btn btn-primary" @click="goNext">
          <span class="fa fa-forward"></span>
        </button>
        <button type="button" class="btn btn-primary" @click="goEnd">
          <span class="fa fa-fast-forward"></span>
        </button>
      </div>
    </div>

    <div class="col-sm-12">
      <ul class="nav nav-tabs nav-fill">
        <div v-for="(name, index) in ['slices', 'colors']" :key="name">
          <li role="presentation" class="nav-item" :class="{'active': tab === name}" @click.stop="setTab(name)">
            <a class="nav-link" href="#">{{ name }}</a></li>
        </div>
      </ul>
    </div>

    <div class="tab-content">
      <div role="tabpanel" class="tab-pane" :class="{'active': tab === 'slices'}">
        <div class="form-horizontal">
          <div class=form-group>
            <label for="slice-x-w" class="col-lg-3 control-label slider-label">slice X</label>
            <div class="col-lg-7">
              <input type="text" class="ion-range slice-x-w" id="slice-x-w" data-step="1" data-min="1" :data-max="dimensions.x" data-type="double" value="1,100" />
            </div>
          </div>
          <div class=form-group>
            <label for="slice-y-w" class="col-lg-3 control-label slider-label">slice Y</label>
            <div class="col-lg-7">
              <input type="text" class="ion-range slice-y-w" id="slice-y-w" data-step="1" data-min="1" :data-max="dimensions.y" data-type="double" value="1,100" />
            </div>
          </div>
          <div class=form-group>
            <label for="slice-z-w" class="col-lg-3 control-label slider-label">slice Z</label>
            <div class="col-lg-7">
              <input type="text" class="ion-range slice-z-w" id="slice-z-w" data-step="1" data-min="1" :data-max="dimensions.z" data-type="double" value="1,100" />
            </div>
          </div>
        </div>
      </div>

      <div role="tabpanel" class="tab-pane" :class="{'active': tab === 'colors'}">
        <div class="form-horizontal">
          <div class=input-group v-for="(point, index) in gradient" :key="index">
            <div class="input-group-prepend">
              <span class="input-group-text" id="basic-addon1">#</span>
            </div>
            <input class="form-control text-center" type="text" name="gradient-position" v-model="point.position" lazy>
            <div class="input-group-append">
              <button type="button" class="btn" @click="removePoint($index)" v-if="$index < gradient.length - 1">x</button>
            </div>
          </div>
          <div class="input-group">
            <div class="col-sm-offset-3 col-sm-6">
              <button type="button" class="btn btn-block" @click="addPoint()">add color</button>
            </div>
          </div>
        </div>
      </div>
    </div> <!-- tab-content -->

  </div>
</div>
</template>

<script>
import _ from 'lodash'
import $ from 'jquery'
import store from '../store'
import ionRangeSlider from 'ion-rangeslider'
export default {
  store,
  template: '#template-viewer-threedee',
  props: {
    activated: {
      type: Boolean,
      default () {
        return false
      }
    },
    model: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data: function() {
    return {
      'canvasStyle': {
        'height': '10px'
      },
      'curFrameLength': 0,
      'curSedimentClass': undefined,
      'curSuid': undefined,
      'curTimeStep': 0,
      'dataSetVariables': {
        'bedLevelVariable': 'DPS',
        'dataVariable': 'MSED',
        'displacementVariable': 'DP_BEDLYR'
      },
      'dimensions': {
        'x': 10,
        'y': 10,
        'z': 10,
        't': 10,
        'segments': 10
      },
      'gradient': [{
          'color': '542437',
          'position': 1.0
        },
        {
          'color': 'd95b43',
          'position': 0.5
        },
        {
          'color': 'ecd078',
          'position': 0.2
        },
        {
          'color': 'c02942',
          'position': 0.1
        },
        {
          'color': '53777a',
          'position': 0.0
        }
      ],
      'gradientStyle': {
        'background': '#fff',
        'height': '100%'
      },
      'height': 0,
      'sharedState': store.state,
      'started': false,
      'slices': {
        'x': {
          'from': 1,
          'to': 1
        },
        'y': {
          'from': 1,
          'to': 1
        },
        'z': {
          'from': 1,
          'to': 1
        }
      },
      'svgStyle': {
        'height': '100%'
      },
      'tab': 'slices',
      'viewer3d': undefined,
      'width': 0
    }
  },
  computed: {
    activeModel: {
      cached: false,
      get: function() {
        return this.sharedState.activeModelContainer
      }
    },
    isFinished: {
      cache: false,
      get: function() {
        return _.get(this.activeModel, 'data.state', '') === 'Finished'
      }
    }
  },
  watch: {
    activated: function() {
      this.loadData()
    },
    activeModel: {
      'deep': true,
      'handler': function() {
        let suid = _.get(this.activeModel, 'data.suid')
        let sedimentClass = _.get(this.activeModel, 'data.parameters.composition.value')
        let maxTimeStepIndex = _.get(this.activeModel, 'data.info.delta_fringe_images.images', []).length - 1 // obtain max TimeStep index based on number of Delta Fringe images

        if (suid !== this.curSuid && maxTimeStepIndex !== -1 && sedimentClass !== undefined) {
          this.curSuid = suid
          this.curFrameLength = this.curTimeStep = maxTimeStepIndex // if the model is not finished, do not show final maxTimeStepIndex (as it will not render)
          this.curSedimentClass = sedimentClass
          this.startOrLoad3dViewer()
        }

        this.initPickAColor()
        this.initIonSliders()
      }
    },
    dataSetVariables: {
      'deep': true,
      'handler': function() {
        this.loadData()
      }
    },
    curTimeStep: {
      'deep': false,
      'handler': function() {
        this.loadTime()
      }
    },
    dimensions: {
      'deep': true,
      'handler': function() {
        this.resetSliders()
      }
    },
    gradient: {
      'deep': true,
      'handler': function() {
        let newGrad = _.reverse(_.sortBy(_.clone(this.gradient), 'position'))

        // cap position values
        _.each(newGrad, (p) => {
          p.position = Math.max(Math.min(p.position, 1), 0)
        })

        if (_.isEqual(this.gradient, newGrad)) {
          this.loadGradient()
        } else {
          this.gradient = newGrad
        }
      }
    },
    slices: {
      'deep': true,
      'handler': function() {
        this.loadSliders()
      }
    }
  },
  ready: function() {
    // get reference element from model-details
    let width = document.getElementById('col-glcanvas-container-reference').scrollWidth

    this.width = width
    this.height = Math.floor(width / 1.6) // golden ratio
    this.canvasStyle.height = this.height + 'px'
    this.gradientStyle.height = this.height + 'px'
    this.svgStyle.height = this.height + 'px'
  },
  methods: {
    addPoint: function() {
      this.gradient.push(_.clone(_.last(this.gradient)))
      this.initPickAColor()
    },
    camera: function(side) {
      if (_.isUndefined(this.viewer3d)) {
        return
      }

      if (side === 'back') {
        this.viewer3d.camera.alignToSide(this.viewer3d.side.BACK, true)
      }
      if (side === 'bottom') {
        this.viewer3d.camera.alignToSide(this.viewer3d.side.BOTTOM, true)
      }
      if (side === 'down') {
        this.viewer3d.camera.stepDown()
      }
      if (side === 'fit') {
        this.viewer3d.camera.fit()
      }
      if (side === 'front') {
        this.viewer3d.camera.alignToSide(this.viewer3d.side.FRONT, true)
      }
      if (side === 'left') {
        this.viewer3d.camera.alignToSide(this.viewer3d.side.LEFT, true)
      }
      if (side === 'reset') {
        this.resetViewer()
      }
      if (side === 'right') {
        this.viewer3d.camera.alignToSide(this.viewer3d.side.RIGHT, true)
      }
      if (side === 'top') {
        this.viewer3d.camera.alignToSide(this.viewer3d.side.TOP, true)
      }
      if (side === 'up') {
        this.viewer3d.camera.stepUp()
      }
    },
    goEnd: function() {
      this.curTimeStep = this.curFrameLength
    },
    goNext: function() {
      this.curTimeStep = Math.min(this.curTimeStep + 1, this.curFrameLength)
    },
    goPrev: function() {
      this.curTimeStep = Math.max(this.curTimeStep - 1, 0)
    },
    goStart: function() {
      this.curTimeStep = 0
    },
    initIonSliders: function() {
      this.$nextTick(() => {
        /* eslint-disable camelcase */
        if ($('.ion-range').ionRangeSlider !== undefined) {
          _.each(['x', 'y', 'z'], (d) => {
            $('.ion-range.slice-' + d + '-w').ionRangeSlider({
              skin: "round",
              'drag_interval': true,
              'onChange': (data) => {
                _.set(this, ['slices', d, 'from'], data.from)
                _.set(this, ['slices', d, 'to'], data.to)
              }
            })
          })
        }
        /* eslint-enable camelcase */
      })
    },
    initPickAColor: function() {
      this.$nextTick(() => {
        $('.pick-a-color').each((i, e) => {
          if ($(e).parent('.pick-a-color-markup').length === 0) {
            $(e).pickAColor({
              'inlineDropdown': true
            })
          }
        })
      })
    },
    loadData: function() {
      if (!this.activated || _.isUndefined(this.viewer3d)) {
        return
      }

      try {
        if (this.curSuid !== undefined && this.curSedimentClass !== undefined) {
          this.viewer3d.dataSet.load({
            url: '/thredds/dodsC/files/' + this.curSuid + '/simulation/trim-' + this.curSedimentClass + '.nc',
            displacementVariable: this.dataSetVariables.displacement,
            dataVariable: this.dataSetVariables.data,
            bedLevelVariable: this.dataSetVariables.bedLevel
          }, () => {
            this.dimensions = this.viewer3d.volume.getDimensions()
            this.loadGradient()
            this.loadTime()
            this.resetViewer()
          })
        }
      } catch (err) {
        console.error(err)
      }
    },
    loadGradient: function() {
      if (_.isUndefined(this.viewer3d)) {
        return
      }

      let colors = _.reverse(_.map(this.gradient, (c) => {
        return '#' + c.color
      }))
      let positions = _.reverse(_.map(this.gradient, 'position'))

      // check if all colors are according to color format
      let colorsOk = _.every(colors, function(c) {
        return /^#[0-9a-fA-F]{6}$/.test(c)
      })

      if (!colorsOk && colors.length === positions.length) {
        return
      }

      let posColors = _.reverse(_.map(colors, (c, i) => {
        return c + ' ' + Math.floor((1 - positions[i]) * 100) + '%'
      }))

      if (colors.length > 1) {
        this.gradientStyle.background = 'linear-gradient(' + _.join(posColors, ',') + ')'
      }
      if (colors.length === 1) {
        this.gradientStyle.background = colors[0]
      }
      if (colors.length === 0) {
        this.gradientStyle.background = '#000000'
      }

      this.viewer3d.colorMap.setColorMap(
        colors,
        positions
      )
      this.refreshData()
    },
    loadSliders: function() {
      if (_.isUndefined(this.viewer3d)) {
        return
      }

      this.viewer3d.volume.setSlicePosition(this.viewer3d.side.LEFT, this.slices.x.from - 1)
      this.viewer3d.volume.setSlicePosition(this.viewer3d.side.RIGHT, this.slices.x.to - 2)

      this.viewer3d.volume.setSlicePosition(this.viewer3d.side.BACK, this.slices.y.to - 1)
      this.viewer3d.volume.setSlicePosition(this.viewer3d.side.FRONT, this.slices.y.from - 1)

      this.viewer3d.volume.setSlicePosition(this.viewer3d.side.TOP, this.slices.z.from - 1)
      this.viewer3d.volume.setSlicePosition(this.viewer3d.side.BOTTOM, this.slices.z.to - 1)

      this.refreshData()
    },
    loadTime: function() {
      if (_.isUndefined(this.viewer3d)) {
        return
      }

      this.viewer3d.volume.setTimeStep(this.curTimeStep)

      this.refreshData()
    },
    refreshData: _.debounce(function() {
      if (_.isUndefined(this.viewer3d)) {
        return
      }

      this.viewer3d.volume.refreshData()
    }, 500),
    removePoint: function(index) {
      this.gradient.splice(index, 1)
    },
    resetSliders: function() {
      _.each(['x', 'y', 'z'], (d) => {
        let val = _.get(this.dimensions, d)

        // don't show dummy values on max X
        if (d === 'x') {
          val--
        }

        _.set(this.slices, [d, 'from'], 1)
        _.set(this.slices, [d, 'to'], val)

        let ionRangeFinderData = $('.ion-range.slice-' + d + '-w').data('ionRangeSlider')

        if (ionRangeFinderData !== undefined) {
          ionRangeFinderData.update({
            'min': 1,
            'max': val,
            'from': 1,
            'to': val
          })
        }
      })
    },
    resetViewer: function() {
      if (_.isUndefined(this.viewer3d)) {
        return
      }

      this.resetSliders()
      this.loadSliders()
      this.refreshData()

      this.viewer3d.camera.rotateToTopRightCorner(true)
      this.viewer3d.camera.fit()
    },
    setTab (tab) {
      this.tab = tab
    },
    start3dviewer () {
      if (this.started || !this.isFinished) {
        return
      }
      this.started = true
      console.log(window)
      /* eslint-disable */
      this.viewer3d = new window.Viewer3D.viewer3D()
      /* eslint-enable */

      this.loadData()
    },
    startOrLoad3dViewer: function() {
      if (this.curSuid !== undefined) {
        if (!this.started) {
          this.start3dviewer()
        } else {
          this.loadData()
        }
      }
    }
  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';

.irs--round .irs-handle {
  width: 10px;
  height: 10px;
  margin: 6px;
  margin-left: 0px;
  border: 0;
}

.irs--round .irs-to, .irs--round .irs-from, .irs--round .irs-bar {
  background-color: #adb5bd;
}

.irs--round .irs-to:before, .irs--round .irs-from:before {
  border-top-color:  #adb5bd;
}
</style>
