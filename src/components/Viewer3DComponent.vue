<template id="template-viewer-threedee">
  <div>
    <div
      id="viewer-3d"
      ref="viewer3d"
      class="panel-body viewer-3d"
      v-show="hasFrames"
    >
      <div class="btn-group btn-group-justified" v-if="!started || !isFinished">
        <div class="btn-group" role="group">
          <button
            type="button"
            class="btn btn-outline-secondary btn-spaced-right"
            :class="{ disabled: !isFinished }"
            @click="start3dviewer"
          >
            <span class="btn-label"
              ><i class="fa fa-fw fa-play" aria-hidden="true"></i
            ></span>
            Start 3D Viewer
            <span v-if="!isFinished"
              >(please wait for simulation to finish)</span
            >
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
          <div
            id="glcanvas-container"
            class="glcanvas-container text-center"
            :style="canvasStyle"
            v-show="started && isFinished"
          >
            <canvas id="glcanvas" class="glcanvas"
              >Your browser doesn't appear to support the
              <code>&lt;canvas&gt;</code> element.</canvas
            >
          </div>
        </div>
        <div class="col-xs-2">
          <div
            id="svg-container"
            class="svg-container"
            v-show="started && isFinished"
          >
            <svg :style="svgStyle" width="100" :height="height">
              <line
                x1="30"
                y1="1"
                x2="40"
                y2="1"
                style="stroke:#999;stroke-width:3"
              />
              <line
                x1="30"
                :y1="height - 1"
                x2="40"
                :y2="height - 1"
                style="stroke:#999;stroke-width:3"
              />
              <text x="41" :y="18" fill="#999" style="font-size: 1.5em;">
                1
              </text>
              <text
                x="41"
                :y="height - 6"
                fill="#999"
                style="font-size: 1.5em;"
              >
                0
              </text>

              <template v-for="x in 9">
                <line
                  :key="`line-${x}`"
                  x1="30"
                  x2="40"
                  :y1="(x / 10) * height"
                  :y2="(x / 10) * height"
                  style="stroke:#999;stroke-width:2"
                />
                <text
                  :key="`text-${x}`"
                  x="41"
                  :y="(x / 10) * height + 5"
                  fill="#999"
                >
                  0.{{ 10 - x }}
                </text>
              </template>

              <template v-for="x in 10">
                <line
                  :key="`index-${x}`"
                  x1="30"
                  x2="35"
                  :y1="((x - 0.5) / 10) * height"
                  :y2="((x - 0.5) / 10) * height"
                  style="stroke:#aaa;stroke-width:2"
                />
              </template>
            </svg>
          </div>
          <div
            id="legend-container"
            class="legend-container text-center"
            v-show="started && isFinished"
          >
            <div clas="legend" :style="gradientStyle"></div>
          </div>
        </div>
      </div>
      <div class="text-center" v-if="started && isFinished">
        <div class="control-buttons">
          <div>
            <div class="btn-group mb-2" role="group">
              <button
                type="button"
                class="btn btn-outline-secondary btn-spaced-right"
                @click="camera('reset')"
              >
                Reset
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary btn-spaced-right"
                @click="camera('fit')"
              >
                Fit
              </button>
            </div>

            <div class="btn-group mx-2 mb-2" role="group">
              <button
                type="button"
                class="btn btn-outline-secondary btn-spaced-right"
                @click="camera('left')"
              >
                South
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary btn-spaced-right"
                @click="camera('back')"
              >
                West
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary btn-spaced-right"
                @click="camera('right')"
              >
                North
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary btn-spaced-right"
                @click="camera('front')"
              >
                East
              </button>
            </div>

            <div class="btn-group mb-2" role="group">
              <button
                type="button"
                class="btn btn-outline-secondary btn-spaced-right"
                @click="camera('top')"
              >
                Top
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary btn-spaced-right"
                @click="camera('bottom')"
              >
                Bottom
              </button>
            </div>
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
            <div v-for="name in ['slices', 'colors']" :key="name">
              <li
                role="presentation"
                class="nav-item"
                :class="{ active: tab === name }"
                @click.stop="setTab(name)"
              >
                <a
                  class="nav-link"
                  href="#"
                  :class="{ active: tab === name }"
                  >{{ name }}</a
                >
              </li>
            </div>
          </ul>
        </div>

        <div class="tab-content">
          <div
            role="tabpanel"
            class="tab-pane"
            :class="{ active: tab === 'slices' }"
          >
            <div class="form-horizontal">
              <div class="form-group">
                <label
                  for="slice-x-w"
                  class="col-lg-3 control-label slider-label"
                  >slice X</label
                >
                <div class="col">
                  <input
                    type="text"
                    class="ion-range slice-x-w"
                    id="slice-x-w"
                    data-step="1"
                    data-min="1"
                    :data-max="dimensions.x"
                    data-type="double"
                    value="1,100"
                  />
                </div>
              </div>
              <div class="form-group">
                <label
                  for="slice-y-w"
                  class="col-lg-3 control-label slider-label"
                  >slice Y</label
                >
                <div class="col">
                  <input
                    type="text"
                    class="ion-range slice-y-w"
                    id="slice-y-w"
                    data-step="1"
                    data-min="1"
                    :data-max="dimensions.y"
                    data-type="double"
                    value="1,100"
                  />
                </div>
              </div>
              <div class="form-group">
                <label
                  for="slice-z-w"
                  class="col-lg-3 control-label slider-label"
                  >slice Z</label
                >
                <div class="col">
                  <input
                    type="text"
                    class="ion-range slice-z-w"
                    id="slice-z-w"
                    data-step="1"
                    data-min="1"
                    :data-max="dimensions.z"
                    data-type="double"
                    value="1,100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            role="tabpanel"
            class="tab-pane"
            :class="{ active: tab === 'colors' }"
          >
            <form class="mt-2">
              <div class="row" v-for="(point, index) in gradient" :key="index">
                <div
                  class="col-sm-8 col-sm-offset-3 input-group pick-a-color"
                  ref="colorpicker"
                >
                  <div class="input-group-prepend">
                    <span class="input-group-text" id="basic-addon1">#</span>
                  </div>
                  <input
                    class="form-control text-center"
                    type="text"
                    name="gradient-color"
                    v-model="point.color"
                  />
                  <span class="input-group-append">
                    <span class="input-group-text colorpicker-input-addon"
                      ><i></i
                    ></span>
                  </span>
                </div>
                <div class="col-sm-2">
                  <input
                    class="form-control text-center"
                    type="text"
                    name="gradient-position"
                    v-model="point.position"
                    lazy
                  />
                </div>
                <div class="col-sm-2">
                  <button
                    type="button"
                    class="btn btn-outline-secondary button-empty-input-field"
                    @click="removePoint(index)"
                    v-if="index < gradient.length - 1"
                  >
                    x
                  </button>
                </div>
              </div>
              <div class="input-group m-3">
                <button
                  type="button"
                  class="btn btn-block btn-outline-secondary"
                  @click="addPoint()"
                >
                  add color
                </button>
              </div>
            </form>
          </div>
        </div>
        <!-- tab-content -->
      </div>
    </div>
    <div v-show="!hasFrames">
      No data available
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import $ from 'jquery'
import store from '../store'

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
  data () {
    return {
      canvasStyle: {
        height: '10px',
        width: '100%'
      },
      curFrameLength: 0,
      curSedimentClass: undefined,
      curSuid: undefined,
      curTimeStep: 0,
      dataSetVariables: {
        bedLevelVariable: 'DPS',
        dataVariable: 'MSED',
        displacementVariable: 'DP_BEDLYR'
      },
      dimensions: { x: 10, y: 10, z: 10, t: 10, segments: 10 },
      gradient: [
        { color: '542437', position: 1.0 },
        { color: 'd95b43', position: 0.5 },
        { color: 'ecd078', position: 0.2 },
        { color: 'c02942', position: 0.1 },
        { color: '53777a', position: 0.0 }
      ],
      gradientStyle: {
        background: '#fff',
        height: '100%'
      },
      height: 400,
      sharedState: store.state,
      started: false,
      slices: {
        x: { from: 1, to: 1 },
        y: { from: 1, to: 1 },
        z: { from: 1, to: 1 }
      },
      svgStyle: {
        height: '100%'
      },
      tab: 'slices',
      viewer3d: undefined,
      width: '100%',
      hasFrames: false
    }
  },
  computed: {
    activeModel: {
      cached: false,
      get () {
        return this.sharedState.activeModelContainer
      }
    },
    isFinished: {
      cache: false,
      get () {
        return _.get(this.activeModel, 'data.state', '') === 'Finished'
      }
    }
  },
  watch: {
    activated () {
      this.loadData()
    },
    activeModel: {
      deep: true,
      handler () {
        let suid = _.get(this.activeModel, 'data.suid')
        let sedimentClass = _.get(
          this.activeModel,
          'data.parameters.composition.value'
        )
        let maxTimeStepIndex =
          _.get(this.activeModel, 'data.info.delta_fringe_images.files', [])
            .length - 1 // obtain max TimeStep index based on number of Delta Fringe images
        this.hasFrames = maxTimeStepIndex > 0
        if (
          suid !== this.curSuid &&
          maxTimeStepIndex !== -1 &&
          sedimentClass !== undefined
        ) {
          this.curSuid = suid
          this.curFrameLength = this.curTimeStep = maxTimeStepIndex // if the model is not finished, do not show final maxTimeStepIndex (as it will not render)
          this.curSedimentClass = sedimentClass
          this.startOrLoad3dViewer()
          this.initPickAColor()
        }
        this.initIonSliders()
      }
    },
    dataSetVariables: {
      deep: true,
      handler () {
        this.loadData()
      }
    },
    curTimeStep: {
      deep: false,
      handler () {
        this.loadTime()
      }
    },
    dimensions: {
      deep: true,
      handler () {
        this.resetSliders()
      }
    },
    gradient: {
      deep: true,
      handler () {
        this.loadGradient()
      }
    },
    slices: {
      deep: true,
      handler () {
        this.loadSliders()
      }
    }
  },
  mounted () {
    // Debounce in method is troublesome
    this.refreshData = _.debounce(() => {
      if (!this.viewer3d) {
        return
      }
      this.viewer3d.volume.refreshData()
    }, 500)

    // let width = this.$refs.viewer3d.clientWidth
    // this.width = width
    // this.height = Math.floor(width / 1.6) // golden ratio
    this.canvasStyle.width = this.width + 'px'
    this.canvasStyle.height = this.height + 'px'

    this.gradientStyle.height = this.height + 'px'
    this.gradientStyle.width = '30px'

    this.svgStyle.height = this.height + 'px'
  },
  methods: {
    addPoint () {
      this.gradient.push(_.clone(_.last(this.gradient)))
      this.initPickAColor()
    },
    camera (side) {
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
    goEnd () {
      this.curTimeStep = this.curFrameLength
    },
    goNext () {
      this.curTimeStep = Math.min(this.curTimeStep + 1, this.curFrameLength)
    },
    goPrev () {
      this.curTimeStep = Math.max(this.curTimeStep - 1, 0)
    },
    goStart () {
      this.curTimeStep = 0
    },
    initIonSliders () {
      this.$nextTick(() => {
        /* eslint-disable camelcase */
        if ($('.ion-range').ionRangeSlider !== undefined) {
          _.each(['x', 'y', 'z'], d => {
            $('.ion-range.slice-' + d + '-w').ionRangeSlider({
              skin: 'round',
              drag_interval: true,
              onChange: data => {
                _.set(this, ['slices', d, 'from'], data.from)
                _.set(this, ['slices', d, 'to'], data.to)
              }
            })
          })
        }
        /* eslint-enable camelcase */
      })
    },
    initPickAColor () {
      this.$nextTick(() => {
        $('.pick-a-color').each((i, e) => {
          if ($(e).parent('.pick-a-color-markup').length === 0) {
            if (!typeof $(e).colorpicker === 'function') {
              return
            }
            $(e).colorpicker({
              useHashPrefix: false
            })
            $(e).on('colorpickerChange', event => {
              this.gradient[i].color = event.color.string().split('#')[1]
              this.loadGradient()
            })
          }
        })
      })
    },
    loadData () {
      if (!this.activated || _.isUndefined(this.viewer3d)) {
        return
      }
      const url = `/thredds/dodsC/files//${this.curSuid}/simulation/trim-${
        this.curSedimentClass
      }.nc`

      try {
        if (this.curSuid !== undefined && this.curSedimentClass !== undefined) {
          this.viewer3d.dataSet.load(
            {
              url: url,
              displacementVariable: this.dataSetVariables.displacementVariable,
              dataVariable: this.dataSetVariables.dataVariable,
              bedLevelVariable: this.dataSetVariables.bedLevelVariable
            },
            () => {
              this.dimensions = this.viewer3d.volume.getDimensions()
              this.loadGradient()
              this.loadTime()
              this.resetViewer()
            }
          )
        }
      } catch (err) {
        console.error(err)
      }
    },
    loadGradient () {
      if (_.isUndefined(this.viewer3d)) {
        return
      }
      let colors = _.reverse(
        _.map(this.gradient, c => {
          return '#' + c.color
        })
      )
      let positions = _.reverse(_.map(this.gradient, 'position'))
      // check if all colors are according to color format
      let colorsOk = _.every(colors, c => {
        return /^#[0-9a-fA-F]{6}$/.test(c)
      })
      if (!colorsOk && colors.length === positions.length) {
        return
      }

      let posColors = _.reverse(
        _.map(colors, (c, i) => {
          return c + ' ' + Math.floor((1 - positions[i]) * 100) + '%'
        })
      )
      if (colors.length > 1) {
        this.gradientStyle.background =
          'linear-gradient(' + _.join(posColors, ',') + ')'
      }

      if (colors.length === 1) {
        this.gradientStyle.background = colors[0]
      }
      if (colors.length === 0) {
        this.gradientStyle.background = '#000000'
      }
      this.viewer3d.colorMap.setColorMap(colors, positions)
      this.refreshData()
    },
    loadSliders () {
      if (_.isUndefined(this.viewer3d)) {
        return
      }
      this.viewer3d.volume.setSlicePosition(
        this.viewer3d.side.LEFT,
        this.slices.x.from - 1
      )
      this.viewer3d.volume.setSlicePosition(
        this.viewer3d.side.RIGHT,
        this.slices.x.to - 2
      )
      this.viewer3d.volume.setSlicePosition(
        this.viewer3d.side.BACK,
        this.slices.y.to - 1
      )
      this.viewer3d.volume.setSlicePosition(
        this.viewer3d.side.FRONT,
        this.slices.y.from - 1
      )
      this.viewer3d.volume.setSlicePosition(
        this.viewer3d.side.TOP,
        this.slices.z.from - 1
      )
      this.viewer3d.volume.setSlicePosition(
        this.viewer3d.side.BOTTOM,
        this.slices.z.to - 1
      )
      this.refreshData()
    },
    loadTime () {
      if (_.isUndefined(this.viewer3d)) {
        return
      }
      this.viewer3d.volume.setTimeStep(this.curTimeStep)
      this.refreshData()
    },

    removePoint (index) {
      this.gradient.splice(index, 1)
      this.gradient.forEach((grad, i) => {
        $(this.$refs.colorpicker[i]).colorpicker('setValue', `#${grad.color}`)
      })
    },
    resetSliders () {
      _.each(['x', 'y', 'z'], d => {
        let val = _.get(this.dimensions, d)
        // don't show dummy values on max X
        if (d === 'x') {
          val--
        }
        _.set(this.slices, [d, 'from'], 1)
        _.set(this.slices, [d, 'to'], val)
        let ionRangeFinderData = $('.ion-range.slice-' + d + '-w').data(
          'ionRangeSlider'
        )
        if (ionRangeFinderData !== undefined) {
          ionRangeFinderData.update({
            min: 1,
            max: val,
            from: 1,
            to: val
          })
        }
      })
    },
    resetViewer () {
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
      /* eslint-disable */
      this.viewer3d = new window.Viewer3D.viewer3D()
      /* eslint-enable */
      this.loadData()
    },
    startOrLoad3dViewer () {
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
.irs--round .irs-to,
.irs--round .irs-from,
.irs--round .irs-bar {
  background-color: #adb5bd;
}
.irs--round .irs-to:before,
.irs--round .irs-from:before {
  border-top-color: #adb5bd;
}

// .glcanvas {
//   height: 400px;
//   width: 400px;
// }

.legend-container {
  width: 50px;
}

.legend {
  height: 100%;
  width: 100%;
}

.svg-container {
  float: right;
  display: block;
  width: 70px;
  position: absolute;
}
svg {
  height: 100%;
  width: 100%;
}

.glcanvas {
  height: 100%;
  width: 100%;
}

#col-glcanvas-container {
  width: 80%;
}
</style>
