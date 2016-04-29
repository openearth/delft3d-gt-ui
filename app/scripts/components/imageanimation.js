/* global Vue */

var exports = (function () {
  "use strict";

  // The image animation component
  var ImageAnimation = Vue.component("image-animation", {


    template: "#template-image-animation",
    props: ["model"],

    data: function() {
      return {
        // Current animation frame:
        currentAnimationIndex: 0,

        // timer id for animation.
        timerAnimation: -1,

        // Which imagelist are we currently watching?
        currentAnimationKey: "delta_fringe_images",

        isAnimating: false,

        // Automatically filled by component
        model: {}
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
          return this.frameCount > 0;

        }
      },

      animationIndex: {
        cache: false,
        get: function() {
          return this.currentAnimationIndex;
        }
      },

      animationFrame: {
        cache: false,
        get: function() {

          var animationKey = this.currentAnimationKey;

          if (animationKey.length > 0) {
            var imgs = this.model.info[animationKey];

            if (imgs !== undefined) {
              return this.model.fileurl + imgs.location + imgs.images[this.currentAnimationIndex];
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
          var imgs = this.model.info[animationKey];

          if (imgs !== undefined) {
            return imgs.images.length;
          }

          return 0;
        }
      }

    },

    events: {



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


        this.currentAnimationIndex--;

        var imgs = this.model.info[this.currentAnimationKey];


        // Probably wrap with active key.
        if (this.currentAnimationIndex < 0) {
          this.currentAnimationIndex = imgs.images.length - 1;
        }
      },

      stopImageFrame: function() {
        // Check if an animation key has been set. If not, we bail out.
        if (this.currentAnimationKey.length === 0) {
          return;
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
          if (this.currentAnimationIndex >= imgs.images.length) {
            this.currentAnimationIndex = 0;
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
