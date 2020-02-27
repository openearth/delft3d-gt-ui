<template>
<div id="template-search-list">
  <div class="search-list" data-toggle="items">
    <scenario-card v-for="(scenario, index) in sharedState.scenarioContainers" :key="index" :scenario="scenario"></scenario-card>
    <div class="list-divider" v-if="notEmpty(companyModels)">
      shared with company
    </div>
    <model-card
      v-for="(model, index) in companyModels"
      :key="index"
      :model="model"
      :selectable="false">
    </model-card>
    <div class="list-divider" v-if="notEmpty(worldModels)">
      shared with world
    </div>
    <model-card
      v-for="(model, index) in worldModels"
      :key="index"
      :model="model"
      :selectable="false">
    </model-card>
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
    }
  },
  computed: {
    ...mapState({
      sharedState: state => state
    }),
    companyModels() {
      // Get all models that are shared with the company
      return _.filter(this.sharedState.modelContainers, ['data.shared', 'c'])
    },
    worldModels() {
      // Get all models that are shared with the world
      return _.filter(this.sharedState.modelContainers, ['data.shared', 'w'])
    },
    // // Get the current selected modelid from the routing URL
    // selectedModel: {
    //   cache: false,
    //   get () {
    //     var models = _.filter(this.selectedItems, ['type', 'model'])
    //     var firstModel = _.first(models)
    //     return firstModel
    //   }
    // },
    // selectedItems: {
    //   cache: false,
    //   get () {
    //     // we have models in scenarios
    //     var models = _.flatMap(this.items, 'models')
    //     // combine them with scenarios and orphans
    //     var allItems = _.concat(models, this.items)
    //     // we only want the active ones
    //     var activeItems = _.filter(allItems, ['active', true])
    //
    //     return activeItems
    //   }
    // }
  },
  methods: {
    notEmpty(arr) {
      return arr.length > 0
    }
  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';

.search-list {
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
