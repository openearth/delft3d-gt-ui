<template>
  <div id="template-model-card">
  <div class="model-card" :class="{'activated': model.active}" @click.stop="toggleActive">

    <template v-if="model.data">

      <div class="panel-body" :class="{ 'panel-active': model.active }">

        <div class="row">

          <div class="col-xs-8 col-sm-5">
            <span v-if="model.data.shared == 'p'"><i class="fa fa-fw fa-user" aria-hidden="true"></i></span>
            <span v-if="model.data.shared == 'c'"><i class="fa fa-fw fa-group" aria-hidden="true"></i></span>
            <span v-if="model.data.shared == 'w'"><i class="fa fa-fw fa-globe" aria-hidden="true"></i></span>
            &nbsp;{{model.data.name}}
          </div>

          <div class="col-xs-4 col-sm-4 text-right">
            <span class="label label-status"
                  :class="'label-' + model.statusLevel">
              {{model.data.state.toUpperCase() }}
            </span>
          </div>

          <div class="col-xs-11 col-sm-2 text-center no-padding">
            <div class="progress">
              <div
                :data-percentage="model.data.progress + '%'"
                :style="{ width: model.data.progress + '%'}"
                class="progress-bar"
                :class="[
                  (model.data.state === 'Running simulation') ? 'progress-bar-striped active' : '',
                  'progress-bar-' + model.statusLevel
                ]"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"></div>
            </div>
          </div>

          <div class="col-xs-1 col-sm-1 text-center">
            <form class="form-inline">
              <input type="checkbox" v-model="model.selected">
            </form>
          </div>

        </div>

      </div>

    </template>

    <template v-else>

      model missing

    </template>

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
    }
  },

  methods: {
    toggleActive: function () {
      this.model.active = true
      bus.$emit('activated', this.model)
    }
  },

  mounted () {
    bus.$on('deactivate', (clickedmodel) => {
      if (this.model !== clickedmodel) {
        this.model.active = false
      }
    })
    bus.$on('select-all', () => {
      this.model.selected = true
    })
    bus.$on('select-all', () => {
      this.model.selected = false
    })
  }

}
</script>

<style lang="scss">
@import '../assets/variables.scss';

.model-card {
  cursor: pointer;
  user-select: none;

  .progress {
    margin-bottom: 0;
  }

  .panel-active {
    background-color: $col-bw-2;
  }

  .label {
    float: right;
  }

  .row {
    margin-bottom: 0;
    // padding-bottom: 15px;
  }

  div {
    [class^='col-'] {
      margin-bottom: 0;
      padding-bottom: 0;
    }
  }
}

</style>
