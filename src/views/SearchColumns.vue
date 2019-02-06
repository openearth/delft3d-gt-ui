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
          <model-control-menu :items="items" :models="models"></model-control-menu>
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
      <div class="row full-height">

        <div class="col-sm-2 column full-height bordered scrollable">
          <div class="visible-xs-block visible-xs-block-first">
            <span class="btn-text">Search</span>
            <div class="btn-group pull-right">
              <button class="btn btn-default" @click.stop="expandSearch">
                <i class="fa" :class="[(collapseSearchShow)? 'fa-arrow-down' : 'fa-arrow-up']" aria-hidden="true"></i>
              </button>
              <button type="button" class="btn btn-default" id="btn-reset-search-form" v-on:click="resetFields">Reset</button>
            </div>
          </div>
          <search-details></search-details>
        </div>

        <div class="col-sm-5 col-md-4 col-lg-4 column full-height bordered scrollable">
          <div class="visible-xs-block">
            <span class="btn-text">Database</span>
            <model-control-menu :items="items" :models="models"></model-control-menu>
          </div>
          <search-list :items="items" :models="models" ref="search-list"></search-list>
        </div>

        <div class="col-sm-5 col-md-6 col-lg-6 column full-height scrollable">
          <div class="visible-xs-block">
            <span class="btn-text">Model details</span>
            <button class="btn btn-default pull-right" @click.stop="expandDetails">
              <i class="fa" :class="[(collapseDetailsShow)? 'fa-arrow-down' : 'fa-arrow-up']" aria-hidden="true"></i>
            </button>
          </div>
          <model-details></model-details>
        </div>

      </div>
    </div>
  </div>

</template>

<script>
import SearchDetails from '../components/SearchDetails'
import SearchList from '../components/SearchList'
import ModelDetails from './ModelDetails'
import ModelControlMenu from '../components/ModelControlMenu'
import $ from 'jquery'

export default {
  template: '#template-search-columns',
  data: function () {
    return {
      // items that were found
      collapseDetailsShow: true,
      collapseSearchShow: true,
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
    // TODO, consistent naming
    this.$on('items-found', function (items, models) {
      this.set('items', items)
      this.set('models', models)
    })
  },
  route: {
    data: function (transition) {
      // Refresh data immediatly if user gets here.
      this.$broadcast('updateSearch')
      transition.next()
    }
  },

  computed: {
    checkedBoxes: {
      cache: false,
      get: function () {
        return 1
      }
    }
  },

  methods: {
    expandDetails: function () {
      if (this.collapseDetailsShow) {
        $('.model-details .collapse').collapse('show')
      } else {
        $('.model-details .collapse').collapse('hide')
      }
      this.collapseDetailsShow = !this.collapseDetailsShow
    },
    expandSearch: function () {
      if (this.collapseSearchShow) {
        $('.search-details .collapse').collapse('show')
      } else {
        $('.search-details .collapse').collapse('hide')
      }
      this.collapseSearchShow = !this.collapseSearchShow
    },

    // Reset all input fields.
    resetFields: function () {
      // Empty all fields:
      $(".search-details input[type='text'], .search-details input[type=date]").val('')

      // Todo, reset sliders to min/max
      var sliders = $('.ion-range')

      // Deselect all bootstrap select pickers
      $('.search-details .select-picker').selectpicker('deselectAll')

      $.each(sliders, function (key, slider) {
        var irs = $(slider).data('ionRangeSlider')

        // Reset /from & to to min/max.
        irs.update({
          from: irs.options.min,
          to: irs.options.max
        })
      })

      this.$broadcast('clearSearch')
    }

  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';

.search-columns {
  margin-top: -50px;
  padding-bottom: (50px + $padding);
  padding-top: 50px;
  position: relative;  // needs to be relative for the DateTimePicker.js widget

  .action-bar {
    border-bottom: $border;
    margin-bottom: $padding;
    padding: $padding 0;

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
