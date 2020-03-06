<template>
<div id="scenario-card">
  <div class="card mb-3" v-if="hasModels">
      <div class="card-header" data-toggle="collapse" :data-target="`#collapse-${scenario.id}`">
        <div class="row">
          <div class="col-xs-8 col-sm-5">
            <i class="fa fa-folder-o" aria-hidden="true" title="scenario"></i>
            &nbsp;{{scenario.data.name}}
          </div>
          <div class="col-xs-4 col-sm-4 text-right m-auto">
            <div class="btn-group">
              <button type="button" class="btn btn-default btn-xs" @click="clone" title="Clone scenario">
                <i class="fa fa-clone" aria-hidden="true"></i>
              </button>
              <button type="button" class="btn btn-default btn-xs" @click.stop="showDeleteDialog = true" title="Delete scenario">
                <i class="fa fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          <div class="col-xs-11 col-sm-2 text-center no-padding m-auto">
            <div class="progress">
              <div v-for="(status, index) in modelStatuses"
                class="progress-bar"
                :key="index"
                :style="{ width: status.width + '%'}"
                :class="[
                         (status.state == 'Finished') ? 'bg-success' : '',
                         (status.state == 'Idle: waiting for user input') ? 'bg-warning' : '',
                         (status.state == 'Running simulation') ? 'bg-striped active' : '',
                         (
                         status.state != 'Finished' &&
                         status.state != 'Idle: waiting for user input'
                         ) ? 'bg-info' : '',
                         ]"
                role="progressbar"></div>
            </div>
          </div>
          <div class="col-xs-1 col-sm-1 text-center m-auto">
            <input type="checkbox" class="scenario-checkbox" v-model="allModelsSelected" title="select all models">
          </div>
        </div>
      </div>
        <div class="card-body collapse p-0" :id="`collapse-${scenario.id}`">
          <div class="row p-0 m-0">
            <ul class="list-group" data-toggle="items" v-if="scenario.models && scenario.models.length > 0">
              <model-card v-for="(model, index) in scenario.models" :select-all="changeScenarioSelected" :model="model" :key="index" :multipleModels="true" class="model-card-multiple">
              </model-card>
            </ul>
              <div class="message" v-else>
                This scenario is empty
              </div>
          </div>
        </div>
        <!-- Confirm dialog for control checks -->
        <confirm-dialog v-if="showDeleteDialog" confirm-button-title="Delete" :dialog-id="`delete-scenario-${scenario.id}`" @confirm="deleteScenario">
          <template slot="title">
            Delete scenario
          </template>
          <template slot="body">
            <p>Are you sure you want to remove this scenario and all associated models?</p>
          </template>
        </confirm-dialog>
  </div>
</div>
</template>

<script>
import _ from 'lodash'

import store from '../store'
import ModelCard from './ModelCard'
import ConfirmDialog from './ConfirmDialog'
import router from '../router.js'

export default {
  store,
  router,
  props: {
    scenario: {
      type: Object,
      required: true
    }
  },
  components: {
    ModelCard,
    ConfirmDialog
  },
  data () {
    return {
      showDeleteDialog: false,
      changeScenarioSelected: false
    }
  },
  computed: {
    hasModels () {
      return this.scenario.models.length > 0
    },
    someModelsSelected: {
      cache: false,
      get () {
        var someSelected = _.some(this.scenario.models, ['selected', true])

        return someSelected
      }
    },
    allModelsSelected: {
      cache: false,
      get () {
        if (this.scenario.models.length > 0) {
          return _.every(this.scenario.models, ['selected', true])
        } else {
          return false
        }
      },
      set (val) {
        this.changeScenarioSelected = val
      }
    },
    modelStatuses () {
      var array = _.map(this.scenario.models, (model) => {
        return {
          state: model.data.state
        }
      })

      _.each(array, (status) => {
        status.width = 100 / array.length
      })
      array = _.sortBy(array, (status) => {
        if (status.state === 'Finished') {
          return 0
        }
        if (status.state === 'Running simulation') {
          return 1
        }
        if (status.state === 'Queued') {
          return 2
        }
        if (status.state === 'Idle: waiting for user input') {
          return 3
        }
        return 2
      })
      return array
    }
  },
  mounted () {
    // disable click propagation on checkbox
    $('input.scenario-checkbox:checkbox').on('click', (e) => {
      e.stopPropagation()
    })
  },
  watch: {
    someModelsSelected () {
      this.updateIndeterminate()
    },
    allModelsSelected () {
      this.updateIndeterminate()
    }
  },
  methods: {
    updateIndeterminate () {
      if (this.someModelsSelected && (!this.allModelsSelected)) {
        // set the indeterminate property to true
        $(this.$el).find('.scenario-checkbox').prop('indeterminate', true)
      } else {
        $(this.$el).find('.scenario-checkbox').prop('indeterminate', false)
      }
    },
    clone (e) {
      e.stopPropagation()

      // Clone this scenario
      var parameters = _.assign(
        // create a new object (no data binding)
        {},
        // fill it with the parameters
        // TODO: replace by object parameters instead of list of parameters
        this.scenario.data.parameters
      )

      // These parameters are passed to the other view
      // alternative would be to store them in the app or to call an event
      var req = {
        name: 'scenarios-create',
        params: {},
        query: {
          'template': this.scenario.data.template,
          'parameters': JSON.stringify(parameters),
          'name': _.get(this.scenario.data, 'name')
        }
      }
      router.push(req)
    },
    deleteScenario () {
      // Get a confirm dialog
      store.dispatch('deleteScenario', this.scenario)
      this.showDeleteDialog = false
    }
  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';
.model-card-multiple {
    border: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
}

.list-group {
  width: 100%;
}

@media (min-width: $screen-xs-sm) {
    .scenario-card {
        [class^='col-'] {
            padding-top: 0;
        }
    }
}
</style>
