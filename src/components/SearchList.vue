<template>
<div id="template-search-list">
  <div class="search-list" data-toggle="items">
    <div v-for="(scenario, index) in sharedState.scenarioContainers" :key="index">
      <scenario-card :scenario="scenario" :multipleModels="true"></scenario-card>
    </div>
    <div class="list-divider" v-if="notEmpty(companyModels)">
      Shared with company
    </div>
    <div class="list-divider" v-else>
      No models shared with company available.
    </div>
    <model-card
      v-for="(model, index) in companyModels"
      class="mb-3"
      :key="`company-${index}`"
      :model="model"
      :selectable="false">
    </model-card>
    <div class="list-divider" v-if="notEmpty(worldModels)">
      Shared with world
    </div>
    <model-card
      v-for="(model, index) in worldModels"
      class="mb-3"
      :key="`world-${index}`"
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
  data () {
    return {
      companyModels: [],
      worldModels: []
    }
  },

  mounted () {
    bus.$on('activated', (model) => {
      bus.$emit('deactivate', model)
      this.sharedState.activeModelContainer = model
      store.dispatch('update')
    })
  },
  watch: {
    items () {
      this.$nextTick(() => {})
    },
    'sharedState.models' () {
      this.companyModels = _.filter(this.sharedState.modelContainers, ['data.shared', 'c'])
      this.worldModels = _.filter(this.sharedState.modelContainers, ['data.shared', 'w'])
    }
  },
  computed: {
    ...mapState({
      sharedState: state => state
    })
  },
  methods: {
    notEmpty (arr) {
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

    .progress-bar {
      height: 100%;
    }
  }

  .list-divider {
    color: $col-bw-4;
    padding-bottom: $padding;
  }
}
</style>
