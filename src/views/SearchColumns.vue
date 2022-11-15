<template id="template-search-columns">

  <div class="search-columns full-height">
    <!-- ======================== TOOLBAR ======================== -->
    <div class="container-fluid hidden-xs">
      <div class="row action-bar">
        <div class="col-sm-2 bordered">
          <div class="btn-text hidden-sm hidden-md">Search</div>
          <div class="btn-group pull-right">
            <button class="btn btn-default" @click.stop="expandSearch">
              <i class="fa" :class="[(collapseSearchShow)? 'fa-arrow-down' : 'fa-arrow-up']" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn btn-default" id="btn-reset-search-form" v-on:click="resetFields">Reset</button>
          </div>
        </div>
        <div class="col-sm-5 col-md-4 col-lg-4 bordered">
          <div class="btn-text">Database (search results)</div>
          <model-control-menu :items="items" :models="models" :collapseShow="collapseScenariosShow" @expand-scenarios="expandScenarios"></model-control-menu>
        </div>
        <div class="col-sm-5 col-md-6 col-lg-6">
          <div class="btn-text">Model details</div>
          <button class="btn btn-default pull-right" @click.stop="expandDetails">
            <i class="fa" :class="[(collapseDetailsShow)? 'fa-arrow-down' : 'fa-arrow-up']" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
    <!-- ======================== COLUMNS ======================== -->

    <div class="container-fluid full-height">
      <div class="row full-height search-container">

        <div class="col-sm-2 column full-height bordered scrollable">
          <search-details ></search-details>
        </div>

        <div class="col-sm-5 col-md-4 col-lg-4 column full-height bordered scrollable">
          <search-list :items="items" :models="models" ref="search-list"></search-list>
        </div>

        <div class="col-sm-5 col-md-6 col-lg-6 column full-height scrollable">
          <model-details></model-details>
        </div>

      </div>
    </div>
  </div>

</template>

<script>
import $ from 'jquery'
import SearchDetails from '../components/SearchDetails'
import SearchList from '../components/SearchList'
import ModelDetails from './ModelDetails'
import ModelControlMenu from '../components/ModelControlMenu'

import store from '../store'
import {
  bus
} from '@/event-bus.js'

export default {
  store,
  template: '#template-search-columns',
  data () {
    return {
      // items that were found
      collapseDetailsShow: true,
      collapseSearchShow: true,
      collapseScenariosShow: true,
      items: [],
      models: []
    }
  },
  components: {
    'search-details': SearchDetails,
    'search-list': SearchList,
    'model-details': ModelDetails,
    'model-control-menu': ModelControlMenu
  },
  mounted () {
    store.dispatch('startSync')
    store.dispatch('updateUser')
    bus.$emit('updateSearch')

    // TODO, consistent naming
    bus.$on('items-found', (items, models) => {
      this.set('items', items)
      this.set('models', models)
    })
  },

  computed: {
    checkedBoxes: {
      cache: false,
      get () {
        return 1
      }
    }
  },

  methods: {
    expandDetails () {
      if (this.collapseDetailsShow) {
        $('.model-details .collapse').collapse('show')
      } else {
        $('.model-details .collapse').collapse('hide')
      }
      this.collapseDetailsShow = !this.collapseDetailsShow
    },
    expandSearch () {
      if (this.collapseSearchShow) {
        $('.search-details .collapse').collapse('show')
      } else {
        $('.search-details .collapse').collapse('hide')
      }
      this.collapseSearchShow = !this.collapseSearchShow
    },
    expandScenarios () {
      if (this.collapseScenariosShow) {
        $('.search-list .collapse').collapse('show')
      } else {
        $('.search-list .collapse').collapse('hide')
      }
      this.collapseScenariosShow = !this.collapseScenariosShow
    },

    // Reset all input fields.
    resetFields () {
      // Empty all fields:
      $(".search-details input[type='text'], .search-details input[type=date]").val('')

      // Todo, reset sliders to min/max
      const sliders = $('.ion-range')

      // Deselect all bootstrap select pickers
      $('.search-details .select-picker').selectpicker('deselectAll')

      $.each(sliders, (key, slider) => {
        const irs = $(slider).data('ionRangeSlider')

        // Reset /from & to to min/max.
        irs.update({
          from: irs.options.min,
          to: irs.options.max
        })
      })

      bus.$emit('clearSearch')
    }

  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';

.search-columns {
  padding-bottom: (50px + $padding);
  padding-top: 50px;
  height: 100vh;
  position: relative;  // needs to be relative for the DateTimePicker.js widget

  .action-bar {
    border-bottom: $border;
    padding: $padding 0;

    .search-container: {
      margin: $padding;
    }

    .hidden-md {
      display: inline-block !important;
    }
  }

  .bordered {
    border-right: $border;
  }

  .btn-text {
    max-width: 45%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .column {
    padding: 0 $padding $padding;
  }

  .scrollable {
    overflow-y: auto;
  }

  .visible-xs-block {
    background-color: $col-bw-3;
    border-radius: 5px;
    margin: $padding 0;
    padding: $padding;

    &.visible-xs-block-first {
      border-top: 0;
    }
  }
}

</style>
