<template>
  <div class="scenario-builder full-height">
    <span v-if="availableTemplates.length === 0" class="label">
      Log in to build a scenario.
    </span>
    <!-- User has to select a template first -->
    <div class="container-fluid full-height scrollable" id="below-tool-bar">
      <div class="row">
        <!-- 2 column layout, 1st column scenario properties -->
        <div class="col-sm-5">
          <div class="row" v-show="availableTemplates.length">
            <div class="col-sm-12">
              <div class="form-group">
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
          <div v-show="template && dataLoaded">
            <div>
              <form novalidate>
                <div v-for="(section, index) in scenarioConfig.sections" :key="index">
                  <div class="card mb-3">
                    <h3 class="card-header">{{section.name}}</h3>
                    <div class="card-body">

                      <!-- ===== DUMMY FEATURES START ===== -->
                      <template v-if="section.name === 'Simulation settings'">
                        <div class="form-group">
                          <label class="control-label pr-1" for="run-env-1">
                            Run environment
                          </label>
                          <span class="fa fa-info-circle" data-toggle="tooltip" data-placement="right" title="Specifies where the simulations are hosted."></span>
                          <div class="input-group">
                            <select class="form-control" id="run-env-1">
                              <option selected>Amazon</option>
                              <option disabled>Nerdalize (disabled: this feature will be added in future versions)</option>
                              <option disabled>H6 cluster (disabled: this feature will be added in future versions)</option>
                              <option disabled>local (disabled: this feature will be added in future versions)</option>
                            </select>
                          </div>
                        </div>
                        <div class="form-group">
                          <label class="control-label pr-1" for="run-env-2">
                            Delft3D Version
                          </label>
                          <span class="fa fa-info-circle" data-toggle="tooltip" data-placement="right" title="Specifies the Delft3D version used for simulation."></span>
                          <div class="input-group">
                            <select class="form-control" id="run-env-2">
                              <option selected>Deltares, Delft3D Flexible Mesh Version 1.2.0.61839</option>
                              <option disabled>Deltares, Delft3D Flexible Mesh Suite (disabled: this feature will be added in future versions)</option>
                            </select>
                          </div>
                        </div>
                      </template>
                      <!-- =====  DUMMY FEATURES END  ===== -->
                      <div class="form-group" v-for="(variable, index) in section.variables" :key="index">
                        <label class="control-label pr-1" :for="variable.id">
                          {{ variable.name }}
                        </label>
                        <span v-if="variable.validators.min !== undefined">
                          [{{ variable.validators.min }} - {{ variable.validators.max }}]
                        </span>
                        <span v-if="variable.description" class="fa fa-info-circle" data-toggle="tooltip" data-placement="right" :title="variable.description"></span>

                        <span v-if="variable.type === 'select'">
                          [{{variable.options.map(opt => opt.text).join(', ')}}]
                        </span>

                          <ValidationProvider ref="validator" :rules="`noEmptyArray|${validatorsToString(variable.validators)}`" :name="variable.value.toString()" v-slot="{ errors }">
                            <div class="input-group">

                        <!-- tagsinput -->
                            <input
                                v-if="isInput(variable) && variable.factor"
                                :type="variable.type"
                                class="input-field-tags form-group form-control"
                                data-role="tagsinput"
                                :id="variable.id"
                                v-model="variable.value"
                                :disabled="variable.disabled"
                                :field="getId(variable)"
                                :class="{'is-invalid': errors.length > 0}"
                                :name="variable.name"
                                :aria-describedby="`${variable.id}-help`"
                                />
                              <!-- numeric, text, semver or factor are inputs-->
                              <input v-if="isInput(variable) && !variable.factor"
                                :type="variable.type"
                                class="form-control"
                                :id="variable.id"
                                v-model="variable.value"
                                :disabled="variable.disabled"
                                :field="getId(variable)"
                                :class="{'input': true, 'is-invalid': errors.length > 0 }"
                                :name="variable.name"
                                :aria-describedby="`${variable.id}-help`"
                                />
                              <!-- select if not form -->
                               <select v-if="variable.type === 'select' && !variable.factor" multiple="multiple"  class="form-control selectpicker" :id="variable.id" :value="variable.value" :field="getId(variable)"
                                :name="variable.name">
                                <option v-for="(option, i) in variable.options" :value="option.value" :key="i">
                                  {{ option.text }}
                                </option>
                              </select>
                              <!-- text area -->
                              <textarea v-if="variable.type === 'textarea'" class="form-control" rows="3" :disabled="variable.disabled" :field="getId(variable)" v-model="variable.value" :name="variable.name"></textarea>
                              <!-- date -->
                              <div v-if="variable.type === 'date'" class="input-group date" data-provide="datepicker" data-date-format="yyyymmdd" todayHighlight>
                                <input class="form-control date" v-model="variable.value" :field="getId(variable)" v-validate="variable.validators" :name="variable.name" />
                                <div class="input-group-append append-item">
                                  <span class="glyphicon glyphicon-th"></span>
                                </div>
                              </div>
                              <!-- bbox array -->
                              <input v-if="variable.type === 'bbox-array'" type="text" :id="variable.id" class="form-control" :field="getId(variable)" v-model="bbox" :name="variable.name" readonly />
                              <div class="input-group-append">
                                <span class="input-group-text append-item">
                                  {{ variable.units || '-' }}
                                </span>
                              </div>
                              <div class="col-sm-12 p-0">

                            <small v-show="errors.length > 0" class="form-text error-message">{{ errors[0] }}</small>
                          </div>
                        </div>

                        </ValidationProvider>
                        <!-- ===== DUMMY FEATURES START ===== -->
                        <div class="form-file-upload pt-2" v-if="variable.name === 'Tidal amplitude'">
                          <p class="help-block">
                            Import tidal components
                            <span class="fa fa-info-circle" data-toggle="tooltip" data-placement="right" title="Uploading of tidal components is disabled. This feature will be added in future versions.">
                            </span>:
                            <input type="file" id="tidalInputFile" class="" disabled></p>
                        </div>
                        <div class="form-file-upload pt-2" v-if="variable.name === 'River discharge'">
                          <p class="help-block">Import time series <span class="fa fa-info-circle" data-toggle="tooltip" data-placement="right" title="Uploading of time series is disabled. This feature will be added in future versions."></span>:
                            <input type="file" id="timeseriesInputFile" class="" disabled></p>
                        </div>
                        <div class="form-file-upload pt-2" v-if="variable.name === 'Sediment classes'">
                          <p class="help-block">Import spacially varying field <span class="fa fa-info-circle" data-toggle="tooltip" data-placement="right" title="Uploading of a spacially varying field is disabled. This feature will be added in future versions."></span>:
                            <input type="file" id="varyingInputFile" class="" disabled></p>
                        </div>
                        <!-- =====  DUMMY FEATURES END  ===== -->

                        <div class="text-center" v-if="variable.id === 'baselevel'">
                          <div type="button" class="btn btn-outline-secondary btn-sm mt-2" data-toggle="collapse" data-target=".table-container">
                            Toggle absolute value table for {{ variable.name }}
                          </div>
                          <div class="table-container collapse mt-2 text-left">
                            <table class="table table-condensed">
                              <thead>
                                <tr>
                                  <th class="active" nowrap>Basin slope</th>
                                  <th v-for="val in splitString(variable.value)" :key="val">
                                    {{ val }} {{ variable.units }}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="basinslope in splitString(getVar('basinslope').value)" :key="basinslope">
                                  <td class="active" nowrap>{{ basinslope }} {{ getVar('basinslope').units }}</td>
                                  <td v-for="percentage in splitString(variable.value)" nowrap :key="percentage">
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
                <div class="card">
                  <div class="card-body">
                    <div class="form-group">
                      Number of runs: <strong>{{totalRuns}}</strong>
                      <small class="form-text">
                        You must have at least one run, but you cannot submit more than {{maxRuns}} runs in one scenario.
                      </small>

                      <div class="pull-right">
                        <router-link class="btn btn-outline-secondary nav-bar-button nav-link" :to="{name: 'home'}"> Cancel </router-link>
                        <!-- <a class="btn btn-default nav-bar-button nav-link" ="{ path: '/' }">Cancel</a> -->
                        <button type="button" class="btn btn-info nav-bar-button default" id="scenario-submit" :disabled="noErrors()" @click="submitScenario" value="">
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
            <div class="card mb-3">
              <h3 class="card-header">Details for {{ template.name }}</h3>
              <!-- template details -->
              <div class="card-body">
                <dl class="dl-horizontal">
                  <div v-for="(key, val) in template.meta" :key="val">
                    <dt>{{ key }}</dt>
                    <dd>{{ val }}</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div class="card mb-3">
              <h3 class="card-header">Schematic</h3>
              <!-- template details -->
              <div class="card-body text-center">
                <!-- <map-component v-show="template.name==='GTSM world template'">
                </map-component> -->
                <img v-if="template.name==='River dominated delta'" src="../assets/images/schematic.svg" class="scenariobuilder-schematic" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    <alert-dialog
      :alertMessage="alertEvent"
    />
  </div>
</template>

<script>
import _ from 'lodash'
import $ from 'jquery'
import store from '../store'
// import MapComponent from '../components/MapComponent'
// eslint-disable-next-line
import { extend, validate } from 'vee-validate'
import { required } from 'vee-validate/dist/rules'
import AlertDialog from '@/components/AlertDialog'

extend('required', {
  ...required,
  message: 'This field is required'
})
extend('noEmptyArray', {
  validate (value) {
    if (typeof value === 'object') {
      return value.length > 0
    } else {
      return true
    }
  },
  message: 'Field is required.'
})
extend('min', {
  validate (value, args) {
    if (typeof value === 'number') {
      return parseFloat(value) >= parseFloat(args.min_value)
    }
    let allVars = value
    if (typeof value === 'string') {
      allVars = value.split(',')
    }
    const allBools = allVars.map(obj => {
      return parseFloat(obj) >= parseFloat(args.min_value)
    })
    return !allBools.includes(false)
  },
  params: ['min_value'],
  message: `Entered value is too low.`
})
extend('max', {
  validate (value, args) {
    if (typeof value === 'number') {
      return parseFloat(value) <= parseFloat(args.max_value)
    }
    let allVars = value
    if (typeof value === 'string') {
      allVars = value.split(',')
    }
    const allBools = allVars.map(obj => {
      return parseFloat(obj) <= parseFloat(args.max_value)
    })
    return !allBools.includes(false)
  },
  params: ['max_value'],
  message: `Entered value is too high.`
})
// a separate function that we can test.
const factorToArray = (variable) => {
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
  name: 'scenario-builder',
  store,
  data () {
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
      maxRuns: 20,
      alertEvent: null
    }
  },
  components: {
    AlertDialog
  },
  mounted () {
    // We force the template to be reloaded when this page is openend
    // Otherwise old values will stay in the form, and the validator is not reactivated.
    // The data function changes the function if needed.
    this.dataLoaded = false
    this.currentSelectedId = null
    this.template = null
    this.fetchTemplateList()
    // if we have a template in the request, select that one
    if (_.get(this, '$route.query.template')) {
      // This cannot go into the fetchTemplates, template will always be empty!
      var templateId = parseInt(this.$route.query.template)
      var template = _.first(_.filter(this.availableTemplates, ['id', templateId]))
      if (template !== undefined) {
        this.selectTemplate(template)
      }
    }
  },
  validators: { // `numeric` and `url` custom validator is local registration
    max: (val, rule) => {
      // create a value object and split up the value
      var vals = factorToArray({
        factor: true,
        value: val,
        type: 'numeric'
      })
      // check if any value is > rule
      var valid = _.every(vals, (x) => {
        return x <= rule
      })
      return valid
    },
    min: (val, rule) => {
      var vals = factorToArray({
        factor: true,
        value: val,
        type: 'numeric'
      })
      // check if any value is > rule
      var valid = _.every(vals, (x) => {
        return x >= rule
      })
      return valid
    }
  },
  computed: {
    totalRuns: {
      cache: false,
      get () {
        var totalRuns = 1
        // lookup all variables
        var variables = _.flatMap(
          this.scenarioConfig.sections,
          (section) => {
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
        totalRuns = _.reduce(runs, (prod, n) => {
          return prod * n
        }, 1)
        return totalRuns
      }
    },
    validForm: {
      cache: false,
      get () {
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
    noErrors () {
      if (this.$refs.validator) {
        const allVars = this.$refs.validator.map(val => {
          return val.errors.length === 0
        })
        return allVars.includes(false)
      } else {
        return false
      }
    },
    validatorsToString (obj) {
      const entries = Object.entries(obj)
      const entMap = entries.map((ent) => {
        return `${ent[0]}:${ent[1]}`
      })
      return entMap.join('|')
    },
    updateTagLabel () {
      $('span.tag.label.label-info').each((i, el) => {
        $(el).addClass('badge badge-info')
      })
    },
    fetchTemplates () {
      const url = '/api/v1/templates/'
      return new Promise((resolve, reject) => {
        return $.ajax({ url: url, traditional: true, dataType: 'json' })
          .done((json) => {
            resolve(json)
          })
          .fail((jqXhr) => {
            reject(jqXhr)
          })
      })
    },
    // check if variable should generate an input element
    isInput (variable) {
      return _.includes(['numeric', 'text', 'semver'], variable.type) || variable.factor
    },
    // Moved so that we can test it better.
    fetchTemplateList () {
      this.fetchTemplates()
        .then((templates) => {
          this.availableTemplates = _.sortBy(templates, ['name'])
          // Select the first template automatic:
          var template = _.get(this.availableTemplates, 0)
          // if we have a template in the request, select that one
          if (_.get(this, '$route.query.template')) {
            var templateId = parseInt(this.$route.query.template)
            template = _.first(_.filter(this.availableTemplates, ['id', templateId]))
          }
          // set the template, somehow a computed setter was not working...
          this.selectTemplate(template)
          // set the dataloaded to true, such that the <form> DOM will be rendered
          this.dataLoaded = true
          // Initialize the tooltips: We do this after the DOM update.
          this.$nextTick(() => {
            this.updateAfterTick()
          })
        })
    },
    selectTemplate (template) {
      if (template === null || template === undefined) {
        return
      }
      //  Did the template change? Or maybe forcing an update
      if (this.currentSelectedId === template.id) {
        return
      }
      this.currentSelectedId = template.id
      // First set data, then the template. Order is important!
      this.scenarioConfig = this.prepareScenarioConfig(template)
      this.updateWithQueryParameters()
      // set the selected template
      this.template = template
      // Initialize the tooltips: We do this after the DOM update.
      this.$nextTick(() => {
        this.updateAfterTick()
      })
    },
    updateAfterTick () {
      // initiate the multi-select input fields
      var pickers = $('.selectpicker')
      if (pickers.selectpicker !== undefined) {
        pickers.selectpicker('refresh')
      }
      $('.input-field-tags').each((i, el) => {
        $(el).tagsinput()
        $(el).change(this.updateTagLabel)
        $(el).change((val) => {
          this.scenarioConfig.sections.forEach(sec => {
            const variable = sec.variables.find(vari => vari.name === val.target.name)
            if (!variable) {
              return
            }
            variable.value = $(el).tagsinput('items')
          })
          this.$refs.validator.forEach(val => val.validate())
        })
      })
      this.updateTagLabel()
    },
    // Return a unique id for the variable that is validated.
    // When selecting another template, the validator cannot deal
    // with variable with the same name.
    getId (variable) {
      return `${this.scenarioConfig.id},${variable.id}`
    },
    updateWithQueryParameters () {
      if (_.get(this, '$route.query.parameters')) {
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
        (variable) => {
          if (_.get(parameters, variable.id)) {
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
      // This is a bit ugly, but if we have a name, add (copy) to it and then use it.
      if (_.get(this, '$route.query.name') && _.get(this.scenarioConfig, 'name')) {
        // we also have a name
        var name = this.$route.query.name
        // reuse it and create (copy) (copy) (over) (roger)
        this.scenarioConfig.name = `${name}(copy)`
        // the name variable is special, because it's duplicated
        var nameVariable = _.first(_.filter(variables, ['id', 'name']))
        if (nameVariable) {
          // also set the name to the variable
          nameVariable.value = this.scenarioConfig.name
        }
      }
    },
    submitScenario () {
      if (this.noErrors()) {
        return
      }
      var parameters = {}
      var name = ''
      // map each variable in each section to parameters
      _.forEach(this.scenarioConfig.sections, (section) => {
        _.forEach(section.variables, (variable) => {
          if (variable.id === 'name') {
            name = variable.value
          } else {
            var valuearray = _.map(('' + variable.value).split(','), (d) => {
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
      console.log('submitting')
      store.dispatch('createScenario', postdata)
        .then(() => {
          // This is not practical, but the only way in vue? (using $parent)
          this.alertEvent = {
            message: 'Scenario submitted',
            showTime: 5000,
            type: 'info'
          }
          this.$router.push({
            name: 'home',
            params: {}
          })
          console.log(this.alertEvent)

        })
        .catch(() => {
          // This is not practical, but the only way in vue? (using $parent)
          this.alertEvent = {
            message: 'Scenario could not be submitted',
            showTime: 5000,
            type: 'warning'
          }
          console.log(this.alertEvent)

        })
    },
    // We have to prepare the scenario config
    prepareScenarioConfig (data) {
      // create a deep copy so we don't change the template
      var scenario = _.cloneDeep(data)
      // Loop through all variables and set the default value:
      var sections = scenario.sections
      // flatten variables
      _.forEach(sections, (section) => {
        // Loop through all category vars
        _.forEach(section.variables, (variable) => {
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
    splitString (string) {
      return _.split(string, ',')
    },
    getVar (id) {
      return _.first(
        _.filter(
          _.flattenDeep(
            _.map(this.scenarioConfig.sections, 'variables')
          ),
          ['id', id]
        )
      )
    },
    calcAbsBaseLevelChange (basinslope, percentage) {
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
    },
    factorToArray
  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';
.placeholder {
  margin: auto;
}

.scenario-builder {
    padding-top: 51px;
    position: relative;
    height: 100%;

    #below-tool-bar {
      overflow-y: auto;
      height: 100%;
    }

    img {
        max-height: 768px;
        max-width: 100%;
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
    .input-group,
    option,
    select {
        width: 100%;
    }
    .error-message {
      color: #dc3545;
    }
    span.input-group-text.append-item {
      border-bottom-right-radius: 0.25rem !important;
      border-top-right-radius: 0.25rem !important;
    }
    .input-field-tags {
      display: none;
    }

    .bootstrap-tagsinput {
      border-bottom-right-radius: 0;
      border-top-right-radius: 0;
      flex: 1 1 auto;
      width: auto;
      position: relative;
    }
}
</style>
