<template>
<div class="model-card card" :class="{'activated': model.active}" @click.stop="toggleActive">
  <div class="card-body" :class="{ 'card-active': model.active }" v-if="model.data">
    <div class="row">
      <div class="col-md-2 col-lg-1 my-auto">
        <span v-if="model.data.shared == 'p'"><i class="fa fa-fw fa-user" aria-hidden="true"></i></span>
        <span v-if="model.data.shared == 'c'"><i class="fa fa-fw fa-group" aria-hidden="true"></i></span>
        <span v-if="model.data.shared == 'w'"><i class="fa fa-fw fa-globe" aria-hidden="true"></i></span>
      </div>
      <div class="col-md-10 col-lg-5">
        &nbsp;{{model.data.name}}
      </div>
      <div class="col-md-5 col-lg-3 badge-cont m-auto">
        <span class="badge model-badge" :class="`badge-${model.statusLevel}`">
          {{model.data.state.toUpperCase() }}
        </span>
      </div>
      <div class="col-md-5 col-lg-2 m-auto p-0">
        <div class="progress">
          <div :data-percentage="`${model.data.progress}%`" :style="{ width: `${model.data.progress}%`}" class="progress-bar" :class="`bg-${model.statusLevel}`"
            role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
      <div class="col-md-2 col-lg-1 my-auto">
        <form class="form-inline m-auto">
          <input type="checkbox" value="model.selected" @input="setModelProp('selected', $event)">
        </form>
      </div>
    </div>
  </div>
  <div class="card-body" v-else>
    model missing
  </div>
</div>
</template>

<script>
import {
  bus
} from '@/event-bus.js'
import _ from 'lodash'

export default {
  template: '#template-model-card',
  props: {
    model: {
      required: true
    },
    selectAll: {
      type: Boolean
    }
  },

  watch: {
    selectAll (val) {
      this.setModelProp('selected', val)
    }
  },
  mounted () {
    bus.$on('deactivate', (clickedmodel) => {
      if (this.model !== clickedmodel) {
        this.toggleActive(false)
      }
    })
  },

  methods: {
    toggleActive (value = true) {
      let model = this.model
      model = _.set(model, 'active', value)
      bus.$emit('activated', model)
    },
    setModelProp (prop, value) {
      let model = this.model
      model = _.set(model, prop, value)
      bus.$emit('update: model', model)
    }
  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';
ul.list-group {
  padding: 0;
}

.model-card {
    cursor: pointer;
    user-select: none;

    .card-active {
        background-color: $col-bw-2;
    }

    .label {
        float: right;
    }
  .row {
    margin-bottom: 0;
  }

    // Normally use mb-2 bootstrap css, but needed to remove this from last child
    :not(:last-child.card-body) {
      margin-bottom: 0.5rem;
    }
    :last-child.card-body {
      margin-bottom: 0;
      border-bottom: 1px solid #E2E8EB;
    }
}

.badge-cont {
  overflow: hidden;
}

.model-badge {
  float: right;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
}

.progress-bar {
  height: 100%;
}

</style>
