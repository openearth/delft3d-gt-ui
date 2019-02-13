/* global Vue */

var exports = (function () {
  "use strict";

  // The image animation component
  var ImageAnimation = Vue.component("image-animation", {

    template: "#template-image-animation",
    props: {
      model: {
        type: Object,
        default: function () {
          return { };
        }
      }
    },

    data: function() {
      return {
        // Current animation frame:
        currentAnimationIndex: 0,

        // timer id for animation.
        timerAnimation: -1,

        // Which imagelist are we currently watching?
        currentAnimationKey: "delta_fringe_images",

        isAnimating: false
      };
    },

    computed: {


      isAnimating: {
        cache: false,
        get: function() {
          return this.timerAnimation > 0;
        }
      },
      hasFrames: {
        cache: false,
        get: function() {

          // More than 0, then we have frames...
          console.log(this.frameCount > 0)
          return this.frameCount > 0;

        }
      },

      animationIndex: {
        cache: false,
        get: function() {
          var idx = 0;

          // if we have frames this can be used
          if (this.frameCount > 0) {
            idx = Math.min(this.currentAnimationIndex, this.frameCount - 1);
          } else {
            // otherwise it should be the currentAnimationIndex
            idx = this.currentAnimationIndex;
          }
          // TODO: why the double administration??
          return idx;
        }
      },

      animationFrame: {
        cache: false,
        get: function() {

          var animationKey = this.currentAnimationKey;
          if (animationKey.length > 0 &&  this.model.info != undefined) {
            var imgs = this.model.info[animationKey];
            if (imgs !== undefined) {
              return this.model.fileurl + imgs.location + imgs["files"][this.animationIndex];
            }
          }

          return "";

        }
      },

      // Return amount of frames for current selected key.
      frameCount: {
        cache: false,
        get: function() {

          var animationKey = this.currentAnimationKey;
          if (this.model.info != undefined && this.model.info[animationKey]["files"]) {
            var imgs = this.model.info[animationKey];
            return imgs["files"].length
          }
          return 0
        }
      }

    },

    methods: {

      // Switch to the images:
      switchAnimation: function(type) {

        this.currentAnimationKey = type;
        this.currentAnimationIndex = 0;
      },


      // For animations:
      previousImageFrame: function() {
        // Check if an animation key has been set. If not, we bail out.
        if (this.currentAnimationKey.length === 0) {
          return;
        }

        // Does not exist?
        if (this.model.info === undefined) {
          return;
        }

        this.currentAnimationIndex = this.animationIndex;
        this.currentAnimationIndex--;

        // Probably wrap with active key.
        if (this.currentAnimationIndex < 0) {
          this.currentAnimationIndex = 0;
        }
      },

      stopImageFrame: function() {
        // Check if an animation key has been set. If not, we bail out.
        if (this.currentAnimationKey.length === 0) {
          return false;
        }


        // Clear interval
        if (this.timerAnimation !== -1) {
          //  this.isAnimating =  false;
          clearInterval(this.timerAnimation);

          this.timerAnimation = -1;
        }
      },
      playImageFrame: function() {
        // Check if an animation key has been set. If not, we bail out.
        if (this.currentAnimationKey.length === 0) {
          return;
        }

        // Stop and start. (We do not want multiiple setintervals)
        this.stopImageFrame();
        this.timerAnimation = setInterval(this.nextImageFrame, 200);

      },

      gotoFirstFrame: function() {

        this.stopImageFrame();
        this.currentAnimationIndex = 0;

      },


      gotoLastFrame: function() {

        this.stopImageFrame();

        var imgs = this.model.info[this.currentAnimationKey];

        if (imgs !== undefined) {
          this.currentAnimationIndex = imgs.images.length - 1;
        }

        // Clamp to make sure it does not go below 0
        if (this.currentAnimationIndex < 0) {
          this.currentAnimationIndex = 0;
        }
      },

      nextImageFrame: function() {
        // Check if an animation key has been set. If not, we bail out.
        if (this.currentAnimationKey.length === 0) {
          return;
        }

        // Does not exist?
        if (this.model.info === undefined) {
          return;
        }

        this.currentAnimationIndex++;

        var imgs = this.model.info[this.currentAnimationKey];

        if (imgs !== undefined) {
          // Probably wrap.
          if (this.currentAnimationIndex >= imgs.files.length) {
            // 2016-06-08 we do not wrap anymore. We just go to the last frame and stop.
            //this.currentAnimationIndex = 0;
            this.gotoLastFrame();
          }
        }
      }

    }

  });

  return {
    ImageAnimation: ImageAnimation
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
