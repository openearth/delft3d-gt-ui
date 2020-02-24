<template>
<div id="template-search-list">
  <div class="search-list" data-toggle="items">
    <scenario-card v-for="(scenario, index) in sharedState.scenarioContainers" :key="index" :scenario="scenario"></scenario-card>

    <div class="list-divider" v-if="hasCompanyModels()">
      shared with company
    </div>

    <div v-for="(model, index) in companyModels" class="panel panel-default" :key="index">
      <model-card :model="model" :selectable="false"></model-card>
    </div>

    <div class="list-divider" v-if="hasWorldModels()">
      shared with world
    </div>

    <div v-for="(model, index) in worldModels" class="panel panel-default" :key="index">
      <model-card :model="model" :selectable="false"></model-card>
    </div>
  </div>
</div>
</template>

<script>
import _ from 'lodash'
import store from '../store'
import ScenarioCard from '../components/ScenarioCard'
import ModelCard from '../components/ModelCard'
import {
  bus
} from '@/event-bus.js'
import { mapState } from 'vuex'

export default {
  store,
  template: '#template-search-list',
  data () {
    return {
      companyModels: [],
      worldModels: []
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
    bus.$on('models-loaded', (models) => {
      console.log('models loaded', models)
    })
    bus.$on('activated', (model) => {
      console.log('searchlist, event: activated')
      bus.$emit('deactivate', model)
      this.sharedState.activeModelContainer = model
      console.log('searchlist, event: activated', this.sharedState.activeModelContainer)
      store.dispatch('update')
    })
  },
  watch: {
    items () {
      this.$nextTick(() => {})
    },
    sharedState () {
      this.companyModels = _.filter(this.sharedState.modelContainers, ['data.shared', 'c'])
      this.worldModels = _.filter(this.sharedState.modelContainers, ['data.shared', 'w'])
    }
  },
  computed: {
    ...mapState({
      sharedState: state => state
    }),
    // Get the current selected modelid from the routing URL
    selectedModel: {
      cache: false,
      get () {
        var models = _.filter(this.selectedItems, ['type', 'model'])
        var firstModel = _.first(models)

        return firstModel
      }
    },
    selectedItems: {
      cache: false,
      get () {
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
    toggleActive (item) {
      if (item.type === 'scenario') {
        _.each(item.models, (model) => {
          model.active = !item.active
        })
      }
      item.active = !item.active
    },
    hasCompanyModels () {
      return this.companyModels.length > 0
    },
    hasWorldModels () {
      return this.worldModels.length > 0
    },
    action (thing) {
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
