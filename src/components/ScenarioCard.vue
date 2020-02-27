<template>
<div id="template-scenario-card">
  <div class="scenario-card" @click.stop="collapse">
    <div class="panel panel-default" v-if="hasModels">
      <div class="panel-heading panel-heading-scenario">
        <div class="row">
          <div class="col-xs-8 col-sm-5">
            <i class="fa fa-folder-o" aria-hidden="true" title="scenario"></i>
            &nbsp;{{scenario.data.name}}
          </div>
          <div class="col-xs-4 col-sm-4 text-right m-auto">
            <div class="btn-group">
              <button type="button" class="btn btn-default btn-xs" @click.stop="clone" title="Clone scenario">
                <i class="fa fa-clone" aria-hidden="true"></i>
              </button>
              <button type="button" class="btn btn-default btn-xs" @click.stop="openDeleteDialog" title="Delete scenario">
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
      <div class="collapse" :id="'collapse-' + scenario.id">
        <div class="panel-body panel-body-scenario">
          <div class="row">
            <div v-if="scenario.models && scenario.models.length > 0">
              <ul class="list-group" data-toggle="items">
                <model-card v-for="(model, index) in scenario.models" :model="model" :key="index">
                </model-card>
              </ul>
            </div>
            <div v-else>
              <div class="message">
                This scenario is empty
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- <confirm-dialog
        @confirm="deleteScenario"
        @cancel="showDeleteDialog = false"
        :dialog-id="`delete-scenario-${scenario.id}`"
        confirm-button-title="Delete">
        <template slot="title">
          Delete scenario
        </template>
        <template slot="body">
          <p>Are you sure you want to remove this scenario and all associated models?</p>
        </template>
      </confirm-dialog> -->
    </div>
  </div>
</div>
</template>

<script>
import _ from 'lodash'
import $ from 'jquery'
import store from '../store'
import ModelCard from './ModelCard'
import ConfirmDialog from './ConfirmDialog'
import router from '../router.js'
import {
  bus
} from '@/event-bus.js'

export default {
  store,
  router,
  template: '#template-scenario-card',
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
      showDeleteDialog: false
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
        if (val) {
          bus.$emit('select-all')
        } else {
          bus.$emit('unselect-all')
        }
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

      router.go(req)
    },
    collapse (e) {
      e.stopPropagation()
      $(`#collapse-${this.scenario.id}`).collapse('toggle')
    },
    openDeleteDialog (e) {
      e.stopPropagation()
      this.showDeleteDialog = true
    },
    deleteScenario () {
      // Get a confirm dialog
      console.log('delete scenario', this.scenario, store)
      store.dispatch('deleteScenario', this.scenario)
      this.showDeleteDialog = false
    }
  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';

.scenario-card {
    cursor: pointer;
    user-select: none;

    li {
        padding: 0;
    }

    [class^='col-'] {
        padding: 5px;
    }

    .col-sm-1:last-child {
        padding-left: 0;
    }

    .list-group {
        border: 0;
        margin-bottom: 0;
    }

    .list-group-item {
        border: 0;
        border-top: 1px solid $col-bw-2;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    .message {
        padding: $padding;
    }

    .panel-heading-scenario {
        background: $col-bw-1;
    }

    .panel-body-scenario {
        padding: 0;
    }

    .progress {
        margin-bottom: 0;
    }

    .row {
        margin: 0;
        padding-bottom: 0;
    }

    div {
        [class^='col-'] {
            margin-bottom: 0;
            padding-bottom: 0;
        }
    }

}

@media (min-width: $screen-xs-sm) {
    .scenario-card {
        [class^='col-'] {
            padding-top: 0;
        }
    }
}
</style>
