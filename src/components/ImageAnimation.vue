<template>
  <div id="template-image-animation">
    <div class="image-animation">
      <div class="row">
        <div class="col-sm-12">
          <ul class="nav nav-tabs" id="myTab" role="tablist">
            <li
              v-for="image in images"
              :key="image.key"
              class="nav-item"
              :class="{ active: currentAnimationKey === image.key }"
              @click="switchAnimation(image.key)"
            >
              <a
                class="nav-link"
                :class="{ active: currentAnimationKey === image.key }"
                :id="`${image.key}-tab`"
                data-toggle="tab"
                href="#"
                role="tab"
                :aria-controls="`${image.key}`"
                :aria-selected="currentAnimationKey === image.key"
                >{{ image.name }}</a
              >
            </li>
          </ul>
        </div>
      </div>

      <div class="row">
        <div class="col-sm-12">
          <div class="text-center" v-if="hasFrames === false">
            <div class="alert alert-info" role="alert">
              No images available yet.
            </div>
          </div>

          <div v-if="hasFrames === true">
            <div class="text-center">
              <img :src="animationFrame" class="animation-frame" />
            </div>

            <div class="col-sm-12 text-center">
              <div class="btn-group">
                <button
                  type="button"
                  class="btn btn-primary"
                  v-on:click="gotoFirstFrame()"
                >
                  <span class="fa fa-fast-backward"> </span>
                </button>

                <button
                  type="button"
                  class="btn btn-primary"
                  v-on:click="previousImageFrame(currentAnimationKey)"
                >
                  <span class="fa fa-backward"> </span>
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  v-if="isAnimating"
                  v-on:click="stopImageFrame(currentAnimationKey)"
                >
                  <span class="fa fa-stop"> </span>
                </button>
                <button
                  class="btn btn-primary"
                  v-if="isAnimating == false"
                  v-on:click="playImageFrame(currentAnimationKey)"
                >
                  <span class="fa fa-play"> </span>
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  v-on:click="nextImageFrame(currentAnimationKey)"
                >
                  <span class="fa fa-forward"> </span>
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  v-on:click="gotoLastFrame()"
                >
                  <span class="fa fa-fast-forward"> </span>
                </button>
              </div>
            </div>

            <div class="col-sm-12 text-center">
              <div class="btn-group">
                <div class="animframeindicator">
                  Frame {{ animationIndex + 1 }} of {{ frameCount }}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div v-if="selectedImageTab">
              <h3>{{ selectedImageTab.name}}</h3>
              <p>
                {{selectedImageTab.text}}
              </p>
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
        return {}
      }
    },
    images: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      currentAnimationIndex: 0,
      timerAnimation: -1,
      currentAnimationKey: null,
      selectedImageTab: null

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
        let idx = 0

        // if we have frames this can be used
        if (this.frameCount > 0) {
          idx = Math.min(this.currentAnimationIndex, this.frameCount - 1)
        } else {
          // otherwise it should be the currentAnimationIndex
          idx = this.currentAnimationIndex
        }
        // TODO: why the double administration??
        return idx
      },
      set (val) {
        this.currentAnimationIndex = val
      }
    },

    animationFrame: {
      cache: false,
      get () {
        const animationKey = this.currentAnimationKey

        if (animationKey.length > 0) {
          const imgs = this.model.info[animationKey]

          if (imgs !== undefined) {
            return (
              this.model.fileurl +
              imgs.location +
              imgs.files[this.animationIndex]
            )
          }
        }

        return ''
      },
      set (val) {
        this.currentAnimationKey = val
      }
    },

    // Return amount of frames for current selected key.
    frameCount: {
      cache: false,
      get () {
        const animationKey = this.currentAnimationKey
        const imgs = _.get(this.model.info, animationKey)

        if (_.has(imgs, 'files')) {
          return imgs.files.length
        }
        return 0
      }
    },
    set (val) {
      return val
    }
  },

  methods: {
    // Switch to the images:
    switchAnimation (type) {
      this.currentAnimationKey = type
      this.selectedImageTab = this.images.find(image => image.key === type)

      // this.currentAnimationIndex = 0
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

      const imgs = this.model.info[this.currentAnimationKey]

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

      const imgs = this.model.info[this.currentAnimationKey]

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

.animation-frame {
  width: 100%;
}
</style>
