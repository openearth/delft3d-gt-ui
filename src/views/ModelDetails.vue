<template>
<div id="template-model-details" class="model-details">
    <div v-if="(activeModel !== undefined)">
      <!-- model window for deletation -->
      <div class="panel panel-default">
        <div class="panel-heading">
          <h2 class="panel-title">{{ getActiveModelData('name').join('') }}</h2>
        </div>
        <div class="panel-body">

          <dl class="dl-horizontal" :class="{ 'loading': getActiveModelData('date_created') === '' }">
            <dt>Owner of run</dt><dd>
              <span v-if="getActiveModelData('date_created') === ''">-</span>
              <span v-else>
                <a :href="'mailto:' + getActiveModelData('owner.email').join().replace(/,/g, '')">{{ getActiveModelData('owner.first_name').join().replace(/,/g, '') }} {{ getActiveModelData('owner.last_name').join().replace(/,/g, '') }}</a>
              </span>
            </dd>

            <dt>Share level</dt>
            <dd><span v-if="getActiveModelData('date_created') === ''">-</span><span v-else>{{ shareLevelText.toUpperCase() }}</span></dd>

            <dt>Created</dt>
            <dd><span v-if="getActiveModelData('date_created') === ''">-</span><span v-else>{{ dateCreatedText }}</span></dd>

            <dt>Run environment</dt>
            <dd><span v-if="getActiveModelData('date_created') === ''">-</span><span v-else>Amazon</span></dd>

            <dt>Updates available</dt>
            <dd>
              <template v-if="getActiveModelData('date_created') === ''">
                <span >-</span>
              </template>
              <template v-else>
                <span v-if="outdated === false">No updates available</span>
                <span v-if="outdated === true">Updates available ({{ getActiveModelData('outdated_changelog').join('') }})</span>
              </template>
            </dd>
          </dl>

          <hr>

          <dl class="dl-horizontal">
            <dt>Progress</dt>
            <dd>
              <div class="progress progress-incell">
                <div class="progress-bar"
                  :class="[
                    isRunning ? 'progress-bar-striped active' : '',
                    'bg-' + activeModel.statusLevel
                  ]"
                  role="progressbar"
                  :aria-valuenow="getActiveModelData('progress')"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :style="'width: ' + getActiveModelData('progress') + '%'"
                  title="Progress"
                >
                  <span class="sr-only">{{ getActiveModelData('progress') }}% Complete</span>
                  <span class="progress-type">{{ getActiveModelData('progress') }}%</span>
                </div>
              </div>
            </dd>
            <dt>Status</dt><dd><span class="label label-status" :class="'label-' + activeModel.statusLevel">{{ getActiveModelData('state').join('').toUpperCase() }}</span></dd>
            <dt>Simulation output:</dt><dd>
              <template v-if="getActiveModelData('date_created') === ''">
                <a class="btn btn-default btn-xs btn-output" disabled>File Server</a>
                <a class="btn btn-default btn-xs btn-output" disabled>THREDDS Data Server</a>
              </template>
              <template v-else>
                <a class="btn btn-default btn-xs" :href="getActiveModelData('fileurl')" target="_blank" title="A link to the file server hosting all output files.">File Server</a>
                <a class="btn btn-default btn-xs" :href="'/thredds/catalog/files/'+ getActiveModelData('suid') + '/simulation/catalog.html'" target="_blank" title="A link to the THREDDS server hosting Delft3D NetCDF output, which allows querying via OPeNDAP.">THREDDS Data Server</a>
              </template>
            </dd>
          </dl>

          <!-- reference: this element is used for a size reference for the 3D Viewer -->
          <div class="row">
            <div id="col-glcanvas-container-reference" class="col-xs-11"></div>
          </div>
          <!-- end-reference  -->

        </div>
      </div>

      <div class="panel panel-default">
        <div class="panel-heading" @click.stop="collapseToggle(false, $event)">
          Simulation controls
        </div>

        <div id="simulation-controls-collapse" class="collapse">

          <div class="panel-body">
            <p :class="{ 'hidden': isReadOnly }">
              You can select an action to perform on this simulation:
            </p>

            <p :class="{ 'hidden': !isReadOnly }">
              Simulation controls are disabled for already published runs.
            </p>

            <button type="button" class="btn btn-labeled btn-spaced-right" id="simulation-control-start"
                    v-on:click="startModel"
                    :class="[(isReadOnly || !isIdle) ? 'disabled' : 'btn-info']"
                    :disabled="(isReadOnly || !isIdle)">
              <span class="btn-label"><i class="fa fa-fw fa-play" aria-hidden="true"></i></span>
              Start
            </button>&nbsp;
            <button type="button"
                    v-on:click="stopModel"
                    class="btn btn-labeled btn-spaced-right" id="simulation-control-stop"
                    :class="[(isReadOnly || (!isRunning && !isQueued)) ? 'disabled' : 'btn-success']"
                    :disabled="(isReadOnly || (!isRunning && !isQueued))">
              <span class="btn-label"><i class="fa fa-fw fa-stop" aria-hidden="true"></i></span>
              Stop
            </button>&nbsp;
            <button type="button"
                    v-on:click="resetModel"
                    class="btn btn-labeled btn-spaced-right" id="simulation-control-stop"
                    :class="[(isReadOnly || !isFinished) ? 'disabled' : 'btn-warning']"
                    :disabled="(isReadOnly || !isFinished)">
              <span class="btn-label"><i class="fa fa-fw fa-fast-backward" aria-hidden="true"></i></span>
              Reset
            </button>&nbsp;
            <div class="btn-group">
              <button class="btn dropdown-toggle"
                :class="[(isReadOnly || !isFinished || outdated == false) ? 'disabled' : 'btn-warning']"
                data-toggle="dropdown"
                href="#"
                :disabled="(isReadOnly || !isFinished || outdated == false)"
                :data-original-title="(outdated == false) ? 'no updates available' : getActiveModelData('outdated_workflow')"
                >
                <span class="btn-label"><i class="fa fa-fw fa-level-up" aria-hidden="true"></i></span>
                Update
                <span class="caret"></span>
              </button>
              <ul class="dropdown-menu" :disabled="(isReadOnly || !isFinished || outdated == false)">
                <li v-for="(entrypoint, index) in getEntrypoints" :key="index"><a @click="redoModel(entrypoint)" href="#">{{entrypoint}}</a></li>
              </ul>
            </div>&nbsp;
            <button type="button"
                    class="btn btn-labeled btn-spaced-right"
                    v-on:click="removeModel"
                    :class="[ (isReadOnly) ? 'disabled' : 'btn-danger']"
                    :disabled="isReadOnly">
              <span class="btn-label"><i class="fa fa-fw fa-times" aria-hidden="true"></i></span>
              Remove run
            </button>&nbsp;
          </div>
        </div>

      </div>

      <div class="panel panel-default">
        <div class="panel-heading" @click.stop="collapseToggle(false, $event)">
          Share controls
        </div>
        <div class="collapse">
          <div class="panel-body">
            <p v-if="sharedState.user.id == getActiveModelData('owner.id') && isFinished">
              You can select who to share your results with:
            </p>
            <p v-if="sharedState.user.id == getActiveModelData('owner.id') && !isFinished">
              When the run is finished, you can select who to share your results with:
            </p>
            <p v-if="sharedState.user.id != getActiveModelData('owner.id') ">
              You cannot share runs owned by another user.
            </p>
            <button type="button" class="btn btn-labeled btn-default"
                    :disabled="!isFinished || sharedState.user.id != getActiveModelData('owner.id') || getActiveModelData('shared') == 'c' || getActiveModelData('shared') == 'w'"
                    @click.stop="publishModel('company')"
                    >
              <i class="fa fa-group" aria-hidden="true"></i> Share with Company
            </button>
            <button type="button" class="btn btn-labeled btn-default"
                    :disabled="!isFinished || sharedState.user.id != getActiveModelData('owner.id') || getActiveModelData('shared') == 'w'"
                    @click.stop="publishModel('world')"
                    >
              <i class="fa fa-globe" aria-hidden="true"></i> Share with World
            </button>
          </div>
        </div>
      </div>

      <div v-if="model !== 'GTSM'" class="panel panel-default hidden-xs hidden-sm">
        <div class="panel-heading" @click.stop="collapseToggle(true, $event)">
          3D Viewer
        </div>
        <div class="collapse">
          <viewer-threedee :model="activeModel.data" :activated="viewerActive"></viewer-threedee>
        </div>
      </div>

      <div class="panel panel-default">
        <div class="panel-heading" @click.stop="collapseToggle(false, $event)">
          Generated images
        </div>
        <div class="collapse">
          <div class="panel-body">
            <image-animation :model="activeModel.data"></image-animation>
          </div>
        </div>
      </div>

      <div class="panel panel-default">
        <div class="panel-heading" @click.stop="collapseToggle(false, $event)">
          Run input parameters
        </div>
        <div class="collapse">
          <div class="panel-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(key, param) in getActiveModelData('parameters')" :key="param">
                  <td>{{ (param.name || key) }}</td>
                  <td>{{param.value}}</td>
                  <td>
                    <!-- we add this as we might have some older models not having the units var yet. -->
                    <span v-if="param.units !== undefined">
                      {{param.units}}
                    </span>
                  </td>
                </tr>
              </tbody>

            </table>
          </div>
        </div>
      </div>

      <div v-if="model !== 'GTSM'" class="panel panel-default">
        <div class="panel-heading" @click.stop="collapseToggle(false, $event)">
          Post processing output
        </div>
        <div class="collapse">
          <div class="panel-body">
            <table class="table table-striped" v-if="hasPostProcessData()">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(key, param) in getActiveModelPPData()" :key="param">
                  <td>{{ param.name.substring(0,1).toUpperCase() }}{{ param.name.substring(1).toLowerCase() }}</td>
                  <td>{{ param.value && param.value.toExponential(2) || "-"}}</td>
                  <td>{{ param.unit || "-"}}</td>
                </tr>
              </tbody>
            </table>

            <div v-else>No post processing output available yet.</div>

          </div>
        </div>
      </div>

      <div v-if="model !== 'GTSM'" class="panel panel-default">
        <div class="panel-heading" @click.stop="collapseToggle(false, $event)">
          Download files
        </div>
        <div class="collapse">
          <div class="panel-body">
            <p>
              Please check what you would like to download. Your download will be a ZIP file which contains the requested files.
            </p>

            <div class="form-group input-group" @click.stop.prevent="toggle('export_d3dinput', true)">
              <span class="input-group-addon">
                <!-- @click.stop="doNothing" captures an event and avoids bubbling it down, so we don't get 2 toggles -->
                <input type="checkbox" class="downloadoption" value="export_d3dinput" v-model="selectedDownloads.export_d3dinput" @click.stop="doNothing">
              </span>
              <span class="form-control no-fixed-height">Delft3D: input files</span>
            </div>
            <div class="form-group input-group" @click.stop.prevent="toggle('export_images', true)">
              <span class="input-group-addon">
                <!-- @click.stop="doNothing" captures an event and avoids bubbling it down, so we don't get 2 toggles -->
                <input type="checkbox" class="downloadoption" value="export_images" v-model="selectedDownloads.export_images" @click.stop="doNothing">
              </span>
              <span class="form-control no-fixed-height">Media: generated output images</span>
            </div>

            <div class="form-group input-group" @click.stop.prevent="toggle('export_movie', true)">
              <span class="input-group-addon">
                <!-- @click.stop="doNothing" captures an event and avoids bubbling it down, so we don't get 2 toggles -->
                <input type="checkbox" class="downloadoption" value="export_movie" v-model="selectedDownloads.export_movie" @click.stop="doNothing">
              </span>
              <span class="form-control no-fixed-height">Media: generated output movies</span>
            </div>

            <div class="form-group input-group" :class="{ 'inputdisabled': !isFinished }" @click.stop.prevent="toggle('export_thirdparty', isFinished);">
              <span class="input-group-addon">
                <!-- @click.stop="doNothing" captures an event and avoids bubbling it down, so we don't get 2 toggles -->
                <input type="checkbox" class="downloadoption" value="export_thirdparty" v-model="selectedDownloads.export_thirdparty" :disabled="!isFinished" @click.stop="doNothing">
              </span>
              <span class="form-control no-fixed-height" :class="{'hidden': !isFinished}">Export: files for RMS / Petrel</span>
              <span class="form-control no-fixed-height not-allowed" :class="{'hidden': isFinished}">Export: files for RMS / Petrel (will be enabled when the run is 'Finished')</span>
            </div>

            <button class="btn btn-primary" type="button" id="download-submit" v-on:click="downloadFiles()" :disabled="!anyDownloadsSelected">
              Download
            </button>

          </div>
        </div>
      </div>

      <!-- MODALS -->
      <confirm-dialog dialog-id="reset" confirm-button-title="Reset">
        <template slot="title">
          Reset model '{{ getActiveModelData('name') }}'?
        </template>
        <template slot="body">
          <p>Are you sure you want to reset this model? This action cannot be undone.</p>
        </template>
      </confirm-dialog>

      <confirm-dialog dialog-id="redo" confirm-button-title="Redo">
        <template slot="title">
          Update model '{{ getActiveModelData('name') }}'?
        </template>
        <template slot="body">
          <p>Are you sure you want to update this model? This action cannot be undone.</p>
        </template>
      </confirm-dialog>

      <confirm-dialog dialog-id="publish" confirm-button-title="Publish">
        <template slot="title">
          Publish model '{{ getActiveModelData('name') }}'?
        </template>
        <template slot="body">
          <p>Are you sure you want to publish this model? This action cannot be undone.</p>
        </template>
      </confirm-dialog>

      <confirm-dialog dialog-id="delete" confirm-button-title="Delete">
        <template slot="title">
          Remove model '{{ getActiveModelData('name').join().replace(/,/g, '') }}'?
        </template>
        <template slot="body">
          <p>Are you sure you want to remove this model? This action cannot be undone.</p>
        </template>
      </confirm-dialog>

      <confirm-dialog dialog-id="stop" confirm-button-title="Stop">
        <template slot="title">
          Stop model '{{ getActiveModelData('name') }}'?
        </template>
        <template slot="body">
          <p>Are you sure you want to stop this model? This action cannot be undone.</p>
        </template>
      </confirm-dialog>

    </div>

    <div v-else>
      <p class="info-secondary">
        Clicking a model will show details here.
      </p>
    </div>
</div>
</template>

<script>
import $ from 'jquery'
import _ from 'lodash'
import store from '../store'
import ImageAnimation from '../components/ImageAnimation'
import ConfirmDialog from '../components/ConfirmDialog'
// import Viewer3DComponent from '../components/Viewer3DComponent'
import { getDialog } from '../templates.js'
import { mapState } from 'vuex'

export default {
  store,
  template: '#template-model-details',
  components: {
    // <my-component> will only be available in Parent's template
    'image-animation': ImageAnimation,
    'confirm-dialog': ConfirmDialog
    // 'viewer-3d': Viewer3DComponent
  },
  data () {
    return {
      selectedDownloads: {
        'export_d3dinput': false,
        'export_images': false,
        'export_movie': false,
        'export_thirdparty': false
      },
      viewerActive: false,
      model: 'GTSM',
      selectedUpdate: '',
      owner: ''
    }
  },
  computed: {
    ...mapState({
      sharedState: state => state
    }),
    activeModel: {
      cached: false,
      get () {
        var model = this.sharedState.activeModelContainer

        // model details are conditionally rendered: activating jQuery tooltips when there is a model
        this.$nextTick(this.activateTooltips)
        return model
      }
    },
    anyDownloadsSelected: {
      cache: false,
      get () {
        return _.values(this.selectedDownloads).some((el) => {
          return el
        })
      }
    },
    dateCreatedText: {
      cached: false,
      get () {
        var d = new Date(_.get(this.activeModel, 'data.date_created', ''))

        if (isNaN(d.getTime())) { // something went wront here
          return '' // elegant fail
        }

        return `${d.getDate()}/${(d.getMonth() + 1)}/${d.getFullYear()}`
      }
    },
    isReadOnly: {
      cache: false,
      get () {
        return _.get(this.activeModel, 'data.shared', 'p') !== 'p'
      }
    },
    getEntrypoints: {
      cache: false,
      get () {
        var entrypoints = _.get(this.activeModel, 'data.entrypoints', '')
        if (entrypoints != null) {
          if (entrypoints.length > 0) {
            return entrypoints
          } else {
            return false
          }
        } else {
          return false
        }
      }
    },
    isIdle: {
      cache: false,
      get () {
        return _.get(this.activeModel, 'data.state', '') === 'Idle: waiting for user input'
      }
    },
    isRunning: {
      cache: false,
      get () {
        return _.get(this.activeModel, 'data.state', '').includes('Running')
      }
    },
    isFinished: {
      cache: false,
      get () {
        return _.get(this.activeModel, 'data.state', '') === 'Finished'
      }
    },
    isQueued: {
      cache: false,
      get () {
        return _.get(this.activeModel, 'data.state', '') === 'Queued'
      }
    },
    shareLevelText: {
      cache: false,
      get () {
        var niceStrings = {
          '': '-',
          'p': 'private',
          'c': 'company',
          'w': 'world',
          'u': 'updating'
        }

        return niceStrings[_.get(this.activeModel, 'data.shared', '')]
      }
    },
    outdated: {
      cache: false,
      get () {
        return _.get(this.activeModel, 'data.outdated', false)
      }
    },
    reposUrl: {
      cache: false,
      get () {
        if (_.has(this.activeModel, 'data.versions.preprocess')) {
          return `${this.activeModel.data.versions.preprocess.REPOS_URL}?p=${this.activeModel.data.versions.preprocess.SVN_REV}`
        }
        return ''
      }
    }
  },
  watch: {
    isFinished: {
      deep: false,
      handler () {
        if (!this.isFinished) {
          /* eslint-disable camelcase */
          this.selectedDownloads.export_thirdparty = false
          /* eslint-enable camelcase */
        }
      }
    },
    isIdle: {
      deep: false,
      handler (newIsIdleValue) {
        if (newIsIdleValue) {
          $('#simulation-controls-collapse').collapse('show')
        }
      }
    }
  },
  methods: {
    collapseToggle (viewerFlag, e) {
      if (viewerFlag) {
        this.viewerActive = !this.viewerActive
      }
      $(e.target).closest('.panel').children('.collapse').collapse('toggle')
    },
    getActiveModelData (str) {
      console.log('activemodel', this.activeModel, str, _.orderBy(_.get(this.activeModel, 'data.' + str, ''), 'key'))
      if (str === 'progress') {
        return this.activeModel.data[str]
      }
      return _.orderBy(_.get(this.activeModel, 'data.' + str, ''), 'key')
    },
    getActiveModelPPData () {
      let rv = {
        'DeltaTopD50': { 'name': 'D50 for Delta Top', 'unit': 'mm', 'value': undefined },
        'DeltaTopsand_fraction': { 'name': 'Sand Fraction for Delta Top', 'unit': '%', 'value': undefined },
        'DeltaTopsorting': { 'name': 'Sorting for Delta Top', 'unit': '-', 'value': undefined },
        'DeltaFrontD50': { 'name': 'D50 for Delta Front', 'unit': 'mm', 'value': undefined },
        'DeltaFrontsand_fraction': { 'name': 'Sand Fraction for Delta Front', 'unit': '%', 'value': undefined },
        'DeltaFrontsorting': { 'name': 'Sorting for Delta Front', 'unit': '-', 'value': undefined },
        'ProDeltaD50': { 'name': 'D50 for Prodelta', 'unit': 'mm', 'value': undefined },
        'ProDeltasand_fraction': { 'name': 'Sand Fraction for Prodelta', 'unit': '%', 'value': undefined },
        'ProDeltasorting': { 'name': 'Sorting for Prodelta', 'unit': '-', 'value': undefined }
      }
      let ppJson = _.get(this.activeModel, 'data.info.postprocess_output')

      _.each(_.keys(rv), (key) => {
        if (_.endsWith(key, '_fraction')) {
          rv[key].value = parseFloat(ppJson[key]) * 100 // fractions are in percentages
        } else {
          rv[key].value = ppJson[key]
        }
      })

      return rv
    },
    downloadFiles () {
      if (!this.anyDownloadsSelected) {
        return
      }

      var id = this.activeModel.id
      var downloadOptions = []

      for (var option in this.selectedDownloads) {
        if (this.selectedDownloads[option] === true) {
          downloadOptions.push(`options=${option}`)
        }
      }

      window.open(`api/v1/scenes/${id}/export/?format=json&${downloadOptions.join('&')}`)
    },
    hasPostProcessData () {
      return (Object.keys(_.get(this.activeModel, 'data.info.postprocess_output', {})).length > 0)
    },
    publishModel (level) {
      console.log('publishmodel')
      this.deleteDialog = getDialog(this, 'confirm-dialog', 'publish')

      $('#publish-dialog').modal('show')
      this.deleteDialog.onConfirm = () => {
        store.dispatch('publishModel', { modelContainer: this.activeModel, domain: level })
        $('#publish-dialog').modal('hide')
      }
      // // Get a confirm dialog
      // this.deleteDialog = getDialog(this, 'confirm-dialog', 'publish')
      //
      // this.deleteDialog.onConfirm = function () {
      //   store.dispatch('publishModel', { modelContainer: this.activeModel, domain: level })
      //   this.deleteDialog.hide()
      // }.bind(this)
      //
      // We also show an extra warning in the dialog, if user chooses to remove additional files.
      this.deleteDialog.showAlert(false)
      //
      // Show the dialog:
      this.deleteDialog.show()
    },
    removeModel () {
      // Get a confirm dialog
      this.deleteDialog = getDialog(this, 'confirm-dialog', 'delete')
      console.log('removemodel')
      $('#delete-dialog').modal('show')
      this.deleteDialog.onConfirm = () => {
        console.log('delete-dialog on confirm')
        store.dispatch('deleteModel', this.activeModel)
        $('#delete-dialog').modal('hide')
      }

      // We also show an extra warning in the dialog, if user chooses to remove additional files.
      // this.deleteDialog.showAlert(false)
      //
      // // Show the dialog:
      // this.deleteDialog.show()
    },
    resetModel () {
      console.log('resetmodel')
      this.resetDialog = getDialog(this, 'confirm-dialog', 'reset')

      $('#reset-dialog').modal('show')
      this.resetDialog.onConfirm = () => {
        store.dispatch('resetModel'.this.activeModel)
        $('#reset-dialog').modal('hide')
      }
      // Get a confirm dialog
      //
      // this.resetDialog.onConfirm = function () {
      //   store.dispatch('resetModel'.this.activeModel)
      //   this.resetDialog.hide()
      // }.bind(this)
      //
      // We also show an extra warning in the dialog, if user chooses to remove additional files.
      this.resetDialog.showAlert(false)
      //
      // Show the dialog:
      this.resetDialog.show()
    },
    redoModel (entrypoint) {
      console.log('redomodel')
      this.resetDialog = getDialog(this, 'confirm-dialog', 'redo')

      $('#redo-dialog').modal('show')
      this.resetDialog.onConfirm = () => {
        store.dispatch('redoModel', { 'modelContainer': this.activeModel, 'entrypoint': entrypoint })
        $('#redo-dialog').modal('hide')
      }
      // Get a confirm dialog
      //
      // this.resetDialog.onConfirm = function () {
      //   store.dispatch('redoModel', { 'modelContainer': this.activeModel, 'entrypoint': entrypoint })
      //   this.resetDialog.hide()
      // }.bind(this)
      //
      // We also show an extra warning in the dialog, if user chooses to remove additional files.
      this.resetDialog.showAlert(false)
      //
      // Show the dialog:
      this.resetDialog.show()
    },
    startModel () {
      store.dispatch('startModel', this.activeModel)
    },
    stopModel () {
      store.dispatch('stopModel', this.activeModel)
    },
    toggle (id, doFlag) {
      if (doFlag) {
        this.selectedDownloads[id] = !this.selectedDownloads[id]
      }
    },
    doNothing () {
      return false
    },
    activateTooltips () {
      if ($("[data-toggle='tooltip']").tooltip) {
        $("[data-toggle='tooltip']").tooltip()
      }
    }
  }
}

</script>

<style lang="scss">
@import '../assets/variables.scss';

.model-details {
  table {
    margin-bottom: 0;
  }

  dl {
    margin-bottom: 0;
  }

  dd,
  dt {
    margin-bottom: ($padding / 2);

    &:last-child {
      margin-bottom: 0;
    }
  }

  img {
    margin: ($padding * 2) 0;
    max-width: 100%;
  }

  .alert {
    margin: $padding 0;
  }

  // the modal-footer btn padding should remain unaffected
  // :not(.modal-footer) {
  //   .btn {
  //     margin-bottom: $padding;
  //   }
  // }

  .btn-group {
    .btn {
      margin-right: 0;
    }
  }

  .btn-output {
    display: inline-block;
    margin-right: 4px;
  }

  .btn-pink {
    background: #faa;
    border-color: rgba(77,77,77,.2);

    &:active {
      background: #d88;
    }
  }

  .loading {
    opacity: .5;
  }

  .panel-heading {
    cursor: pointer;
  }

  .progress {
    height: 18px;
    margin-bottom: 0;
    margin-top: 1px;
  }

  .form-group {
    &.input-group {
      cursor: pointer;
    }
  }

  .not-allowed {
    color: $col-bw-4;
    cursor: not-allowed;
  }
}

</style>
