<template>
  <div id="template-model-control-menu">

  <div class="model-control-menu btn-group pull-right dropdown">
    <button class="btn btn-default" @click.stop="$emit('expand-scenarios')">
      <i class="fa" :class="[(collapseShow)? 'fa-arrow-down' : 'fa-arrow-up']" aria-hidden="true"></i>
    </button>

    <button type="button"
            class="btn btn-default dropdown-toggle nav-bar-button"
            :class="{ disabled: numSelectedModels === 0 }"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false">
      Selected ({{ numSelectedModels }})
      <span class="caret"></span>
    </button>

    <ul class="dropdown-menu p-2">

      <li :class="{ disabled: numSelectedModels === 0 || someSelectedModelsArePublished() }">
        <a @click.stop="updateModelsBy = {name: 'start'}">
          <i class="fa fa-fw fa-play" aria-hidden="true"></i> Start model<span v-if="numSelectedModels > 1">s</span>
        </a>
      </li>

      <li :class="{ disabled: numSelectedModels === 0 || someSelectedModelsArePublished() }">
        <a @click.stop="updateModelsBy = {name: 'stop'}">
          <i class="fa fa-fw fa-stop" aria-hidden="true"></i> Stop model<span v-if="numSelectedModels > 1">s</span>
        </a>
      </li>

      <li :class="{ disabled: numSelectedModels === 0 || someSelectedModelsArePublished() }">
        <a @click.stop="updateModelsBy = {name: 'reset'}">
          <i class="fa fa-fw fa-fast-backward" aria-hidden="true"></i> Reset model<span v-if="numSelectedModels > 1">s</span>
        </a>
      </li>

      <li :class="{ disabled: numSelectedModels === 0 || someSelectedModelsArePublished() }">
        <a @click.stop="updateModelsBy = {name: 'redo'}">
          <i class="fa fa-fw fa-level-up" aria-hidden="true"></i> Update model<span v-if="numSelectedModels > 1">s</span>
        </a>
      </li>

      <li :class="{ disabled: numSelectedModels === 0 || someSelectedModelsArePublished() }">
        <a @click.stop="updateModelsBy = {name: 'delete'}">
          <i class="fa fa-fw fa-times" aria-hidden="true"></i> Delete model<span v-if="numSelectedModels > 1">s</span>
        </a>
      </li>

      <li role="separator" class="dropdown-divider"></li>

      <li :class="{ disabled: numSelectedModels === 0  || !someSelectedModelsAreFinished() || someSelectedModelsAreAlreadyPublished('company') }">
        <a @click.stop="updateModelsBy = {name: 'share', domain: 'company'}">
          <i class="fa fa-fw fa-group" aria-hidden="true"></i> Share model<span v-if="numSelectedModels > 1">s</span> with Company
        </a>
      </li>

      <li :class="{ disabled: numSelectedModels === 0  || !someSelectedModelsAreFinished()  || someSelectedModelsAreAlreadyPublished('world') }">
        <a @click.stop="updateModelsBy = {name: 'share', domain: 'world'}">
          <i class="fa fa-fw fa-globe" aria-hidden="true"></i> Share model<span v-if="numSelectedModels > 1">s</span> with World
        </a>
      </li>

      <li role="separator" class="dropdown-divider"></li>

      <li :class="{ disabled: numSelectedModels === 0 || (option.onlyFinished && !someSelectedModelsAreFinished()) }" v-for="(option, key) in downloadOptions" :key="key">
        <div class="dropdown-menu-checkbox" @click.self.stop.prevent="toggle(key)">
          <input type="checkbox" class="downloadoption"  :value="downloadOptions[key].active" v-model="downloadOptions[key].active" :disabled="numSelectedModels === 0 || (option.onlyFinished && !someSelectedModelsAreFinished())"> {{ option.verbose }}
        </div>
      </li>

      <li :class="{ disabled: numSelectedModels === 0 || !anyDownloadsSelected }">
        <a @click.stop="downloadSelectedModels">
          <i class="fa fa-fw fa-download" aria-hidden="true"></i> Dowload data from model<span v-if="numSelectedModels > 1">s</span>
        </a>
      </li>

    </ul>

        <!-- Confirm dialog for control checks -->
        <confirm-dialog v-if="updateModelsBy.name" :confirm-button-title="capitalizeFirst(updateModelsBy.name)" :dialogId="`confirm-${updateModelsBy.name}`" @confirm="confirm" @cancel="cancel">
          <template slot="title">
            {{capitalizeFirst(updateModelsBy.name)}} models?
          </template>
          <template slot="body">
            <p>Are you sure you want to {{updateModelsBy.name}} this model? This action cannot be undone.</p>
          </template>
        </confirm-dialog>
  </div>
</div>
</template>

<script>
import store from '../store'
import _ from 'lodash'
import ConfirmDialog from './ConfirmDialog'

export default {
  template: '#template-model-control-menu',
  props: {
    collapseShow: {
      type: Boolean
    }
  },

  data () {
    return {
      showDialog: false,
      updateModelsBy: {},
      downloadOptions: {
        'export_d3dinput': {
          'active': false,
          'onlyFinished': false,
          'verbose': 'Delft3D: input files'
        },
        'export_images': {
          'active': false,
          'onlyFinished': false,
          'verbose': 'Media: output images'
        },
        'export_movie': {
          'active': false,
          'onlyFinished': false,
          'verbose': 'Media: output movies'
        },
        'export_thirdparty': {
          'active': false,
          'onlyFinished': true,
          'verbose': 'Export: RMS / Petrel'
        }
      },
      sharedState: store.state
    }
  },
  components: {
    ConfirmDialog
  },

  computed: {
    anyDownloadsSelected () {
      return _.values(this.downloadOptions).some((el) => {
        return el.active
      })
    },
    numSelectedModels () {
      const selected = store.getters.getSelectedModels
      return selected.length
    }
  },

  /* eslint-disable camelcase */

  watch: {
    numSelectedModels () {
      if (this.numSelectedModels === 0) {
        _.each(this.downloadOptions, (option) => {
          option.active = false
        })
      }
      if (!this.someSelectedModelsAreFinished) {
        _.each(
          _.filter(this.downloadOptions, (option) => {
            return option.onlyFinished
          }),
          (option) => {
            option.active = false
          })
      }
    }
  },

  /* eslint-enable camelcase */

  methods: {
    capitalizeFirst (text) {
      if (typeof text === 'string') {
        // Capitalize the first letter in a string
        return `${text.charAt(0).toUpperCase()}${text.slice(1)}`
      }
    },
    cancel () {
      this.updateModelsBy = {}
    },
    confirm () {
      if (this.someSelectedModelsArePublished()) {
        return
      }
      if (this.updateModelsBy.domain) {
        store.dispatch(`${this.updateModelsBy.name}SelectedModels`, this.updateModelsBy.domain)
      } else {
        store.dispatch(`${this.updateModelsBy.name}SelectedModels`)
      }
      this.updateModelsBy = {}
    },
    someSelectedModelsAreFinished () {
      return _.values(store.getters.getSelectedModels).some((model) => {
        return model.data.state === 'Finished'
      })
    },
    someSelectedModelsArePublished () {
      return _.values(store.getters.getSelectedModels).some((model) => {
        return model.data.shared !== 'p'
      })
    },
    someSelectedModelsAreAlreadyPublished (domain) {
      if (domain === 'world') {
        return _.values(store.getters.getSelectedModels).some((model) => {
          return model.data.shared === 'w'
        })
      }
      if (domain === 'company') {
        return _.values(store.getters.getSelectedModels).some((model) => {
          return model.data.shared === 'c' || model.data.shared === 'w'
        })
      }
      return false
    },
    downloadSelectedModels () {
      if (this.numSelectedModels === 0 || !this.anyDownloadsSelected) {
        return // nothing to do
      }
      store.dispatch('downloadSelectedModels', this.downloadOptions)
    },

    toggle (id) {
      if (this.downloadOptions[id].onlyFinished && !this.someSelectedModelsAreFinished) {
        return
      }
      this.downloadOptions[id].active = !this.downloadOptions[id].active
    }
  }

}

</script>

<style lang="scss">
@import '../assets/variables.scss';

#template-model-control-menu {
  float: right;
}

.model-control-menu {
  a {
    cursor: pointer;
    user-select: none;
  }

  .dropdown-menu-checkbox {
    min-width: 300px;
    cursor: pointer;

    &:hover {
      background-color: $col-bw-1;
    }
  }

  .disabled {
    cursor: not-allowed;

  }
}
</style>
