<template>
<div class="search-details">
  <input class='ion-range' />
  <!-- disable if we don't have a searchTemplate -->
  <div v-if="searchTemplate">
    <form @change="search" @input="search">
      <div class="panel-group" id="run-accordion" role="tablist" aria-multiselectable="true">
        <div class="form-group clear-left">
          <div class="input-group input-group-sm ">
            <input type="text" class="form-control" id="search" placeholder="Search name..." v-model="searchText" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-btn">
              <button class="btn btn-default button-empty-input-field" type="button">
                <i class="fa fa-times" aria-hidden="true"></i>
              </button>
            </span>
          </div>
        </div>
        <div class="form-group">
          <select v-model="selectedDomains" id="domain" class="selectpicker form-control" title="Choose publication domain..." multiple data-selected-text-format="count > 3" data-actions-box="true">
            <option data-content="<i class='fa fa-fw fa-user aria-hidden='true'></i> Private">
              private
            </option>
            <option data-content="<i class='fa fa-fw fa-users' aria-hidden='true'></i> Company">
              company
            </option>
            <option data-content="<i class='fa fa-fw fa-globe' aria-hidden='true'></i> Public">
              public
            </option>
          </select>
        </div>
        <div class="card panel-search mb-3">
          <div class="card-header" data-toggle="collapse" data-target="#template-datetimes">
            Dates &amp; Times
          </div>
          <div class="card-body collapse" role="tabpanel" aria-labelledby="template-datetimes" id="template-datetimes">
            <div class="form-group" :class="{ 'has-error': !createdAfterValid }">
              <label class="control-label">Created after</label>
              <div class="input-group date input-group-sm" data-provide="datepicker" data-date-format="yyyy-mm-dd">
                <input type="text" class="form-control datepicker" ref="created_after" id="created_after" placeholder="yyyy-mm-dd" @click="addCreatedAfterListener">
                <span class="input-group-append">
                  <button class="btn btn-outline-secondary button-empty-input-field" type="button">
                    <i class="fa fa-calendar" aria-hidden="true"></i>
                  </button>
                </span>
              </div>
            </div>
            <div class="form-group" :class="{ 'has-error': !createdBeforeValid }">
              <label class="control-label">Created before</label>
              <div class="input-group date input-group-sm" data-provide="datepicker" data-date-format="yyyy-mm-dd" >
                <input type="text" class="form-control datepicker" ref="created_before" id="created_before" placeholder="yyyy-mm-dd" @click="addCreatedBeforeListener">
                <span class="input-group-append">
                  <button class="btn btn-outline-secondary button-empty-input-field" type="button">
                    <i class="fa fa-calendar" aria-hidden="true"></i>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="card panel-search mb-3">
          <div class="card-header" data-toggle="collapse" data-target="#template-versions">
            Updates available
          </div>
          <div class="card-body collapse" id="template-versions">
            <div class="form-group">
              <select id="outdated" title="Choose updates..." class="selectpicker form-control" data-container="body" v-model="selectedOutdated" multiple>
                <option data-content="No updates available">false</option>
                <option data-content="Updates available">true</option>
              </select>
            </div>
          </div>
        </div>
        <!-- Dynamically generated HTML using incoming template from API -->

        <!-- Variables -->

        <div v-for="(section, index) in searchTemplate.sections" v-show="searchTemplate" :key="index">
          <div class="card panel-search mb-3">
            <div class="card-header" data-toggle="collapse" :data-target="'#template-' + index">
              {{section.name}}
            </div>
            <div class="card-body collapse" :id="'template-' + index">
              <div v-for="(variable, index) in section.variables" :key="index">
                <template v-if="variable.name !== 'Name'">
                  <div class="form-group">
                    <!-- Name should be excluded: already included above -->
                    <label class="control-label" :for="variable.id">{{ variable.name }}: <span v-if="variable.units">({{ variable.units }})</span></label>
                    <div :class="{ numeric: variable.type === 'numeric' }">
                      <!-- two types of input for now: textarea and other -->
                      <!-- other first -->
                      <template v-if="variable.type !== 'textarea'">
                        <!-- the 0.01 makes the floating point values work -->
                        <template v-if="variable.type === 'numeric'">
                          <input type="text" class="ion-range" :id="variable.id" data-step="0.01" :data-min="variable.validators.min" :data-max="variable.validators.max" data-type="double" v-model="selectedParameters['variable.id']" /> </template>

                        <template v-if="variable.type === 'select' && !variable.factor">
                          <div class="form-group">
                            <select class="select-picker form-control" multiple :id="variable.id" data-selected-text-format="count > 3" data-actions-box="true" data-container="body">
                              <option v-for="(option, index) in variable.options" :value="option.value" :key="index">
                                {{ option.text }}
                              </option>
                            </select>
                          </div>
                        </template>
                        <template v-if="variable.type !== 'numeric' && variable.type !== 'select'">
                          <div class="input-group">
                            <input :type="variable.type" class="form-control" :id="variable.id" value="" v-model="selectedParameters['variable.id']" />
                            <span class="input-group-btn">
                              <button class="btn btn-default button-empty-input-field" type="button">
                                <i class="fa fa-times" aria-hidden="true"></i>
                              </button>
                            </span>
                          </div>
                        </template>

                      </template>

                      <!-- text area -->
                      <template v-if="variable.type === 'textarea'">
                        <textarea class="form-control" rows="3" v-model="selectedParameters['variable.id']"></textarea>
                      </template>

                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="card panel-search mb-3">
          <div class="card-header" data-toggle="collapse" data-target="#template-postprocess">
            Post-processing output
          </div>
          <div class="card-body collapse" id="template-postprocess">
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['DeltaTopD50']">
                D50 for delta top (mm)
              </label>
              <input type="text" id="DeltaTopD50" v-model="selectedPostProc['DeltaTopD50']" class="ion-range" data-step="0.01" data-min="0" data-max="2" data-type="double" />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['DeltaTopsand_fraction']">
                Sand fraction for delta top (%)
              </label>
              <input type="text" id="DeltaTopsand_fraction" v-model="selectedPostProc['DeltaTopsand_fraction']" class="ion-range" data-step="1" data-min="0" data-max="100" data-type="double" />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['DeltaTopsorting']">
                Sorting for delta top (-)
              </label>
              <input type="text" id="DeltaTopsorting" v-model="selectedPostProc['DeltaTopsorting']" class="ion-range" data-step="0.1" data-min="0" data-max="10" data-type="double" />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['DeltaFrontD50']">
                D50 for delta front (mm)
              </label>
              <input type="text" id="DeltaFrontD50" v-model="selectedPostProc['DeltaFrontD50']" class="ion-range" data-step="0.01" data-min="0" data-max="2" data-type="double" />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['DeltaFrontsand_fraction']">
                Sand fraction for delta front (%)
              </label>
              <input type="text" id="DeltaFrontsand_fraction" v-model="selectedPostProc['DeltaFrontsand_fraction']" class="ion-range" data-step="0.01" data-min="0" data-max="1" data-type="double" />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['DeltaFrontsorting']">
                Sorting for delta front (-)
              </label>
              <input type="text" id="DeltaFrontsorting" v-model="selectedPostProc['DeltaFrontsorting']" class="ion-range" data-step="0.1" data-min="0" data-max="10" data-type="double" />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['ProDeltaD50']">
                D50 for prodelta (mm)
              </label>
              <input type="text" id="ProDeltaD50" v-model="selectedPostProc['ProDeltaD50']" class="ion-range" data-step="0.01" data-min="0" data-max="2" data-type="double" />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['ProDeltasand_fraction']">
                Sand fraction for prodelta (%)
              </label>
              <input type="text" id="ProDeltasand_fraction" v-model="selectedPostProc['ProDeltasand_fraction']" class="ion-range" data-step="0.01" data-min="0" data-max="1" data-type="double" />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['ProDeltasorting']">
                Sorting for prodelta (-)
              </label>
              <input type="text" id="ProDeltasorting" v-model="selectedPostProc['ProDeltasorting']" class="ion-range" data-step="0.1" data-min="0" data-max="10" data-type="double" />
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</div>
</template>

<script>
import store from '../store'
import $ from 'jquery'
import _ from 'lodash'
import moment from 'moment'
// eslint-disable-next-line
import ionRangeSlider from 'ion-rangeslider'

import {
  fetchSearchTemplate
} from '../templates.js'
import {
  bus
} from '@/event-bus.js'

export default {
  store,
  template: '#template-search-details',
  data () {
    return {
      activatedPostProc: {},
      searchTemplate: null,
      createdAfter: '',
      createdBefore: '',
      searchText: '',
      selectedDomains: [],
      selectedOutdated: [],
      selectedParameters: [],
      selectedPostProc: {},
      selectedTemplates: [],
      selectedUsers: [],
      users: []
    }
  },

  mounted () {
    bus.$on('clearSearch', () => {
      this.createdAfter = ''
      this.createdBefore = ''
      this.searchText = ''
      this.selectedDomains = []
      this.selectedParameters = {}
      this.selectedTemplates = []
      this.selectedUsers = []
      this.selectedOutdated = []
      this.activatedPostProc = {
        'ProDeltaD50': false,
        'DeltaFrontD50': false,
        'DeltaTopD50': false,
        'ProDeltaSandFraction': false,
        'DeltaFrontSandFraction': false,
        'DeltaTopSandFraction': false,
        'ProDeltasorting': false,
        'DeltaFrontsorting': false,
        'DeltaTopsorting': false
      }

      this.selectedPostProc = {
        'ProDeltaD50': '01',
        'DeltaFrontD50': '01',
        'DeltaTopD50': '01',
        'ProDeltaSandFraction': '0100',
        'DeltaFrontSandFraction': '0100',
        'DeltaTopSandFraction': '0100',
        'ProDeltasorting': '-1010',
        'DeltaFrontsorting': '-1010',
        'DeltaTopsorting': '-1010'
      }

      this.search()
    })
    // should be initialised with values: it needs values when post processing search is activated
    this.selectedPostProc = {
      'DeltaTopD50': '02',
      'DeltaTopsand_fraction': '0100',
      'DeltaTopsorting': '010',
      'DeltaFrontD50': '02',
      'DeltaFrontsand_fraction': '0100',
      'DeltaFrontsorting': '010',
      'ProDeltaD50': '02',
      'ProDeltasand_fraction': '0100',
      'ProDeltasorting': '010'
    }

    // set store failedUpdate handling
    store.state.failedUpdate = (jqXhr) => {
      console.error(jqXhr)

      let status = jqXhr.statusText || 'error'
      let response = jqXhr.responseText || jqXhr.responseJson || 'An error occurred.'

      this.$emit('show-alert', {
        message: status + ': ' + response,
        showTime: 3000,
        type: 'danger'
      })
    }

    // get search templates
    Promise.all([store.dispatch('fetchUser'), fetchSearchTemplate()])
      .then((jsons) => {
        var users = jsons[0]
        var template = jsons[1]

        // store them
        this.users = _.sortBy(users, ['last_name', 'first_name'])
        this.searchTemplate = template

        // after we're done loading the templates in the dom, start searching.
        this.$nextTick(
          () => {
            // update ui
            this.initializeForm()

            // update the search results
            this.search()

            // as soon as this component is loaded we can start to sync models
            // startSyncModels()
          }
        )
      })
  },

  computed: {
    modelEngines: {
      get () {
        // flatten variables
        var variables = _.flatMap(_.flatMap(this.templates, 'sections'), 'variables')

        // lookup all variables with id engine (convention)
        var engines = _.filter(variables, ['id', 'engine'])

        // lookup default values (filter on model/scenarios later)
        var defaultEngines = _.uniq(_.map(engines, 'default'))

        return defaultEngines
      }
    },
    parameters: {
      get () {
        var parameters = {}
        var variables = _.flatMap(
          _.flatMap(this.templates, 'sections'),
          'variables'
        )

        variables.forEach((variable) => {
          if (_.has(variable, 'validators.min') && _.has(variable, 'validators.max')) {
            // create parameter info for forms
            var obj = {
              id: variable.id,
              min: _.get(variable, 'validators.min'),
              max: _.get(variable, 'validators.max')
            }

            parameters[variable.id] = obj
          }
        })
        return parameters
      }
    },
    createdAfterValid: {
      get () {
        return this.createdAfter === '' || moment(this.createdAfter, 'YYYY-MM-DD', true).isValid()
      }
    },
    createdBeforeValid: {
      get () {
        return this.createdBefore === '' || moment(this.createdBefore, 'YYYY-MM-DD', true).isValid()
      }
    }
  },

  watch: {
    activatedPostProc () {
      this.search()
    },
    createdAfter () {
      this.search()
    },
    createdBefore () {
      this.search()
    },
    searchTemplate () {
      this.search()
    },
    searchText () {
      this.search()
    },
    selectedDomains () {
      this.search()
    },
    selectedParameters () {
      this.search()
    },
    selectedPostProc () {
      this.search()
    },
    selectedTemplates () {
      this.search()
    },
    selectedUsers () {
      this.search()
    },
    selectedOutdated () {
      this.search()
    },
    users () {
      this.search()
    }
  },

  methods: {
    addCreatedAfterListener () {
      this.$refs.created_after.onchange = (e) => {
        this.createdAfter = e.target.value
      }
    },
    addCreatedBeforeListener () {
      this.$refs.created_before.onchange = (e) => {
        this.createdBefore = e.target.value
      }
    },
    initializeForm () {
      // once the dom is updated, update the select pickers by hand
      // template data is computed into modelEngine
      var that = this
      var pickers = $('.selectpicker')

      if (pickers.selectpicker !== undefined) {
        pickers.selectpicker('refresh')
      }

      // Domain selection boxes - enable all.
      $(".domain-selection-box input[type='checkbox']").prop('checked', 'checked')

      /* eslint-disable camelcase */
      if ($('.ion-range').ionRangeSlider !== undefined) {
        $('.ion-range').ionRangeSlider({
          skin: 'round',
          force_edges: true,
          onFinish: () => {
            // args: data, not used
            this.search()
          }
        })
      }
      /* eslint-enable camelcase */

      // slider.forEach(slide => {
      //   slide.on('slideStop', this.search)
      // }

      // Add event handler that allows one to use the X next to inputs to clear the input.
      $('.button-empty-input-field').on('click', () => {
        var input = $(this).closest('.input-group').find('input')

        // Force update selected parameters.
        // Quick fix for selected parameter, should be a parameter later.
        var id = input.attr('id')

        if (id === 'search') {
          that.searchText = ''
        } else if (id === 'created_before') {
          that.createdBefore = ''
        } else if (id === 'created_after') {
          that.createdAfter = ''
        } else {
          that.selectedParameters[id] = ''
        }
        // Search up to the div, and then find the input child. This is the actual input field.
        that.search()
      })
    },
    buildParams () {
      // for now we just copy everything

      /* eslint-disable camelcase */
      var params = {
        search: this.searchText,
        shared: this.selectedDomains,
        template: this.selectedTemplates,
        users: this.selectedUsers
      }

      if (this.selectedOutdated.length === 1) { // filter should only be applied if one of the two options is selected
        params.outdated = this.selectedOutdated[0]
      }

      if (this.createdBeforeValid) {
        params.created_before = this.createdBefore
      }
      if (this.createdAfterValid) {
        params.created_after = this.createdAfter
      }
      /* eslint-enable camelcase */

      // serialize the post-processing params
      var paramArray = _.map(
        this.selectedParameters,
        (value, key) => {
          var result = ''

          if (_.isString(value) && _.includes(value, '')) {
            // replace  by , =>  key,min,max
            // Breaks if someone uses  in values (these originate from tags)
            result = key + ',' + _.replace(value, '', ',')
          } else {
            // replace  by , =>  key,value
            result = key + ',' + value
          }

          return result
        }
      )

      var postProcArray = _.map(
        this.selectedPostProc,
        (value, key) => {
          if (this.activatedPostProc[key]) {
            if (_.endsWith(key, '_fraction')) {
              return key + ',' + _.join(_.map(_.split(value, ''), (d) => {
                return d / 100
              }), ',')
            } else {
              return key + ',' + _.replace(value, '', ',')
            }
          }
          return ''
        }
      )

      _.pullAll(postProcArray, [''])
      params.parameter = _.merge(paramArray, postProcArray)

      return params
    },
    search () {
      var params = this.buildParams()
      store.dispatch('updateParams', params)
      store.dispatch('update')
    }
  }
}
</script>

<style>
@import '../assets/variables.scss';

.slider {
  margin-bottom: 28px;
  margin-top: 28px;
}

.bootstrap-datetimepicker-widget {
  height: 255px;
}

.search-details {
  . {
    .pull-right {
      margin: 0;
    }

    .form-group {
      margin-bottom: 0;
      padding: $padding;
    }

    .numeric {
      padding-bottom: $padding;
    }
  }
}

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
</style>
