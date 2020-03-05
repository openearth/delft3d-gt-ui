<template>
  <div id="template-image-animation">
  <div class="image-animation">

    <div class="row">
      <div class="col-sm-12" >
        <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li
            v-for="image in images"
            :key="image.key"
            class="nav-item"
            :class="{'active': currentAnimationKey === image.key}"
            @click="switchAnimation(image.key)">
            <a class="nav-link" :id="`${image.key}-tab`" data-toggle="tab" href="#" role="tab" :aria-controls="`${image.key}`" :aria-selected="currentAnimationKey === image.key">{{image.name}}</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="row">
      <div class="col-sm-12">
        <div class="text-center"  v-if="hasFrames == false">
          <div class="alert alert-info" role="alert">No images available yet.</div>
        </div>

        <div v-if="hasFrames == true">
          <div class="text-center">
            <img :src="animationFrame" class="animation-frame"/>
          </div>

          <div class="col-sm-12 text-center" >
            <div class="btn-group">

              <button type="button" class="btn btn-primary" v-on:click="gotoFirstFrame()">
                <span class="fa fa-fast-backward">
                </span>
              </button>

              <button type="button" class="btn btn-primary" v-on:click="previousImageFrame('channel_network_images')">
                <span class="fa fa-backward">
                </span>
              </button>
              <button type="button" class="btn btn-primary" v-if="isAnimating" v-on:click="stopImageFrame('channel_network_images')">
                <span class="fa fa-stop">
                </span>
              </button>
              <button class="btn btn-primary" v-if="isAnimating == false" v-on:click="playImageFrame('channel_network_images')">
                <span class="fa fa-play">
                </span>
              </button>
              <button type="button" class="btn btn-primary" v-on:click="nextImageFrame('channel_network_images')">
                <span class="fa fa-forward">
                </span>
              </button>
              <button type="button" class="btn btn-primary" v-on:click="gotoLastFrame()">
                <span class="fa fa-fast-forward">
                </span>
              </button>
            </div>
          </div>

          <div class="col-sm-12 text-center" >
            <div class="btn-group">
              <div class="animframeindicator">
                Frame {{animationIndex+1}} of {{frameCount}}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div v-if="currentAnimationKey === 'channel_network_images'">
            <h3>Channel network</h3>
            <p>
              These graphs display the properties, the architecture and the evolution of the channel network. Fluvial deposits are targets for hydrocarbon and groundwater exploration as they are typically permeable and continuous, and consequently a potential reservoir or aquifer.
            </p>
            <p>
              The size and the quality of a fluvial reservoir in a delta depends on the size of the network, the connection between the different branches, and the relation of the channel network with the substrate, the mouth bars, and the prodelta. Therefore, a good characterization of the properties and the architecture of the channel network allows a better estimation of the reservoir properties in the subsurface. The most important parameters of the channel network are extracted and processed from the Delft3D output.
            </p>
          </div>

          <div v-if="currentAnimationKey === 'delta_fringe_images'">
            <h3>Delta fringe</h3>

            <p>
              This graph shows the position of the delta plain fringe superimposed on the graph of the water depth. This is an indicator for the large-scale plan-view morphology of a delta, which is a function of the dominant forcing processes (waves, rivers, tides) and grain size of transported sediments.<br />
            </p>

            <p>
              A good characterization of the plan-view morphology of the delta allows better predictions on grain size distribution and heterogeneity in the delta geo-body. The delta fringe is calculated based on a cutoff value of water depth and on local slope.
            </p>
          </div>

          <div v-if="currentAnimationKey === 'sediment_fraction_images'">
            <h3>Sediment fraction</h3>

            <p>
              In this cross-shore section the sand fraction of the accumulated sediments and the stratigraphic build-up of the delta are displayed. These are direct outputs from Delft3D. Thanks to these image it is possible to describe the grain size trends (proximal to distal in this case) and the geometry of sediment bodies within the delta, such as shoreface sand wedges and clay drapes. These are are important factors controlling the size and the heterogeneity of a reservoir.
            </p>
          </div>

          <div v-if="currentAnimationKey === 'subenvironment_images'">
            <h3>Sub-environment</h3>

            <div class="text-center">
              <img class="description-image" src="../assets/images/ui/sub_environment_definition.png" alt="Subenvironment definition" />
              <dl class="dl">
                <dt>Delta top</dt><dd>Deposits above delta brink point</dd>
                <dt>Delta front</dt><dd>Deposits below delta brink point and above wave base</dd>
                <dt>Prodelta</dt><dd>Deposits below wave base</dd>
                <dt>Background</dt><dd>Deposition smaller than 5mm</dd>
              </dl>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</div>
</template>

<script>
import _ from 'lodash'

export default {
  // The image animation component
  template: '#template-image-animation',
  props: {
    model: {
      type: Object,
      default () {
        return { }
      }
    }
  },

  data () {
    return {
      currentAnimationIndex: 0,
      timerAnimation: -1,
      currentAnimationKey: 'map_waterlevel_images',
      // TODO:This information, together with the description should come from backend
      images: [{
        key: 'delta_fringe_images',
        name: 'Delta fringe'
      }, {
        key: 'channel_network_images',
        name: 'Channel network'
      }, {
        key: 'sediment_fraction_images',
        name: 'Sediment fraction'
      }, {
        key: 'subenvironment_images',
        name: 'Sub-environment'
      }]
    }
  },

  computed: {

    isAnimating: {
      cache: false,
      get () {
        return this.timerAnimation > 0
      }
    },
    hasFrames: {
      cache: false,
      get () {
        // More than 0, then we have frames...
        return this.frameCount > 0
      }
    },

    animationIndex: {
      cache: false,
      get () {
        var idx = 0

        // if we have frames this can be used
        if (this.frameCount > 0) {
          idx = Math.min(this.currentAnimationIndex, this.frameCount - 1)
        } else {
          // otherwise it should be the currentAnimationIndex
          idx = this.currentAnimationIndex
        }
        // TODO: why the double administration??
        return idx
      }
    },

    animationFrame: {
      cache: false,
      get () {
        var animationKey = this.currentAnimationKey

        if (animationKey.length > 0) {
          var imgs = this.model.info[animationKey]

          if (imgs !== undefined) {
            return this.model.fileurl + imgs.location + imgs.files[this.animationIndex]
          }
        }

        return ''
      }
    },

    // Return amount of frames for current selected key.
    frameCount: {
      cache: false,
      get () {
        var animationKey = this.currentAnimationKey
        var imgs = _.get(this.model.info, animationKey)

        if (_.has(imgs, 'files')) {
          return imgs.files.length
        }

        return 0
      }
    }

  },

  methods: {

    // Switch to the images:
    switchAnimation (type) {
      this.currentAnimationKey = type
      this.currentAnimationIndex = 0
    },

    // For animations:
    previousImageFrame () {
      // Check if an animation key has been set. If not, we bail out.
      if (this.currentAnimationKey.length === 0) {
        return
      }

      // Does not exist?
      if (this.model.info === undefined) {
        return
      }

      this.currentAnimationIndex = this.animationIndex
      this.currentAnimationIndex--

      // Probably wrap with active key.
      if (this.currentAnimationIndex < 0) {
        this.currentAnimationIndex = 0
      }
    },

    stopImageFrame () {
      // Check if an animation key has been set. If not, we bail out.
      if (this.currentAnimationKey.length === 0) {
        return false
      }

      // Clear interval
      if (this.timerAnimation !== -1) {
        //  this.isAnimating =  false;
        clearInterval(this.timerAnimation)

        this.timerAnimation = -1
      }
    },
    playImageFrame () {
      // Check if an animation key has been set. If not, we bail out.
      if (this.currentAnimationKey.length === 0) {
        return
      }

      // Stop and start. (We do not want multiiple setintervals)
      this.stopImageFrame()
      this.timerAnimation = setInterval(this.nextImageFrame, 200)
    },

    gotoFirstFrame () {
      this.stopImageFrame()
      this.currentAnimationIndex = 0
    },

    gotoLastFrame () {
      this.stopImageFrame()

      var imgs = this.model.info[this.currentAnimationKey]

      if (imgs !== undefined) {
        this.currentAnimationIndex = imgs.files.length - 1
      }

      // Clamp to make sure it does not go below 0
      if (this.currentAnimationIndex < 0) {
        this.currentAnimationIndex = 0
      }
    },

    nextImageFrame () {
      // Check if an animation key has been set. If not, we bail out.
      if (this.currentAnimationKey.length === 0) {
        return
      }

      // Does not exist?
      if (this.model.info === undefined) {
        return
      }

      this.currentAnimationIndex++

      var imgs = this.model.info[this.currentAnimationKey]

      if (imgs !== undefined) {
        // Probably wrap.
        if (this.currentAnimationIndex >= imgs.files.length) {
          // 2016-06-08 we do not wrap anymore. We just go to the last frame and stop.
          // this.currentAnimationIndex = 0;
          this.gotoLastFrame()
        }
      }
    }

  }

}
</script>

<style lang="scss">
@import '../assets/variables.scss';

.image-animation {
  .description-image {
    float: left;
    margin-right: $padding;
    width: 50%;
  }
}

</style>
