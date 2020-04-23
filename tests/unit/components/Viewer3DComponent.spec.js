// import { shallowMount } from '@vue/test-utils'
// import Viewer3DComponent from '@/components/Viewer3DComponent.vue'
// import chaiAsPromised from 'chai-as-promised'
// import sinon from 'sinon'
// import sinonChai from 'sinon-chai'
// import $ from 'jquery'
// import chai, {
//   expect
// } from 'chai'
// import store from '@/store'
//
// // setup chai
// chai.use(chaiAsPromised)
// chai.use(sinonChai)
// // let should = chai.should()
//
// // Viewer3D stub
// window.Viewer3D = sinon.stub()
// window.Viewer3D.viewer3D = sinon.stub()
//
// window.Viewer3D.viewer3D.prototype.camera = sinon.stub()
// window.Viewer3D.viewer3D.prototype.camera.alignToSide = sinon.stub()
// window.Viewer3D.viewer3D.prototype.camera.fit = sinon.stub()
// window.Viewer3D.viewer3D.prototype.camera.rotateToTopRightCorner = sinon.stub()
// window.Viewer3D.viewer3D.prototype.camera.stepDown = sinon.stub()
// window.Viewer3D.viewer3D.prototype.camera.stepUp = sinon.stub()
// window.Viewer3D.viewer3D.prototype.colorMap = sinon.stub()
// window.Viewer3D.viewer3D.prototype.colorMap.setColorMap = sinon.stub()
// window.Viewer3D.viewer3D.prototype.side = sinon.stub()
// window.Viewer3D.viewer3D.prototype.volume = sinon.stub()
// window.Viewer3D.viewer3D.prototype.volume.getDimensions = sinon.stub()
// window.Viewer3D.viewer3D.prototype.volume.refreshData = sinon.stub()
// window.Viewer3D.viewer3D.prototype.volume.setSlicePosition = sinon.stub()
// window.Viewer3D.viewer3D.prototype.volume.setTimeStep = sinon.stub()
// window.Viewer3D.viewer3D.prototype.dataSet = sinon.stub()
// window.Viewer3D.viewer3D.prototype.dataSet.load = sinon.spy((set, callback) => {
//   callback()
// })
//
// // test component
// describe('Viewer3DComponent', () => {
//   const viewer3dcomponent = shallowMount(Viewer3DComponent, { propsdata: { activated: true, model: {} } })
//   beforeEach(() => {
//     // import component
//     sinon.spy($, 'ajax')
//     sinon.spy(Promise, 'all')
//     sinon.spy(Promise, 'reject')
//     sinon.spy(Promise, 'resolve')
//   })
//
//   afterEach(() => {
//     // Unwrap spies
//     $.ajax.restore()
//     Promise.all.restore()
//     Promise.reject.restore()
//     Promise.resolve.restore()
//   })
//
//   // ***************************************************************************** activeModel
//
//   describe('.activeModel', () => {
//     it('', () => {
//       store.state.activeModelContainer = {
//         'data': {
//           'info': {
//             'delta_fringe_images': {
//               'images': ['image.jpg']
//             },
//             'suid': 'ID'
//           },
//           'state': 'Finished',
//           'parameters': {
//             'composition': {
//               'value': 'medium-sand'
//             }
//           }
//         }
//       }
//     })
//   })
//
//   // ***************************************************************************** start3dviewer
//
//   describe('.start3dviewer()', () => {
//     it('', () => {
//       // viewer3dcomponent.vm.activated = true
//       viewer3dcomponent.vm.start3dviewer()
//     })
//   })
//
//   // ***************************************************************************** startOrLoad3dViewer
//
//   describe('.startOrLoad3dViewer()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.startOrLoad3dViewer()
//     })
//   })
//
//   // ***************************************************************************** addPoint
//
//   describe('.addPoint()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.addPoint()
//     })
//   })
//
//   // ***************************************************************************** camera
//
//   describe('.camera()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.camera()
//       viewer3dcomponent.vm.camera('back')
//       viewer3dcomponent.vm.camera('bottom')
//       viewer3dcomponent.vm.camera('down')
//       viewer3dcomponent.vm.camera('fit')
//       viewer3dcomponent.vm.camera('front')
//       viewer3dcomponent.vm.camera('left')
//       viewer3dcomponent.vm.camera('reset')
//       viewer3dcomponent.vm.camera('right')
//       viewer3dcomponent.vm.camera('top')
//       viewer3dcomponent.vm.camera('up')
//     })
//   })
//
//   // ***************************************************************************** goEnd
//
//   describe('.goEnd()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.goEnd()
//     })
//   })
//
//   // ***************************************************************************** goNext
//
//   describe('.goNext()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.goNext()
//     })
//   })
//
//   // ***************************************************************************** goPrev
//
//   describe('.goPrev()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.goPrev()
//     })
//   })
//
//   // ***************************************************************************** goStart
//
//   describe('.goStart()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.goStart()
//     })
//   })
//
//   // ***************************************************************************** initIonSliders
//
//   describe('.initIonSliders()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.initIonSliders()
//     })
//   })
//
//   // ***************************************************************************** initPickAColor
//
//   describe('.initPickAColor()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.initPickAColor()
//     })
//   })
//
//   // ***************************************************************************** loadData
//
//   describe('.loadData()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.loadData()
//     })
//   })
//
//   // ***************************************************************************** loadGradient
//
//   describe('.loadGradient()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.loadGradient()
//     })
//   })
//
//   // ***************************************************************************** loadSliders
//
//   describe('.loadSliders()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.loadSliders()
//     })
//   })
//
//   // ***************************************************************************** loadTime
//
//   describe('.loadTime()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.loadTime()
//     })
//   })
//
//   // ***************************************************************************** removePoint
//
//   describe('.removePoint()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.removePoint()
//     })
//   })
//
//   // ***************************************************************************** resetSliders
//
//   describe('.resetSliders()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.resetSliders()
//     })
//   })
//
//   // ***************************************************************************** resetViewer
//
//   describe('.resetViewer()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.resetViewer()
//     })
//   })
//
//   // ***************************************************************************** setTab
//
//   describe('.setTab()', () => {
//     it('', () => {
//       viewer3dcomponent.vm.setTab()
//     })
//   })
// })
