<template>
<div id="template-search-list">
  <div class="search-list" data-toggle="items">
    <p>hoi</p>
    <scenario-card v-for="scenario in sharedState.scenarioContainers" :key="scenario" :scenario="scenario"></scenario-card>

    <div class="list-divider" v-if="hasCompanyModels()">
      shared with company
    </div>

    <div v-for="model in companyModels" class="panel panel-default" :key="model">
      <model-card :model="model" :selectable="false"></model-card>
    </div>

    <div class="list-divider" v-if="hasWorldModels()">
      shared with world
    </div>

    <div v-for="model in worldModels" class="panel panel-default" :key="model">
      <model-card :model="model" :selectable="false"></model-card>
    </div>
  </div>
</div>
</template>

<script>
import _ from 'lodash'
import store from '../store.js'
import ScenarioCard from '../components/ScenarioCard'
import ModelCard from '../components/ModelCard'

export default {
  store,
  template: '#template-search-list',
  data: function () {
    return {
      companyModels: [],
      worldModels: [],
      sharedState: store.state
    }
  },
  components: {
    ScenarioCard,
    ModelCard
  },
  props: {
    // can contain scenarios and models
    'items': {
      type: Array,
      required: true
    },
    'models': {
      type: Array,
      required: true
    }
  },

  mounted () {
    console.log('searchlist mounted', store.state, this.sharedState)
    this.$on('models-loaded', function (models) {
      console.log('models loaded', models)
    })
    this.$on('activated', function (model) {
      this.$emit('deactivate', model)
      this.sharedState.activeModelContainer = model
      store.dispatch('update')
    })
  },
  watch: {
    items: function () {
      this.$nextTick(function () {})
    },
    sharedState: function () {
      console.log('sharedstate', this.sharedState, this.state)
      this.companyModels = _.filter(this.sharedState.modelContainers, ['data.shared', 'c'])
      this.worldModels = _.filter(this.sharedState.modelContainers, ['data.shared', 'w'])
    }
  },
  computed: {
    // Get the current selected modelid from the routing URL
    selectedModel: {
      cache: false,
      get: function () {
        var models = _.filter(this.selectedItems, ['type', 'model'])
        var firstModel = _.first(models)

        return firstModel
      }
    },
    selectedItems: {
      cache: false,
      get: function () {
        // we have models in scenarios
        var models = _.flatMap(this.items, 'models')
        // combine them with scenarios and orphans
        var allItems = _.concat(models, this.items)
        // we only want the active ones
        var activeItems = _.filter(allItems, ['active', true])

        return activeItems
      }
    }
  },
  methods: {
    toggleActive: function (item) {
      if (item.type === 'scenario') {
        _.each(item.models, function (model) {
          model.active = !item.active
        })
      }
      item.active = !item.active
    },
    hasCompanyModels: function () {
      return this.companyModels.length > 0
    },
    hasWorldModels: function () {
      return this.worldModels.length > 0
    },
    action: function (thing) {
      thing.active = !thing.active
    }
  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';

.search-list {

    .panel {
        margin-bottom: $padding;
    }

    .progress {
        height: 10px;
        margin-top: 5px;
    }

    .list-divider {
        color: $col-bw-4;
        padding-bottom: $padding;
    }

    .red {
        color: $brand-primary;
    }

    .thing {
        cursor: pointer;
        margin: $padding 0;
    }
}
</style>
