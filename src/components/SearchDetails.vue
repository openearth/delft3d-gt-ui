<template>
<div class="search-details">
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
          <select v-model="selectedDomains" id="domain" class="select-picker form-control" title="Choose publication domain..." multiple data-selected-text-format="count > 3" data-actions-box="true">
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
        <div class="panel panel-default panel-search">
          <div class="panel-heading panel-collapse-header" data-toggle="collapse" data-parent="#template-datetimes" href="#template-datetimes" aria-expanded="true" aria-controls="template-collapse">
            Dates &amp; Times
          </div>
          <div class="panel-body panel-collapse collapse" role="tabpanel" aria-labelledby="template-datetimes" id="template-datetimes">
            <div class="form-group" :class="{ 'has-error': !createdAfterValid }">
              <label class="control-label">Created after</label>
              <div class="input-group date input-group-sm" data-provide="datepicker" data-date-format="yyyy-mm-dd">
                <input type="text" class="form-control datepicker" id="created_after" placeholder="yyyy-mm-dd" v-model="createdAfter" todayHighlight>
                <span class="input-group-btn">
                  <button class="btn btn-default button-empty-input-field" type="button">
                    <i class="fa fa-times" aria-hidden="true"></i>
                  </button>
                </span>
              </div>
            </div>
            <div class="form-group" :class="{ 'has-error': !createdBeforeValid }">
              <label class="control-label">Created before</label>
              <div class="input-group date input-group-sm" data-provide="datepicker" data-date-format="yyyy-mm-dd">
                <input type="text" class="form-control datepicker" id="created_before" placeholder="yyyy-mm-dd" v-model="createdBefore" todayHighlight>
                <span class="input-group-btn">
                  <button class="btn btn-default button-empty-input-field" type="button">
                    <i class="fa fa-times" aria-hidden="true"></i>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="panel panel-default panel-search">
          <div class="panel-heading panel-collapse-header" data-toggle="collapse" data-parent="#template-versions" href="#template-versions" aria-expanded="true" aria-controls="template-collapse">
            Updates available
          </div>
          <div class="panel-body panel-collapse collapse" role="tabpanel" aria-labelledby="template-versions" id="template-versions">
            <div class="form-group">
              <select id="outdated" title="Choose updates..." class="select-picker form-control" data-container="body" v-model="selectedOutdated" multiple>
                <option data-content="No updates available">false</option>
                <option data-content="Updates available">true</option>
              </select>
            </div>
          </div>
        </div>
        <!-- Dynamically generated HTML using incoming template from API -->

        <!-- Variables -->

        <div v-for="(section, index) in searchTemplate.sections" v-show="searchTemplate" :key="index">
          <div class="panel panel-default panel-search">
            <div class="panel-heading panel-collapse-header" data-toggle="collapse" :data-parent="'#template-' + index" :href="'#template-' + index" aria-expanded="true" aria-controls="template-collapse">
              {{section.name}}
            </div>
            <div class="panel-body panel-collapse collapse" role="tabpanel" :aria-labelledby="'template-' + index" :id="'template-' + index">
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
                          <input type="text" class="bootstrap-slider" :id="variable.id" data-slider-step="0.01" :data-slider-min="variable.validators.min" :data-slider-max="variable.validators.max" v-model="selectedParameters['variable.id']" />
                        </template>

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
        <div class="panel panel-default panel-search">
          <div class="panel-heading panel-collapse-header" data-toggle="collapse" data-parent="#template-postprocess" href="#template-postprocess" aria-expanded="true" aria-controls="template-collapse">
            Post-processing output
          </div>
          <div class="panel-body panel-collapse collapse" role="tabpanel" aria-labelledby="template-postprocess" id="template-postprocess">
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['DeltaTopD50']">
                D50 for delta top (mm)
              </label>
              <input type="text"
                id="DeltaTopD50"
                v-model="selectedPostProc['DeltaTopD50']"
                class="bootstrap-slider"
                data-slider-step="0.01"
                data-slider-min="0"
                data-slider-max="2"
                data-slider-value="[0, 2]"
                data-slider-ticks-labels='["0", "2"]'
                data-slider-ticks="[0, 2]"
                data-slider-tooltip="always"
                />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['DeltaTopsand_fraction']">
                Sand fraction for delta top (%)
              </label>
              <input type="text"
                id="DeltaTopsand_fraction"
                v-model="selectedPostProc['DeltaTopsand_fraction']"
                data-provide="slider"
                class="bootstrap-slider"
                data-slider-step="1"
                data-slider-min="0"
                data-slider-max="100"
                data-slider-value="[0, 100]"
                data-slider-ticks-labels='["0", "100"]'
                data-slider-ticks="[0, 100]"
                data-slider-tooltip="always"
                />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['DeltaTopsorting']">
                  Sorting for delta top (-)
                </label>
              <input type="text"
                id="DeltaTopsorting"
                v-model="selectedPostProc['DeltaTopsorting']"
                class="bootstrap-slider"
                data-slider-step="0.1"
                data-slider-min="0"
                data-slider-max="10"
                data-slider-value="[0, 10]"
                data-slider-ticks-labels='["0", "10"]'
                data-slider-ticks="[0, 10]"
                data-slider-tooltip="always"
                />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['DeltaFrontD50']">
                D50 for delta front (mm)
              </label>
              <input type="text"
                id="DeltaFrontD50"
                v-model="selectedPostProc['DeltaFrontD50']"
                class="bootstrap-slider"
                data-slider-step="0.01"
                data-slider-min="0"
                data-slider-max="2"
                data-slider-value="[0, 2]"
                data-slider-ticks-labels='["0", "2"]'
                data-slider-ticks="[0, 2]"
                data-slider-tooltip="always"
                @slide-stop="search" />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['DeltaFrontsand_fraction']">
                Sand fraction for delta front (%)
              </label>
              <input type="text"
                id="DeltaFrontsand_fraction"
                v-model="selectedPostProc['DeltaFrontsand_fraction']"
                class="bootstrap-slider"
                data-slider-step="0.01"
                data-slider-min="0"
                data-slider-max="1"
                data-slider-value="[0, 1]"
                data-slider-ticks-labels='["0", "1"]'
                data-slider-ticks="[0, 1]"
                data-slider-tooltip="always" />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['DeltaFrontsorting']">
                Sorting for delta front (-)
              </label>
              <input type="text"
                id="DeltaFrontsorting"
                v-model="selectedPostProc['DeltaFrontsorting']"
                class="bootstrap-slider"
                data-slider-step="0.1"
                data-slider-min="0"
                data-slider-max="10"
                data-slider-value="[0, 10]"
                data-slider-ticks-labels='["0", "10"]'
                data-slider-ticks="[0, 10]"
                data-slider-tooltip="always" />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['ProDeltaD50']">
                D50 for prodelta (mm)
              </label>
              <input type="text"
                id="ProDeltaD50"
                v-model="selectedPostProc['ProDeltaD50']"
                class="bootstrap-slider"
                data-slider-step="0.01"
                data-slider-min="0"
                data-slider-max="2"
                data-slider-value="[0, 2]"
                data-slider-ticks-labels='["0", "2"]'
                data-slider-ticks="[0, 2]"
                data-slider-tooltip="always"  />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['ProDeltasand_fraction']">
                Sand fraction for prodelta (%)
              </label>
              <input type="text"
                id="ProDeltasand_fraction"
                v-model="selectedPostProc['ProDeltasand_fraction']"
                class="bootstrap-slider"
                data-slider-step="0.01"
                data-slider-min="0"
                data-slider-max="1"
                data-slider-value="[0, 1]"
                data-slider-ticks-labels='["0", "1"]'
                data-slider-ticks="[0, 1]"
                data-slider-tooltip="always"
                 />
            </div>
            <div class="form-group">
              <label class="control-label">
                <input type="checkbox" v-model="activatedPostProc['ProDeltasorting']">
                Sorting for prodelta (-)
              </label>
              <input type="text"
                id="ProDeltasorting"
                v-model="selectedPostProc['ProDeltasorting']"
                class="bootstrap-slider"
                data-slider-step="0.1"
                data-slider-min="0"
                data-slider-max="10"
                data-slider-value="[0, 10]"
                data-slider-ticks-labels='["0", "10"]'
                data-slider-ticks="[0, 10]"
                data-slider-tooltip="always" />
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
import Slider from  'bootstrap-slider/dist/bootstrap-slider'

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
      createdAfter: '',
      createdBefore: '',
      searchTemplate: null,
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

      this.postProc = [ {
        activated: false,
        min: 0,
        max: 2,
        value: [0, 2],
        labels: '["0", "2"]'
      }

      ]
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

      this.$root.$broadcast('show-alert', {
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
    initializeForm () {
      // once the dom is updated, update the select pickers by hand
      // template data is computed into modelEngine
      var that = this
      var pickers = $('.select-picker')

      if (pickers.selectpicker !== undefined) {
        pickers.selectpicker('refresh')
      }

      // Domain selection boxes - enable all.
      $(".domain-selection-box input[type='checkbox']").prop('checked', 'checked')

      const slider = $('.bootstrap-slider').slider()
      console.log(slider)



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

      // Set event handlers for search collapsibles.
      $('.panel-search').on('show.bs.collapse', () => {
        $(this).find('.glyphicon-triangle-right').removeClass('glyphicon-triangle-right').addClass('glyphicon-triangle-bottom')
      })

      $('.panel-search').on('hide.bs.collapse', () => {
        $(this).find('.glyphicon-triangle-bottom').removeClass('glyphicon-triangle-bottom').addClass('glyphicon-triangle-right')
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
      console.log('searching')
      var params = this.buildParams()

      store.dispatch('updateParams', params)
      store.dispatch('update')
    }
  }
}
</script>

<style>
@import '~bootstrap-slider/dist/css/bootstrap-slider.css';
@import '../assets/variables.scss';

.slider {
  margin-bottom: 28px;
  margin-top: 28px;
}
.bootstrap-datetimepicker-widget {
    height: 255px;
}
.search-details {
    .panel {
        margin-bottom: $padding;
    }
    .panel-body {
        padding: 0;
    }
    .panel-collapse {
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
</style>
