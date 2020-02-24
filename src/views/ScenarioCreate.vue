<template>
<div id="template-scenario-builder">
  <div class="scenario-builder full-height">
    <!-- User has to select a template first -->
    <div class="container-fluid full-height scrollable" id="below-tool-bar">
      <div class="row">
        <!-- 2 column layout, 1st column scenario properties -->
        <div class="col-sm-5">
          <!--  -->
          <div class="row" v-if="availableTemplates.length">
            <div class="col-sm-12">
              <div class="form-group ">
                <label for="select-template">Select a template</label>
                <select class="combobox form-control" v-model="template" id="select-template" :onchange="selectTemplate(template)">
                  <option v-for="(template, index) in availableTemplates" :value="template" :key="index">
                    {{ template.name }}
                  </option>
                  <option value="" disabled>
                    more templates will be added in the future...
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- if user selected something, show GUI -->
          <!-- There is also an option for an async components if one needs to load data at component instantiation. TODO: convert component. -->
          <div v-if="template && dataLoaded">
            <div>
              <form novalidate>
                <div v-for="(section, index) in scenarioConfig.sections" :key="index">
                  <div class="panel panel-default">

                    <div class="panel-heading">
                      <h3 class="panel-title">{{section.name}}</h3>
                    </div>

                    <div class="panel-body">

                      <!-- ===== DUMMY FEATURES START ===== -->
                      <template v-if="section.name === 'Simulation settings'">
                        <div class="form-group">
                          <label class="control-label" for="run-env">
                            Run environment
                          </label>
                          <!-- TODO: get rid of this space -->
                          <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="right" title="Specifies where the simulations are hosted."></span>
                          <div class="input-group">
                            <select class="form-control" id="run-env">
                              <option selected>Amazon</option>
                              <option disabled>Nerdalize (disabled: this feature will be added in future versions)</option>
                              <option disabled>H6 cluster (disabled: this feature will be added in future versions)</option>
                              <option disabled>local (disabled: this feature will be added in future versions)</option>
                            </select>
                          </div>
                        </div>
                        <div class="form-group">
                          <label class="control-label" for="run-env">
                            Delft3D Version
                          </label>
                          <!-- TODO: get rid of this space -->
                          <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="right" title="Specifies the Delft3D version used for simulation."></span>
                          <div class="input-group">
                            <select class="form-control" id="run-env">
                              <option selected>Deltares, Delft3D Flexible Mesh Version 1.2.0.61839</option>
                              <option disabled>Deltares, Delft3D Flexible Mesh Suite (disabled: this feature will be added in future versions)</option>
                            </select>
                          </div>
                        </div>
                      </template>
                      <!-- =====  DUMMY FEATURES END  ===== -->
                      <div class="form-group" v-for="(variable, index) in section.variables" :key="index">
                        <label class="control-label" :for="variable.id">
                          {{ variable.name }}
                        </label>
                        <span v-if="variable.description" class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="right" :title="variable.description"></span>

                        <span v-if="variable.validators.min !== undefined">
                          [{{ variable.validators.min }} - {{ variable.validators.max }}]
                        </span>

                        <span v-if="variable.type === 'select'">
                          {<span v-for="(i, option) in variable.options" :key="option">{{ option.text}}<span v-if="i < variable.options.length - 1">, </span></span>}
                        </span>
                        <div class="input-group">
                          <!-- numeric, text, semver or factor are inputs-->
                          <template v-if="isInput(variable) ">
                            <input
                            :type="variable.type"
                            class="form-control"
                            :id="variable.id"
                            :data-role="variable.factor ? 'tagsinput' : ''"
                            v-model="variable.value"
                            :disabled="variable.disabled"
                            :field="getId(variable)"
                            v-validate="variable.validators"
                            :class="{'input': true, 'is-danger': errors.has(variable.name) }"
                            :name="variable.name"
                            />
                            <span v-show="errors.has(variable.name)"  class="help is-danger">{{ errors.first(variable.name) }}</span>
                          </template>
                          <!-- select if not form -->
                          <template v-if="variable.type === 'select' && !variable.factor">
                            <select
                              class="form-control select-picker"
                              :id="variable.id"
                              v-model="variable.value"
                              :field="getId(variable)"
                              v-validate="variable.validators"
                              multiple="multiple"
                              :name="variable.name"
                              >
                              <option
                                v-for="(i, option) in variable.options"
                                :value="option.value"
                                :key="option"
                                >
                                {{ option.text }}
                              </option>
                            </select>
                            <span v-show="errors.has(variable.name)"  class="help is-danger">{{ errors.first(variable.name) }}</span>
                          </template>
                          <!-- text area -->
                          <template
                            v-if="variable.type === 'textarea'"
                            >
                            <textarea
                            class="form-control"
                            rows="3"
                            :disabled="variable.disabled"
                            :field="getId(variable)"
                            v-validate="variable.validators"
                            v-model="variable.value"
                            :name="variable.name"
                            ></textarea>
                            <span v-show="errors.has(variable.name)"  class="help is-danger">{{ errors.first(variable.name) }}</span>
                          </template>
                          <!-- date -->
                          <template
                            v-if="variable.type === 'date'"
                            >
                            <div
                              class="input-group date"
                              data-provide="datepicker"
                              data-date-format="yyyymmdd"
                              todayHighlight
                              >
                                <input
                                class="form-control date"
                                v-model="variable.value"
                                :field="getId(variable)"
                                v-validate="variable.validators"
                                :name="variable.name"
                                />
                              <div class="input-group-addon">
                                <span class="glyphicon glyphicon-th"></span>
                              </div>
                              <span v-show="errors.has(variable.name)"  class="help is-danger">{{ errors.first(variable.name) }}</span>
                            </div>
                          </template>
                          <!-- bbox array -->
                          <template
                            v-if="variable.type === 'bbox-array'"
                            >
                            <input
                            type="text"
                            :id="variable.id"
                            class="form-control"
                            :field="getId(variable)"
                            v-model="bbox"
                            v-validate="variable.validations"
                            :name="variable.name"
                            readonly
                            />
                            <span v-show="errors.has(variable.name)"  class="help is-danger">{{ errors.first(variable.name) }}</span>
                        </template>

                          <!-- if we add this to 1 we need to add it to all, bug in bootstrap -->
                          <span class="input-group-addon" v-if="variable.units !='-'" >
                            {{ variable.units || '-' }}
                          </span>
                        </div>
                        <!-- <p class="help-block has-error" v-if="!validbbox
                          && variable.type === 'bbox-array'">
                          Zoom to a bounding box on the map with less than 10 locations.
                        </p>
                        <div v-if="$validation[getId(variable)]">
                          <p  v-if="$validation[getId(variable)].required"
                            class="help-block has-error">
                            This field cannot be left empty.
                          </p>
                          <div v-if="$validation[getId(variable)]">
                            <p  v-if="$validation[getId(variable)].required"
                              class="help-block has-error">
                              This field cannot be left empty.
                            </p>
                            <template  v-if="$validation[getId(variable)].min
                              && !$validation[getId(variable)].required
                              && variable.type === 'numeric'">
                              <div
                                v-for="input in variable.value.split(',')" :key="input">
                                <p v-if="!isNaN(input) && input < variable.validators.min"
                                  class="help-block has-error">
                                  Entered value "{{ input }}" is less than the minimum value "{{ variable.validators.min }}".
                                </p>
                              </div>
                            </template>
                            <template  v-if="$validation[getId(variable)].max
                              && !$validation[getId(variable)].required
                              && variable.type === 'numeric'">
                              <div
                                v-for="input in variable.value.split(',')" :key="input">
                                <p v-if="!isNaN(input) && input > variable.validators.max"
                                  class="help-block has-error">
                                  Entered value "{{ input }}" is greater than the maximum value "{{ variable.validators.max }}".
                                </p>
                              </div>
                            </template>
                            <template  v-if="$validation[getId(variable)]
                              && !$validation[getId(variable)].valid
                              && variable.type === 'numeric'">
                              <div
                                v-for="input in variable.value.split(',')" :key="input">
                                <p v-if="isNaN(input)"
                                  class="help-block has-error">
                                  "{{ input }}" is not a number.
                                </p>
                              </div>
                            </template>
                          </div> -->
                          <!-- ===== DUMMY FEATURES START ===== -->
                          <div class="form-file-upload" v-if="variable.name === 'Tidal amplitude'">
                            <p class="help-block">Import tidal components <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="right" title="Uploading of tidal components is disabled. This feature will be added in future versions."></span>: <input type="file" id="exampleInputFile" class="" disabled></p>
                          </div>
                          <div class="form-file-upload" v-if="variable.name === 'River discharge'">
                            <p class="help-block">Import time series <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="right" title="Uploading of time series is disabled. This feature will be added in future versions."></span>: <input type="file" id="exampleInputFile" class="" disabled></p>
                          </div>
                          <div class="form-file-upload" v-if="variable.name === 'Sediment classes'">
                            <p class="help-block">Import spacially varying field <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="right" title="Uploading of a spacially varying field is disabled. This feature will be added in future versions."></span>: <input type="file" id="exampleInputFile" class="" disabled></p>
                          </div>
                          <!-- =====  DUMMY FEATURES END  ===== -->

                          <div class="multiplytable text-center" v-if="variable.id === 'baselevel'">
                            <div class="btn btn-default btn-xs" @click.stop="collapseToggle">
                              Toggle absolute value table for {{ variable.name }}
                            </div>
                            <div class="table-container collapse">
                              <table class="table table-condensed">
                                <thead>
                                  <tr>
                                    <th class="active" nowrap>Basin slope</th>
                                    <th v-for="val in split(variable.value)" :key="val">
                                      {{ val }} {{ variable.units }}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="basinslope in split(getVar('basinslope').value)" :key="basinslope">
                                    <td class="active" nowrap>{{ basinslope }} {{ getVar('basinslope').units }}</td>
                                    <td v-for="percentage in split(variable.value)" nowrap :key="percentage">
                                      {{ calcAbsBaseLevelChange(basinslope, percentage) }} m
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                      </div>
                    </div>
                  </div>
                </div>
                <div class="panel panel-default">
                  <div class="panel-body">
                    <div class="form-group">
                      <input
                        type="hidden"
                        class="form-control"
                        id="total-runs"
                        v-model="totalRuns"
                        v-validate:totalRuns="{required: true, min: 1, max: maxRuns}"
                        name="total-runs"
                        />

                      Number of runs: <strong>{{totalRuns}}</strong>
                      <p class="help-block has-error">
                        You must have at least one run, but you cannot submit more than {{maxRuns}} runs in one scenario.
                      </p>

                      <div class="pull-right">
                        <router-link class="btn btn-default nav-bar-button nav-link"  :to="{name: 'home'}"> Cancel </router-link>
                        <!-- <a class="btn btn-default nav-bar-button nav-link" ="{ path: '/' }">Cancel</a> -->
                        <button
                           type="button"
                           class="btn btn-primary nav-bar-button default"
                           id="scenario-submit"
                           @click.stop="submitScenario"
                           value=""
                           >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="col-sm-7">
          <div v-if="template">
            <div class="panel panel-default">
              <div class="panel-heading">
                <h3 class="panel-title">Details for {{ template.name }}</h3>
              </div>
              <!-- template details -->
              <div class="panel-body">
                <dl class="dl-horizontal">
                  <div v-for="(key, val) in template.meta" :key="val">
                    <dt>{{ key }}</dt>
                    <dd>{{ val }}</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div class="panel panel-default">
              <div class="panel-heading">
                <h3 class="panel-title">Schematic</h3>
              </div>
              <!-- template details -->
              <div class="panel-body text-center">
                <map-component
                  v-show="template.name==='GTSM world template'"
                >
                </map-component>
                <img
                  v-if="template.name==='River dominated delta'"
                  src="../assets/images/schematic.svg"
                  class="scenariobuilder-schematic"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>
</template>

<script>
import $ from 'jquery'
import _ from 'lodash'
import store from '../store'
import {
  fetchTemplates
} from '../templates.js'
import {
  bus
} from '@/event-bus.js'

import MapComponent from '../components/MapComponent'

// a separate function that we can test.
function factorToArray (variable) {
  if (!_.get(variable, 'factor')) {
    // if variable is not a factor return the value
    return variable.value
  }
  // split it up
  var tagsArray = _.split(variable.value, ',')

  // if we have a number, return numbers
  if (variable.type === 'numeric') {
    // convert to number
    var numbers = _.map(
      tagsArray,
      _.toNumber
    )

    // otherwise return the strings
    tagsArray = numbers
  }
  return tagsArray
}

export default {
  store,
  template: '#template-scenario-builder',
  data: function () {
    return {
      availableTemplates: [],

      // The scenario as configured by the user at the moment.
      scenarioConfig: {},

      // the current template
      template: null,

      dataLoaded: false,

      currentSelectedId: null,

      // The DOM elements used for the fixed toolbar event listener
      navBars: null,

      forceTemplateUpdate: false,

      maxRuns: 20
    }
  },
  components: {
    MapComponent
  },
  mounted () {
    // We force the template to be reloaded when this page is openend
    // Otherwise old values will stay in the form, and the validator is not reactivated.
    // The data function changes the function if needed.
    this.dataLoaded = false
    this.currentSelectedId = null
    this.template = null
    this.fetchTemplateList()
    console.log('route: sceaneriocreate, data')

    // if we have a template in the request, select that one
    if (_.has(this, '$route.query.template')) {
      // This cannot go into the fetchTemplates, template will always be empty!
      var templateId = parseInt(this.$route.query.template)
      var template = _.first(_.filter(this.availableTemplates, ['id', templateId]))

      if (template !== undefined) {
        this.selectTemplate(template)
      }
    }
  },

  validators: { // `numeric` and `url` custom validator is local registration
    max: function (val, rule) {
      // create a value object and split up the value
      var vals = factorToArray({
        factor: true,
        value: val,
        type: 'numeric'
      })
      // check if any value is > rule
      var valid = _.every(vals, function (x) {
        return x <= rule
      })

      return valid
    },
    min: function (val, rule) {
      var vals = factorToArray({
        factor: true,
        value: val,
        type: 'numeric'
      })

      // check if any value is > rule
      var valid = _.every(vals, function (x) {
        return x >= rule
      })

      return valid
    }
  },
  computed: {
    totalRuns: {
      cache: false,
      get: function () {
        var totalRuns = 1

        // lookup all variables
        var variables = _.flatMap(
          this.scenarioConfig.sections,
          function (section) {
            return section.variables
          }
        )

        // lookup number of runs per variable
        var runs = _.map(
          variables,
          // use an arrow because we need this
          (variable) => {
            // if variable is an array, return the array length
            if (_.isArray(variable.value)) {
              return variable.value.length
            }

            // unless we have a factor, then it's the number of values
            if (variable.factor) {
              return factorToArray(variable).length
            }

            return 1
          })

        // reduce product
        totalRuns = _.reduce(runs, function (prod, n) {
          return prod * n
        }, 1)
        return totalRuns
      }
    },

    validForm: {
      cache: false,
      get: function () {
        if (this.$validation) {
          return this.$validation.valid
        }
        return true
      }
    },
    // get the bounding box from the map from the store
    bbox: {
      get () {
        return store.state.bbox
      },
      set (bbox) {
        store.dispatch('setbbox', bbox)
      }
    },
    // state for when a valid bounding box is selected
    validbbox: {
      get () {
        return store.state.validbbox
      },
      set (validbbox) {
        store.dispatch('setbboxvalidation', validbbox)
      }
    }
  },
  methods: {
    // check if variable should generate an input element
    isInput: function (variable) {
      return _.includes(['numeric', 'text', 'semver'], variable.type) || variable.factor
    },
    // Check is submit button should be disabled
    disableSubmit: function () {
      if (this.template.name === 'GTSM world template') {
        console.log('disablesubmit GTSM world template', (!(this.validForm && this.validbbox)))
        return (!(this.validForm && this.validbbox))
      } else {
        console.log('disablesubmit GTSM world template', this.validForm)
        return (this.validForm)
      }
    },
    // Moved so that we can test it better.
    fetchTemplateList: function () {
      fetchTemplates()
        .then((templates) => {
          this.availableTemplates = _.sortBy(templates, ['name'])

          // Select the first template automatic:
          var template = _.get(this.availableTemplates, 0)

          // if we have a template in the request, select that one
          if (_.has(this, '$route.query.template')) {
            var templateId = parseInt(this.$route.query.template)

            template = _.first(_.filter(this.availableTemplates, ['id', templateId]))
          }

          // set the template, somehow a computed setter was not working...
          this.selectTemplate(template)

          // set the dataloaded to true, such that the <form> DOM will be rendered
          this.dataLoaded = true

          // Initialize the tooltips: We do this after the DOM update.
          this.$nextTick(function () {
            this.updateAfterTick()
          })
        })
    },

    selectTemplate: function (template) {
      if (template === null) {
        return
      }

      //  Did the template change? Or maybe forcing an update
      if (this.currentSelectedId === template.id) {
        return
      }

      this.currentSelectedId = template.id

      // First set data, then the template. Order is important!
      this.scenarioConfig = this.prepareScenarioConfig(template)
      console.log('scenarioConfig', this.scenarioConfig)

      this.updateWithQueryParameters()

      // set the selected template
      this.template = template

      // Initialize the tooltips: We do this after the DOM update.
      this.$nextTick(function () {
        this.updateAfterTick()
      })
    },

    updateAfterTick: function () {
      // initiate the multi-select input fields
      var pickers = $('.select-picker')

      if (pickers.selectpicker !== undefined) {
        pickers.selectpicker('refresh')
      }

      if ($("[data-toggle='tooltip']").tooltip !== undefined) {
        $("[data-toggle='tooltip']").tooltip({
          html: true,
          // do not user hover: we use clickable links in the tooltip
          trigger: 'click'
        })

        // register event for closing tooltips when clicking anywhere else
        $('html').click(function (evt) {
          // clicking the tooltip element also triggers a click event on accompanying input or select elements, hence the additional tagName check
          if (evt.target.getAttribute('data-toggle') === null && evt.target.tagName !== 'INPUT' && evt.target.tagName !== 'SELECT') {
            $("[data-toggle='tooltip']").tooltip('hide')
          }
        })
      }

      $('input[data-role=tagsinput], select[multiple][data-role=tagsinput]').each((i, el) => {
        // lookup corresponding variable
        // var variables = _.flatMap(this.scenarioConfig.sections, "variables");
        // var variable = _.head(_.filter(variables, ["id", el.id]));

        // if (variable.type === "select") {

        $(el).tagsinput()
        // } else {
        // $(el).tagsinput();
        // }
      })
    },

    // Return a unique id for the variable that is validated.
    // When selecting another template, the validator cannot deal
    // with variable with the same name.
    getId: function (variable) {
      console.log('getid', variable, variable.name, variable.default, variable.validators)
      return this.scenarioConfig.id + ',' + variable.id
    },

    updateWithQueryParameters: function () {
      console.log('updateWithQueryParameters')
      if (_.has(this, '$route.query.parameters')) {
        // get parameters from query
        var parameters = JSON.parse(this.$route.query.parameters)
      }

      // the request has parameters in the form of {"variable": {"values": value}}
      // the scenarioConfig also has sections {"sections": [{"variables": [{"variable": {"value": []}}]}]}

      // let's create a flat list of variables
      var variables = _.flatMap(this.scenarioConfig.sections, 'variables')

      // loop over all variables in the filled in template
      _.each(
        variables,
        function (variable) {
          // does this template variable have a corresponding variable in the request parameters
          if (variable.validators.max) {
            variable.validators['max_value'] = variable.validators.max
            delete variable.validators['max']
          }
          if (variable.validators.min) {
            variable.validators['min_value'] = variable.validators.min
            delete variable.validators['min']
          }
          if (_.has(parameters, variable.id)) {
            if (variable.factor) {
              // join by columns for tag input
              variable.value = _.join(parameters[variable.id].values, ',')
            } else {
              // just set it (first item)
              variable.value = _.get(parameters[variable.id].values, 0)
              if (variable.id === 'bbox') {
                store.dispatch('setbbox', variable.value)
              }
            }
          }
        }
      )
      console.log('after', variables)

      // This is a bit ugly, but if we have a name, add (copy) to it and then use it.
      if (_.has(this, '$route.query.name') && _.has(this.scenarioConfig, 'name')) {
        // we also have a name
        var name = this.$route.query.name

        // reuse it and create (copy) (copy) (over) (roger)
        this.scenarioConfig.name = name + ' (copy)'

        // the name variable is special, because it's duplicated
        var nameVariable = _.first(_.filter(variables, ['id', 'name']))

        if (nameVariable) {
          // also set the name to the variable
          nameVariable.value = this.scenarioConfig.name
        }
      }
    },

    submitScenario: function () {
      if (!this.validForm) {
        return
      }

      var parameters = {}

      var name = ''

      // map each variable in each section to parameters
      _.forEach(this.scenarioConfig.sections, function (section) {
        _.forEach(section.variables, function (variable) {
          if (variable.id === 'name') {
            name = variable.value
          } else {
            var valuearray = _.map(('' + variable.value).split(','), function (d) {
              // try and parse
              var parsed = parseFloat(d)

              // if we have a number return parsed otherwise original string
              var result = (_.isNumber(parsed) && !isNaN(parsed)) ? parsed : d

              return result
            })

            if (variable.type === 'bbox-array') {
              valuearray = [valuearray]
            }
            parameters[variable.id] = {
              values: valuearray,
              // we need these in the table
              // if they are not available they should drop during submission
              units: variable.units,
              name: variable.name,
              description: variable.description
            }
          }
        })
      })

      var postdata = {
        'name': name,
        'template': this.currentSelectedId,
        'parameters': JSON.stringify(parameters)
      }
      console.log('submitScenario', JSON.stringify(parameters))

      store.dispatch('createScenario', postdata)
        .then(function () {
          // This is not practical, but the only way in vue? (using $parent)
          bus.$emit('show-alert', {
            message: 'Scenario submitted',
            showTime: 5000,
            type: 'info'
          })
          this.$router.go({
            name: 'home',
            params: {}
          })
        })
        .catch(function () {
          // This is not practical, but the only way in vue? (using $parent)
          bus.$emit('show-alert', {
            message: 'Scenario could not be submitted',
            showTime: 5000,
            type: 'warning'
          })
        })
    },

    // We have to prepare the scenario config
    prepareScenarioConfig: function (data) {
      // create a deep copy so we don't change the template
      var scenario = _.cloneDeep(data)

      // Loop through all variables and set the default value:
      var sections = scenario.sections

      // flatten variables
      _.forEach(sections, function (section) {
        // Loop through all category vars
        _.forEach(section.variables, function (variable) {
          // Set Default value
          variable.value = _.get(variable, 'default')
          // Set factor to false
          variable.factor = _.get(variable, 'factor', false)
          // Initialise fraction so that vue can use it
          variable.inputValue = variable.value
        })
      })

      return scenario
    },

    // multiplytable methods

    collapseToggle: function (e) {
      $(e.target).parent('.multiplytable').children('.collapse').collapse('toggle')
    },

    split: function (string) {
      return _.split(string, ',')
    },

    getVar: function (id) {
      return _.first(
        _.filter(
          _.flattenDeep(
            _.map(this.scenarioConfig.sections, 'variables')
          ),
          ['id', id]
        )
      )
    },

    calcAbsBaseLevelChange: function (basinslope, percentage) {
      // This method computes the absolute values of base level change (m), based on:
      // - the basin slope angle (rad)
      // - the relative base level change (%).
      // The basin itself has a length of 10.000m and has a 4m starting depth.

      // This method is very specific and unique with regards to the template!!
      // TODO: implement a generic means to include calculations in tables based on template json

      return _.round(
        ((4 + (10000 * Math.tan(basinslope / 180 * Math.PI))) * percentage / 100),
        2 // digit precision
      )
    }
  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';
.scenario-builder {
    padding-top: 51px;
    position: static;
    height: 100vh;

    img {
        max-height: 768px;
        max-width: 100%;
    }

    .bootstrap-tagsinput {
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
        width: 100%;
    }

    .btn {
        margin-right: $padding;
    }

    .btn[disabled] {
        background-color: grey;
        border-color: black;
    }

    .row {
        padding: $padding 0;
    }

    .scrollable {
        overflow-y: auto;
    }

    // some styling to align a text with a standard butotn.
    .align-with-button {
        padding: 8px 16px; // Extra pixel top and bottom for border on buttons
    }

    .toggle {
        margin-top: $padding;
    }

    .multiplytable {
        .btn {
            margin: $padding 0;
        }
    }

    .table-container {
        overflow-x: scroll;

        table {
            margin: 0;
        }

        td,
        th {
            text-align: center;
        }
    }

    .form-group {
        &:last-child {
            margin-bottom: 0;
        }
    }

    // DUMMY FEATURES

    .input-group,
    option,
    select {
        width: 100%;
    }

    [type='file'] {
        display: inline-block;
    }

    .form-file-upload {
        margin-top: $padding;
    }

}
</style>