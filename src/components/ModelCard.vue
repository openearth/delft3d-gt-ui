<template>
<div class="model-card card" :class="{'activated': model.active}" @click.stop="toggleActive">
  <div class="card-body" :class="{ 'card-active': model.active }" v-if="model.data">
    <div class="row">
      <div class="col-xs-8 col-md-6">
        <span v-if="model.data.shared == 'p'"><i class="fa fa-fw fa-user" aria-hidden="true"></i></span>
        <span v-if="model.data.shared == 'c'"><i class="fa fa-fw fa-group" aria-hidden="true"></i></span>
        <span v-if="model.data.shared == 'w'"><i class="fa fa-fw fa-globe" aria-hidden="true"></i></span>
        &nbsp;{{model.data.name}}
      </div>
      <div class="col-xs-4 col-md-3 my-auto badge-cont">
        <span class="badge model-badge" :class="`badge-${model.statusLevel}`">
          {{model.data.state.toUpperCase() }}
        </span>
      </div>
      <div class="col-xs-11 col-md-2 m-auto p-0">
        <div class="progress">
          <div :data-percentage="`${model.data.progress}%`" :style="{ width: `${model.data.progress}%`}" class="progress-bar" :class="`bg-${model.statusLevel}`"
            role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
      <div class="col-xs-1 col-md-1 my-auto">
        <form class="form-inline m-auto">
          <input type="checkbox" v-model="model.selected">
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
  methods: {
    toggleActive () {
      this.model.active = true
      bus.$emit('activated', this.model)
    }
  },

  watch: {
    selectAll (val) {
      this.model.selected = val
    }
  },

  mounted () {
    bus.$on('deactivate', (clickedmodel) => {
      if (this.model !== clickedmodel) {
        this.model.active = false
      }
    })
  }

}
</script>

<style lang="scss">
@import '../assets/variables.scss';

.model-card {
    cursor: pointer;
    user-select: none;

    .card-active {
        background-color: $col-bw-2;
    }

    .label {
        float: right;
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
</style>
