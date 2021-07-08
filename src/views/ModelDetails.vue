<template>
  <div id="template-model-details" class="model-details">
    <div v-if="activeModel !== undefined">
      <!-- model window for deletation -->
      <div class="card mb-3">
        <h5 class="card-header">{{ getActiveModelData('name') }}</h5>
        <div class="card-body">
          <dl
            class="row"
            :class="{ loading: getActiveModelData('date_created') === '' }"
          >
            <dt class="col-sm-4 text-right">Owner of run</dt>
            <dd class="col-sm-8">
              <span v-if="getActiveModelData('date_created') === ''">-</span>
              <span v-else>
                <a :href="'mailto:' + getActiveModelData('owner.email')"
                  >{{ getActiveModelData('owner.first_name') }}
                  {{ getActiveModelData('owner.last_name') }}</a
                >
              </span>
            </dd>

            <dt class="col-sm-4 text-right">Share level</dt>
            <dd class="col-sm-8">
              <span v-if="getActiveModelData('date_created') === ''">-</span
              ><span v-else>{{ shareLevelText }}</span>
            </dd>

            <dt class="col-sm-4 text-right">Created</dt>
            <dd class="col-sm-8">
              <span v-if="getActiveModelData('date_created') === ''">-</span
              ><span v-else>{{ dateCreatedText }}</span>
            </dd>

            <dt class="col-sm-4 text-right">Run environment</dt>
            <dd class="col-sm-8">
              <span v-if="getActiveModelData('date_created') === ''">-</span
              ><span v-else>Amazon</span>
            </dd>

            <dt class="col-sm-4 text-right">Updates available</dt>
            <dd class="col-sm-8">
              <template v-if="getActiveModelData('date_created') === ''">
                <span>-</span>
              </template>
              <template v-else>
                <span v-if="outdated === false">No updates available</span>
                <span v-if="outdated === true"
                  >Updates available ({{
                    getActiveModelData('outdated_changelog')
                  }})</span
                >
              </template>
            </dd>
          </dl>
          <hr />
          <dl class="row">
            <dt class="col-sm-3 text-right">Progress</dt>
            <dd class="col-sm-9">
              <div class="progress progress-incell">
                <div
                  class="progress-bar"
                  :class="`bg-${activeModel.statusLevel}`"
                  role="progressbar"
                  :aria-valuenow="getActiveModelData('progress')"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :style="'width: ' + getActiveModelData('progress') + '%'"
                  title="Progress"
                >
                  <span class="sr-only"
                    >{{ getActiveModelData('progress') }}% Complete</span
                  >
                  <span class="progress-type"
                    >{{ getActiveModelData('progress') }}%</span
                  >
                </div>
              </div>
            </dd>
            <dt class="col-sm-3 text-right">Status</dt>
            <dd class="col-sm-9">
              <span class="badge" :class="`badge-${activeModel.statusLevel}`">
                {{ getActiveModelData('state') }}
              </span>
            </dd>
            <dt class="col-sm-3 text-right">
              Simulation output:
            </dt>
            <dd class="col-sm-9 m-auto">
              <template v-if="getActiveModelData('date_created') === ''">
                <a class="btn btn-outline-secondary btn-sm mr-2" disabled>
                  File Server
                </a>
                <a class="btn btn-outline-secondary btn-sm" disabled>
                  THREDDS Data Server
                </a>
              </template>
              <template v-else>
                <a
                  class="btn btn-outline-secondary btn-sm mr-2"
                  :href="getActiveModelData('fileurl')"
                  target="_blank"
                  title="A link to the file server hosting all output files."
                >
                  File Server
                </a>
                <a
                  class="btn btn-outline-secondary btn-sm"
                  :href="
                    `/thredds/catalog/files/${getActiveModelData(
                      'suid'
                    )}/simulation/catalog.html`
                  "
                  target="_blank"
                  title="A link to the THREDDS server hosting Delft3D NetCDF output, which allows querying via OPeNDAP."
                >
                  THREDDS Data Server
                </a>
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

      <div class="card mb-3">
        <div
          class="card-header"
          data-toggle="collapse"
          data-target="#simulation-controls-collapse"
        >
          Simulation controls
        </div>
        <div id="simulation-controls-collapse" class="collapse card-body">
          <div class="card-body">
            <p :class="{ hidden: isReadOnly }">
              You can select an action to perform on this simulation:
            </p>

            <p :class="{ hidden: !isReadOnly }">
              Simulation controls are disabled for already published runs.
            </p>

            <button
              type="button"
              class="btn btn-labeled btn-spaced-right"
              id="simulation-control-start"
              @click="startModel"
              :class="[isReadOnly || !isIdle ? 'disabled' : 'btn-info']"
              :disabled="isReadOnly || !isIdle"
            >
              <span class="btn-label"
                ><i class="fa fa-fw fa-play" aria-hidden="true"></i
              ></span>
              Start</button
            >&nbsp;
            <button
              type="button"
              @click="stopModel"
              class="btn btn-labeled btn-spaced-right"
              id="simulation-control-stop"
              :class="[
                isReadOnly || (!isRunning && !isQueued)
                  ? 'disabled'
                  : 'btn-success'
              ]"
              :disabled="isReadOnly || (!isRunning && !isQueued)"
            >
              <span class="btn-label"
                ><i class="fa fa-fw fa-stop" aria-hidden="true"></i
              ></span>
              Stop</button
            >&nbsp;
            <button
              type="button"
              @click="
                updateModelBy = { name: 'reset', modelContainer: activeModel }
              "
              class="btn btn-labeled btn-spaced-right"
              id="simulation-control-stop"
              :class="[isReadOnly || !isFinished ? 'disabled' : 'btn-warning']"
              :disabled="isReadOnly || !isFinished"
            >
              <span class="btn-label"
                ><i class="fa fa-fw fa-fast-backward" aria-hidden="true"></i
              ></span>
              Reset</button
            >&nbsp;
            <div class="btn-group">
              <button
                class="btn dropdown-toggle"
                data-toggle="dropdown"
                href="#"
                :data-original-title="
                  outdated == false
                    ? 'no updates available'
                    : getActiveModelData('outdated_workflow')
                "
              >
                <span class="btn-label">
                  <i class="fa fa-fw fa-level-up" aria-hidden="true"></i
                ></span>
                Update
                <span class="caret"></span>
              </button>
              <ul
                class="dropdown-menu"
              >
                <li v-for="(entrypoint, index) in getEntrypoints" :key="index">
                  <a
                    @click="
                      updateModelBy = {
                        name: 'redo',
                        entrypoint: entrypoint,
                        modelContainer: activeModel
                      }
                    "
                    href="#"
                  >
                    {{ entrypoint }}
                  </a>
                </li>
              </ul>
            </div>
            &nbsp;
            <button
              type="button"
              class="btn btn-labeled btn-spaced-right"
              @click="
                updateModelBy = { name: 'delete', modelContainer: activeModel }
              "
              :class="[isReadOnly ? 'disabled' : 'btn-danger']"
              :disabled="isReadOnly"
            >
              <span class="btn-label"
                ><i class="fa fa-fw fa-times" aria-hidden="true"></i
              ></span>
              Delete run</button
            >&nbsp;
          </div>
        </div>
      </div>

      <div class="card mb-3">
        <div
          class="card-header"
          data-toggle="collapse"
          data-target="#share-controls-collapse"
        >
          Share controls
        </div>
        <div class="collapse" id="share-controls-collapse">
          <div class="card-body">
            <p
              v-if="
                sharedState.user.id == getActiveModelData('owner.id') &&
                  isFinished
              "
            >
              You can select who to share your results with:
            </p>
            <p
              v-if="
                sharedState.user.id == getActiveModelData('owner.id') &&
                  !isFinished
              "
            >
              When the run is finished, you can select who to share your results
              with:
            </p>
            <p v-if="sharedState.user.id != getActiveModelData('owner.id')">
              You cannot share runs owned by another user.
            </p>

            <button
              type="button"
              class="btn btn-labeled btn-outline-secondary mr-2"
              :disabled="
                !isFinished ||
                  sharedState.user.id != getActiveModelData('owner.id') ||
                  getActiveModelData('shared') == 'c' ||
                  getActiveModelData('shared') == 'w'
              "
              @click="
                updateModelBy = {
                  name: 'publish',
                  domain: 'company',
                  modelContainer: activeModel
                }
              "
            >
              <i class="fa fa-group" aria-hidden="true"></i> Share with Company
            </button>
            <button
              type="button"
              class="btn btn-labeled btn-outline-secondary"
              :disabled="
                !isFinished ||
                  sharedState.user.id != getActiveModelData('owner.id') ||
                  getActiveModelData('shared') == 'w'
              "
              @click="
                updateModelBy = {
                  name: 'publish',
                  domain: 'world',
                  modelContainer: activeModel
                }
              "
            >
              <i class="fa fa-globe" aria-hidden="true"></i> Share with World
            </button>
          </div>
        </div>
      </div>

      <div class="card mb-3">
        <div
          class="card-header"
          data-toggle="collapse"
          data-target="#viewer-collapse"
        >
          3D Viewer
        </div>
        <div class="collapse" id="viewer-collapse">
          <div class="card-body">
            <viewer-3d
              :model="activeModel.data"
              :activated="viewerActive"
            ></viewer-3d>
          </div>
        </div>
      </div>

      <div class="card mb-3">
        <div
          class="card-header"
          data-toggle="collapse"
          data-target="#generated-images-collapse"
        >
          Generated images
        </div>
        <div class="collapse" id="generated-images-collapse">
          <div class="card-body">
            <image-animation :model="activeModel.data"></image-animation>
          </div>
        </div>
      </div>

      <div class="card mb-3">
        <div
          class="card-header"
          data-toggle="collapse"
          data-target="#input-parameters-collapse"
        >
          Run input parameters
        </div>
        <div class="collapse" id="input-parameters-collapse">
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(param, key) in orderByKey(
                    getActiveModelData('parameters')
                  )"
                  :key="key"
                >
                  <td>{{ param.name || capitalizeFirst(key) }}</td>
                  <td>{{ param.value }}</td>
                  <td>{{ param.units || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card mb-3">
        <div
          class="card-header"
          data-toggle="collapse"
          data-target="#post-processing-collapse"
        >
          Post processing output
        </div>
        <div class="collapse" id="post-processing-collapse">
          <div class="card-body">
            <table class="table table-striped" v-if="hasPostProcessData()">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(param, key) in getActiveModelPPData()" :key="key">
                  <td>{{ param.name }}{{ param.name }}</td>
                  <td>
                    {{ (param.value && param.value.toExponential(2)) || '-' }}
                  </td>
                  <td>{{ param.unit || '-' }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else>No post processing output available yet.</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div
          class="card-header"
          data-toggle="collapse"
          data-target="#download-collapse"
        >
          Download files
        </div>
        <div class="collapse" id="download-collapse">
          <div class="card-body">
            <p>
              Please check what you would like to download. Your download will
              be a ZIP file which contains the requested files.
            </p>

            <div class="mx-3">
              <div class="form-group input-group">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="export_d3dinput"
                  v-model="selectedDownloads.export_d3dinput"
                />
                <label class="form-check-label" for="export_d3dinput"
                  >Delft3D: input files</label
                >
              </div>
              <div class="form-group input-group">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="export_images"
                  v-model="selectedDownloads.export_images"
                />
                <label class="form-check-label" for="export_images"
                  >Media: generated output images</label
                >
              </div>

              <div class="form-group input-group">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="export_movie"
                  v-model="selectedDownloads.export_movie"
                />
                <label class="form-check-label" for="export_movies"
                  >Media: generated output movies</label
                >
              </div>

              <div
                class="form-group input-group"
                :class="{ inputdisabled: !isFinished }"
              >
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="export_thirdparty"
                  v-model="selectedDownloads.export_thirdparty"
                />
                <label
                  v-if="!isFinished"
                  class="form-check-label"
                  for="export_thirdparty"
                  >Export: files for RMS / Petrel (will be enabled when the run
                  is 'Finished')</label
                >
                <label v-else class="form-check-label" for="export_thirdparty"
                  >Export: files for RMS / Petrel</label
                >
              </div>
            </div>

            <button
              class="btn btn-outline-secondary"
              type="button"
              id="download-submit"
              v-on:click="downloadFiles()"
              :disabled="!anyDownloadsSelected"
            >
              Download
            </button>
          </div>
        </div>
      </div>

      <!-- Confirm dialog for control checks -->
      <confirm-dialog
        v-if="updateModelBy.name"
        :confirm-button-title="capitalizeFirst(updateModelBy.name)"
        :dialogId="`confirm-${updateModelBy.name}`"
        @confirm="confirm"
      >
        <template slot="title">
          {{ capitalizeFirst(updateModelBy.name) }} model '{{
            getActiveModelData('name')
          }}'?
        </template>
        <template slot="body">
          <p>
            Are you sure you want to {{ updateModelBy.name }} this model? This
            action cannot be undone.
          </p>
        </template>
      </confirm-dialog>
    </div>

    <div v-else>
      <p class="info-secondary">
        Clicking a model will show details here.
      </p>
    </div>
    <alert-dialog
      :alertMessage="alertEvent"
    />
  </div>
</template>

<script>
import _ from 'lodash'
import store from '../store'
import ImageAnimation from '../components/ImageAnimation'
import ConfirmDialog from '../components/ConfirmDialog'
import Viewer3DComponent from '../components/Viewer3DComponent'
import AlertDialog from '@/components/AlertDialog'
import $ from 'jquery'

import { mapState } from 'vuex'

export default {
  store,
  template: '#template-model-details',
  components: {
    'image-animation': ImageAnimation,
    'confirm-dialog': ConfirmDialog,
    'viewer-3d': Viewer3DComponent,
    AlertDialog
  },
  data () {
    return {
      selectedDownloads: {
        export_d3dinput: false,
        export_images: false,
        export_movie: false,
        export_thirdparty: false
      },
      viewerActive: false,
      selectedUpdate: '',
      owner: '',
      updateModelBy: {},
      alertEvent: null
    }
  },
  created () {
    $(document).on('show.bs.collapse', '.collapse', event => {
      this.viewerActive = true
    })
  },
  computed: {
    ...mapState({
      sharedState: state => state
    }),
    activeModel: {
      cached: false,
      get () {
        var model = this.sharedState.activeModelContainer
        return model
      }
    },
    anyDownloadsSelected: {
      cache: false,
      get () {
        return _.values(this.selectedDownloads).some(el => {
          return el
        })
      }
    },
    dateCreatedText: {
      cached: false,
      get () {
        var d = new Date(_.get(this.activeModel, 'data.date_created', ''))

        if (isNaN(d.getTime())) {
          // something went wront here
          return '' // elegant fail
        }

        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
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
        return (
          _.get(this.activeModel, 'data.state', '') ===
          'Idle: waiting for user input'
        )
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
          p: 'private',
          c: 'company',
          w: 'world',
          u: 'updating'
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
          return `${this.activeModel.data.versions.preprocess.REPOS_URL}?p=${
            this.activeModel.data.versions.preprocess.SVN_REV
          }`
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
    }
  },
  methods: {
    capitalizeFirst (text) {
      if (typeof text === 'string') {
        // Capitalize the first letter in a string
        return `${text.charAt(0).toUpperCase()}${text.slice(1)}`
      }
    },
    orderByKey (obj) {
      // Function to order a object alphabetically
      if (typeof obj === 'object') {
        var ordered = {}
        const objKeys = Object.keys(obj)
        const sortedKeys = objKeys.sort()
        sortedKeys.forEach(key => {
          ordered[key] = obj[key]
        })
        return ordered
      }
    },
    getActiveModelData (key) {
      const data = _.get(this.activeModel, `data.${key}`)
      return data
    },
    getActiveModelPPData () {
      // TODO: This needs to come from the backend/database not hardcoded in FE
      let rv = {
        DeltaTopD50: {
          name: 'D50 for Delta Top',
          unit: 'mm',
          value: undefined
        },
        DeltaTopsand_fraction: {
          name: 'Sand Fraction for Delta Top',
          unit: '%',
          value: undefined
        },
        DeltaTopsorting: {
          name: 'Sorting for Delta Top',
          unit: '-',
          value: undefined
        },
        DeltaFrontD50: {
          name: 'D50 for Delta Front',
          unit: 'mm',
          value: undefined
        },
        DeltaFrontsand_fraction: {
          name: 'Sand Fraction for Delta Front',
          unit: '%',
          value: undefined
        },
        DeltaFrontsorting: {
          name: 'Sorting for Delta Front',
          unit: '-',
          value: undefined
        },
        ProDeltaD50: {
          name: 'D50 for Prodelta',
          unit: 'mm',
          value: undefined
        },
        ProDeltasand_fraction: {
          name: 'Sand Fraction for Prodelta',
          unit: '%',
          value: undefined
        },
        ProDeltasorting: {
          name: 'Sorting for Prodelta',
          unit: '-',
          value: undefined
        }
      }
      let ppJson = _.get(
        this.activeModel,
        'data.info.postprocess_output.files.output'
      )
      _.each(_.keys(rv), key => {
        if (_.endsWith(key, '_fraction')) {
          rv[key].value = parseFloat(_.get(ppJson, key)) * 100 // fractions are in percentages
        } else {
          rv[key].value = _.get(ppJson, key)
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

      const url = `api/v1/scenes/${id}/export/?format=json&${downloadOptions.join('&')}`
      fetch(url)
        .then((resp) => {
          if (resp.status !== 200) {
            this.alertEvent = {
              message: 'Download not allowed for this account. For more information and rights contact <a href = "mailto: delft3d-gt-support@deltares.nl">Delft3D-GT Support</a>',
              showTime: 5000,
              type: 'warning'
            }
          } else {
            window.open(url)
          }
        })
        .catch(() => {
          this.alertEvent = {
            message: 'Download not allowed for this account. For more information and rights contact <a href = "mailto: delft3d-gt-support@deltares.nl">Delft3D-GT Support</a>',
            showTime: 5000,
            type: 'warning'
          }
        })
    },
    hasPostProcessData () {
      // Check if files in postprocess_output is not empty
      return (
        Object.keys(
          _.get(this.activeModel, 'data.info.postprocess_output.files', {})
        ).length > 0
      )
    },
    confirm () {
      const updateModel = store.dispatch(`${this.updateModelBy.name}Model`, this.updateModelBy)
      console.log(updateModel)
      this.updateModelBy = {}
    },
    startModel () {
      store.dispatch('startModel', this.activeModel)
    },
    stopModel () {
      store.dispatch('stopModel', this.activeModel)
    },
    doNothing () {
      return false
    }
  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';
</style>
