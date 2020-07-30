import chai, { assert } from 'chai'
import { shallowMount } from '@vue/test-utils'
import ImageAnimation from '../../../src/components/ImageAnimation.vue'
import chaiAsPromised from 'chai-as-promised'

import sinonChai from 'sinon-chai'

// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('ImageAnimation.vue', () => {
  it('Is possible to instantiate component ImageAnimation', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    assert.isOk(imageAnimation)
    done()
  })
})

describe('ImageAnimation', () => {
  it('Does ImageAnimation have the initial values', done => {
    var defaultData = {
      currentAnimationIndex: 0,
      timerAnimation: -1,
      currentAnimationKey: 'delta_fringe_images',
      // TODO:This information, together with the description should come from backend
      images: [
        {
          key: 'delta_fringe_images',
          name: 'Delta fringe'
        },
        {
          key: 'channel_network_images',
          name: 'Channel network'
        },
        {
          key: 'sediment_fraction_images',
          name: 'Sediment fraction'
        },
        {
          key: 'subenvironment_images',
          name: 'Sub-environment'
        }
      ]
    }

    /* eslint-disable no-underscore-dangle */
    assert.deepEqual(
      ImageAnimation.data(),
      defaultData,
      'Match default properties'
    )
    /* eslint-enable no-underscore-dangle */

    done()
  })

  it("Does ImageAnimation have the right default 'props'", done => {
    // Couldn't match on the function, so we only check if model exists.
    assert.isOk(ImageAnimation.props.model, 'Match default properties')

    done()
  })

  it('Should be possible to stop image frames - no anim key', done => {
    const imageAnimation = shallowMount(ImageAnimation)
    // Fake a timer interval:
    imageAnimation.vm.timerAnimation = 0
    imageAnimation.vm.currentAnimationKey = ''
    assert.isFalse(
      imageAnimation.vm.stopImageFrame(),
      'should have bailed out early'
    )

    done()
  })

  it('Should be possible to stop image frames', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    // Fake a timer interval:
    imageAnimation.vm.timerAnimation = 2
    imageAnimation.vm.currentAnimationKey = 'delta_fringe_images'
    imageAnimation.vm.stopImageFrame()

    assert.isTrue(
      imageAnimation.vm.timerAnimation === -1,
      'timeranimation id should have become -1'
    )

    done()
  })

  it('Should be possible to play image frames the imageFrame', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    imageAnimation.vm.playImageFrame()

    assert.isTrue(
      imageAnimation.vm.timerAnimation !== -1,
      'timeranimation id should not be -1'
    )

    done()
  })

  it('Should be possible to play image frames the imageFrame - No animationkey set', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    imageAnimation.vm.currentAnimationKey = ''

    // Without an animation key, playimage should just return and do nothing.
    imageAnimation.vm.playImageFrame()

    imageAnimation.vm.timerAnimation = -1

    assert.isTrue(
      imageAnimation.vm.timerAnimation === -1,
      'timeranimation id should still be -1'
    )

    done()
  })

  it('Should be possible to change to next imageFrame', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = {
      delta_fringe_images: { files: ['firstframe.jpg', 'lastframe.jpg'] }
    }
    /* eslint-enable camelcase */

    imageAnimation.vm.currentAnimationIndex = 0
    imageAnimation.vm.currentAnimationKey = 'delta_fringe_images'

    imageAnimation.vm.nextImageFrame()

    // Next frame should have brought to the next frame.
    assert.isTrue(
      imageAnimation.vm.animationIndex === 1,
      'Animation frame at 1'
    )

    done()
  })

  it('Should be possible to change to next imageFrame - stop at end', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = {
      delta_fringe_images: { files: ['firstframe.jpg', 'lastframe.jpg'] }
    }
    /* eslint-enable camelcase */

    imageAnimation.vm.currentAnimationIndex = 0
    imageAnimation.vm.currentAnimationKey = 'delta_fringe_images'

    // Loop some times, we should end at the last image anyway.
    for (var i = 0; i < 10; i++) {
      imageAnimation.vm.nextImageFrame()
    }

    // Next frame should have brought to the next frame.
    assert.isTrue(
      imageAnimation.vm.animationIndex ===
        imageAnimation.vm.model.info.delta_fringe_images.files.length - 1,
      'Animation frame at end'
    )

    done()
  })

  it('Should be possible to change to next imageFrame - no model info', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = undefined
    /* eslint-enable camelcase */

    imageAnimation.vm.currentAnimationIndex = 0
    imageAnimation.vm.currentAnimationKey = 'delta_fringe_images'

    imageAnimation.vm.nextImageFrame()

    // Next frame should still be at 0, as we did not have any model info.
    assert.isTrue(
      imageAnimation.vm.currentAnimationIndex === 0,
      'Animation index should stay 0'
    )

    // restore model info
    imageAnimation.vm.model.info = {}
    done()
  })

  it('Should be possible to change to next imageFrame - no animationkey', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = {
      delta_fringe_images: { files: ['firstframe.jpg', 'lastframe.jpg'] }
    }
    /* eslint-enable camelcase */

    imageAnimation.vm.currentAnimationIndex = 0
    imageAnimation.vm.currentAnimationKey = ''

    imageAnimation.vm.nextImageFrame()

    // Next frame should still be at 0, as we did not have an animation key yet
    assert.isTrue(
      imageAnimation.vm.currentAnimationIndex === 0,
      'Animation index should stay 0'
    )

    done()
  })

  it('Should be possible to check isanimating property', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    imageAnimation.vm.stopImageFrame()
    var isAnimating = imageAnimation.vm.isAnimating

    assert.isFalse(isAnimating, 'Animation is indeed not playing')
    done()
  })

  it('Should be possible to check hasFrames property', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    // We should not have any frames in this animation object, but maybe make sure later on?
    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = {
      delta_fringe_images: { files: ['firstframe.jpg', 'lastframe.jpg'] }
    }
    /* eslint-enable camelcase */

    imageAnimation.vm.currentAnimationKey = 'delta_fringe_images'

    assert.isTrue(
      imageAnimation.vm.hasFrames === true,
      'Animation does not have frames'
    )
    done()
  })

  it('Should be possible to check animationIndex property', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    // We should not have any frames in this animation object, but maybe make sure later on?
    imageAnimation.vm.currentAnimationIndex = 0
    imageAnimation.vm.currentAnimationKey = 'delta_fringe_images'

    assert.isTrue(
      imageAnimation.vm.animationIndex === 0,
      'Animation frame at 0'
    )
    done()
  })

  it('Should be possible to check animationFrame property', done => {
    const imageAnimation = shallowMount(ImageAnimation)
    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = {
      delta_fringe_images: {
        location: 'location/',
        files: ['firstframe.jpg', 'lastframe.jpg']
      }
    }
    /* eslint-enable camelcase */
    imageAnimation.vm.model.fileurl = 'fileurl/'
    imageAnimation.vm.currentAnimationKey = 'delta_fringe_images'

    var imgurl = imageAnimation.vm.animationFrame
    assert.equal(
      'fileurl/location/firstframe.jpg',
      imgurl,
      'Animation frame file matches expectation'
    )

    done()
  })

  it('Should be possible to check animationFrame property - empty', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = {
      delta_fringe_images: {
        location: 'location/',
        files: ['firstframe.jpg', 'lastframe.jpg']
      }
    }
    /* eslint-enable camelcase */
    imageAnimation.vm.model.fileurl = 'fileurl/'
    imageAnimation.vm.currentAnimationKey = ''

    var imgurl = imageAnimation.vm.animationFrame

    assert.isTrue(imgurl === '', 'Animation frame file matches expectation')

    done()
  })

  it('Should be possible to check frameCount property', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    // We should not have any frames in this animation object, but maybe make sure later on?
    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = {
      delta_fringe_images: { files: ['firstframe.jpg', 'lastframe.jpg'] }
    }
    /* eslint-enable camelcase */
    imageAnimation.vm.currentAnimationKey = 'delta_fringe_images'
    assert.isTrue(
      imageAnimation.vm.frameCount ===
        imageAnimation.vm.model.info.delta_fringe_images.files.length,
      'Animation framecount should not be 0'
    )
    done()
  })

  it('Should be possible to check frameCount property - no data', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    // We should not have any frames in this animation object, but maybe make sure later on?
    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = {}
    /* eslint-enable camelcase */
    imageAnimation.vm.currentAnimationKey = 'delta_fringe_images'
    assert.isTrue(
      imageAnimation.vm.frameCount === 0,
      'Animation framecount should not be 0'
    )
    done()
  })

  it('Should be possible to switchAnimation', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    // We should not have any frames in this animation object, but maybe make sure later on?
    imageAnimation.vm.switchAnimation('delta_fringe_images')

    done()
  })

  it('Should be possible to previousImageFrame - No model info', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    // index should become 0
    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = {
      delta_fringe_images: { files: ['firstframe.jpg', 'lastframe.jpg'] }
    }
    imageAnimation.vm.switchAnimation('delta_fringe_images')
    imageAnimation.vm.currentAnimationIndex = 1 // fake an index.

    // now remove data.
    imageAnimation.vm.model.info = undefined
    /* eslint-enable camelcase */

    imageAnimation.vm.previousImageFrame()

    // We started at 0, without data, so it should still be 1, as it was left untouched (maybe should become 0 if the model data is gone though)
    // TODO: 0,1? I don't get it....
    assert.equal(
      imageAnimation.vm.animationIndex,
      1,
      'Animation frame should still have been one.'
    )
    done()
  })

  it('Should not be possible to previousImageFrame before 0', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    // index should become 0
    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = {
      delta_fringe_images: {
        files: ['firstframe.jpg', 'middleframe.jpg', 'lastframe.jpg']
      }
    }
    /* eslint-enable camelcase */
    imageAnimation.vm.switchAnimation('delta_fringe_images')
    imageAnimation.vm.animationIndex = 0
    imageAnimation.vm.previousImageFrame()

    // We started at 0, we don't wrap past 0
    assert.equal(
      imageAnimation.vm.animationIndex,
      0,
      'Animation frame should not have wrapped'
    )
    done()
  })

  // xit
  it('Should be possible to previousImageFrame - no animation key ', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    // index should become 0
    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = {
      delta_fringe_images: { files: ['firstframe.jpg', 'lastframe.jpg'] }
    }
    /* eslint-enable camelcase */
    imageAnimation.vm.currentAnimationKey = '' // No animation key
    imageAnimation.vm.currentAnimationIndex = 1 // fake an index.;
    imageAnimation.vm.previousImageFrame()

    // We started at 0, without data, so it should still be 1, as it was left untouched (maybe should become 0 if the model data is gone though)
    assert.equal(
      imageAnimation.vm.animationIndex,
      1,
      'Animation frame should still have been one.'
    )
    done()
  })

  it('Should be possible to gotoFirstFrame', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    // index should become 0
    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = {
      delta_fringe_images: { files: ['firstframe.jpg', 'lastframe.jpg'] }
    }
    /* eslint-enable camelcase */

    imageAnimation.vm.switchAnimation('delta_fringe_images')
    imageAnimation.vm.gotoFirstFrame()

    assert.isTrue(
      imageAnimation.vm.animationIndex === 0,
      'Animation frame at 0'
    )
    done()
  })

  // xit
  it('Should be possible to gotoLastFrame - number wrap', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    // index should become 0.. we do not have any images. Maybe test later using an fake array.
    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = { delta_fringe_images: { files: [] } }
    /* eslint-enable camelcase */

    imageAnimation.vm.animationIndex = -10
    imageAnimation.vm.switchAnimation('delta_fringe_images')
    imageAnimation.vm.gotoLastFrame()

    assert.equal(imageAnimation.vm.animationIndex, 0, 'Animation frame at 0')
    done()
  })

  it('Should be possible to gotoLastFrame', done => {
    const imageAnimation = shallowMount(ImageAnimation)

    // index should become 0.. we do not have any images. Maybe test later using an fake array.
    /* eslint-disable camelcase */
    imageAnimation.vm.model.info = {
      delta_fringe_images: { files: ['firstframe.jpg', 'lastframe.jpg'] }
    }
    /* eslint-enable camelcase */

    imageAnimation.vm.switchAnimation('delta_fringe_images')
    imageAnimation.vm.gotoLastFrame()

    assert.isTrue(
      imageAnimation.vm.animationIndex ===
        imageAnimation.vm.model.info.delta_fringe_images.files.length - 1,
      'Animation frame at 0'
    )
    done()
  })
})
