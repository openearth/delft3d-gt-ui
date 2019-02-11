<template>
  <div id="template-model-control-menu">

  <div class="model-control-menu btn-group pull-right dropdown">
    <button class="btn btn-default" @click.stop="expandScenarios">
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

    <ul class="dropdown-menu">

      <li :class="{ disabled: numSelectedModels === 0 || someSelectedModelsArePublished() }">
        <a @click.stop="startSelectedModels">
          <i class="fa fa-fw fa-play" aria-hidden="true"></i> Start model<span v-if="numSelectedModels > 1">s</span>
        </a>
      </li>

      <li :class="{ disabled: numSelectedModels === 0 || someSelectedModelsArePublished() }">
        <a @click.stop="stopSelectedModels">
          <i class="fa fa-fw fa-stop" aria-hidden="true"></i> Stop model<span v-if="numSelectedModels > 1">s</span>
        </a>
      </li>

      <li :class="{ disabled: numSelectedModels === 0 || someSelectedModelsArePublished() }">
        <a @click.stop="resetSelectedModels">
          <i class="fa fa-fw fa-fast-backward" aria-hidden="true"></i> Reset model<span v-if="numSelectedModels > 1">s</span>
        </a>
      </li>

      <li :class="{ disabled: numSelectedModels === 0 || someSelectedModelsArePublished() }">
        <a @click.stop="redoSelectedModels">
          <i class="fa fa-fw fa-level-up" aria-hidden="true"></i> Update model<span v-if="numSelectedModels > 1">s</span>
        </a>
      </li>

      <li :class="{ disabled: numSelectedModels === 0 || someSelectedModelsArePublished() }">
        <a @click.stop="deleteSelectedModels">
          <i class="fa fa-fw fa-times" aria-hidden="true"></i> Delete model<span v-if="numSelectedModels > 1">s</span>
        </a>
      </li>

      <li role="separator" class="divider"></li>

      <li :class="{ disabled: numSelectedModels === 0  || !someSelectedModelsAreFinished() || someSelectedModelsAreAlreadyPublished('company') }">
        <a @click.stop="shareSelectedModels('company')">
          <i class="fa fa-fw fa-group" aria-hidden="true"></i> Share model<span v-if="numSelectedModels > 1">s</span> with Company
        </a>
      </li>

      <li :class="{ disabled: numSelectedModels === 0  || !someSelectedModelsAreFinished()  || someSelectedModelsAreAlreadyPublished('world') }">
        <a @click.stop="shareSelectedModels('world')">
          <i class="fa fa-fw fa-globe" aria-hidden="true"></i> Share model<span v-if="numSelectedModels > 1">s</span> with World
        </a>
      </li>

      <li role="separator" class="divider"></li>

      <li :class="{ disabled: numSelectedModels === 0 || (option.onlyFinished && !someSelectedModelsAreFinished()) }" v-for="(key, option) in downloadOptions" :key="option">
        <div class="dropdown-menu-checkbox" @click.self.stop.prevent="toggle(key)">
          <input type="checkbox" class="downloadoption"  :value="key" v-model="downloadOptions['key']" :disabled="numSelectedModels === 0 || (option.onlyFinished && !someSelectedModelsAreFinished())"> {{ option.verbose }}
        </div>
      </li>

      <li :class="{ disabled: numSelectedModels === 0 || !anyDownloadsSelected }">
        <a @click.stop="downloadSelectedModels">
          <i class="fa fa-fw fa-download" aria-hidden="true"></i> Dowload data from model<span v-if="numSelectedModels > 1">s</span>
        </a>
      </li>

    </ul>

    <confirm-dialog dialog-id="delete-runs" confirm-button-title="Delete">
      <template slot="title">
        Remove model(s)?
      </template>
      <template slot="body">
        <p>Are you sure you want to delete <span v-if="numSelectedModels > 1">these models</span><span v-if="numSelectedModels == 1">this model</span>? This action cannot be undone.</p>
      </template>
    </confirm-dialog>

    <confirm-dialog dialog-id="share-runs" confirm-button-title="Share">
      <template slot="title">
        Share model(s)?
      </template>
      <template slot="body">
        <p>Are you sure you want to share <span v-if="numSelectedModels > 1">these models</span><span v-if="numSelectedModels == 1">this model</span>? This action cannot be undone.</p>
      </template>
    </confirm-dialog>

    <confirm-dialog dialog-id="reset-runs" confirm-button-title="Reset">
      <template slot="title">
        Reset model(s)?
      </template>
      <template slot="body">
        <p>Are you sure you want to reset <span v-if="numSelectedModels > 1">these models</span><span v-if="numSelectedModels == 1">this model</span>? This action cannot be undone.</p>
      </template>
    </confirm-dialog>

    <confirm-dialog dialog-id="redo-runs" confirm-button-title="Update">
      <template slot="title">
        Update model(s)?
      </template>
      <template slot="body">
        <p>Are you sure you want to update <span v-if="numSelectedModels > 1">these models</span><span v-if="numSelectedModels == 1">this model</span>? This action cannot be undone.</p>
      </template>
    </confirm-dialog>

    <confirm-dialog dialog-id="stop-runs" confirm-button-title="Stop">
      <template slot="title">
        Stop model(s)?
      </template>
      <template slot="body">
        <p>Are you sure you want to stop <span v-if="numSelectedModels > 1">these models</span><span v-if="numSelectedModels == 1">this model</span>? This action cannot be undone.</p>
      </template>
    </confirm-dialog>

  </div>
</div>
</template>

<script>
import store from '../store.js'
import _ from 'lodash'
import $ from 'jquery'
import ConfirmDialog from './ConfirmDialog'

import {
  getDialog
} from '../templates.js'
export default {
  template: '#template-model-control-menu',

  data: function () {
    return {
      collapseShow: true,
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
    anyDownloadsSelected: function () {
      return _.values(this.downloadOptions).some(function (el) {
        return el.active
      })
    },
    numSelectedModels: function () {
      if (store.dispatch('getSelectedModels') !== undefined) {
        return store.dispatch('getSelectedModels').length
      } else {
        return -1
      }
    }
  },

  /* eslint-disable camelcase */

  watch: {
    numSelectedModels: function () {
      if (this.numSelectedModels === 0) {
        _.each(this.downloadOptions, function (option) {
          option.active = false
        })
      }
      if (!this.someSelectedModelsAreFinished) {
        _.each(
          _.filter(this.downloadOptions, function (option) {
            return option.onlyFinished
          }),
          function (option) {
            option.active = false
          })
      }
    }
  },

  /* eslint-enable camelcase */

  methods: {
    expandScenarios: function () {
      if (this.collapseShow) {
        $('.scenario-card .collapse').collapse('show')
      } else {
        $('.scenario-card .collapse').collapse('hide')
      }
      this.collapseShow = !this.collapseShow
    },

    resetSelectedModels: function () {
      if (this.someSelectedModelsArePublished()) {
        return
      }

      // Get a confirm dialog
      this.deleteDialog = getDialog(this, 'confirm-dialog', 'reset-runs')

      this.deleteDialog.onConfirm = () => {
        store.dispatch('resetSelectedModels')

        this.deleteDialog.hide()
      }
      this.deleteDialog.showAlert(false)

      // Show the dialog:
      this.deleteDialog.show()
    },
    redoSelectedModels: function () {
      if (this.someSelectedModelsArePublished()) {
        return
      }

      // Get a confirm dialog
      this.redoDialog = getDialog(this, 'confirm-dialog', 'redo-runs')

      this.redoDialog.onConfirm = () => {
        store.dispatch('redoSelectedModels')

        this.redoDialog.hide()
      }
      this.redoDialog.showAlert(false)

      // Show the dialog:
      this.redoDialog.show()
    },
    someSelectedModelsAreFinished: function () {
      return _.values(store.dispatch('getSelectedModels')).some(function (model) {
        return model.data.state === 'Finished'
      })
    },
    someSelectedModelsArePublished: function () {
      return _.values(store.dispatch('getSelectedModels')).some(function (model) {
        return model.data.shared !== 'p'
      })
    },
    someSelectedModelsAreAlreadyPublished: function (domain) {
      if (domain === 'world') {
        return _.values(store.dispatch('getSelectedModels')).some(function (model) {
          return model.data.shared === 'w'
        })
      }
      if (domain === 'company') {
        return _.values(store.dispatch('getSelectedModels')).some(function (model) {
          return model.data.shared === 'c' || model.data.shared === 'w'
        })
      }
      return false
    },
    startSelectedModels: function () {
      if (this.someSelectedModelsArePublished()) {
        return
      }
      store.dispatch('startSelectedModels')
    },

    stopSelectedModels: function () {
      if (this.someSelectedModelsArePublished()) {
        return
      }

      // Get a confirm dialog
      this.deleteDialog = getDialog(this, 'confirm-dialog', 'stop-runs')

      this.deleteDialog.onConfirm = () => {
        store.dispatch('stopSelectedModels')

        this.deleteDialog.hide()
      }
      this.deleteDialog.showAlert(false)

      // Show the dialog:
      this.deleteDialog.show()
    },

    deleteSelectedModels: function () {
      if (this.someSelectedModelsArePublished()) {
        return
      }

      // Get a confirm dialog
      this.deleteDialog = getDialog(this, 'confirm-dialog', 'delete-runs')

      this.deleteDialog.onConfirm = () => {
        store.dispatch('deleteSelectedModels')

        this.deleteDialog.hide()
      }
      this.deleteDialog.showAlert(false)

      // Show the dialog:
      this.deleteDialog.show()
    },

    shareSelectedModels: function (domain) {
      if (!this.someSelectedModelsAreFinished || this.someSelectedModelsAreAlreadyPublished(domain)) {
        return
      }

      // Get a confirm dialog
      this.shareDialog = getDialog(this, 'confirm-dialog', 'share-runs')

      this.shareDialog.onConfirm = () => {
        store.dispatch('shareSelectedModels', domain)

        this.shareDialog.hide()
      }
      this.shareDialog.showAlert(false)

      // Show the dialog:
      this.shareDialog.show()
    },

    downloadSelectedModels: function () {
      if (this.numSelectedModels === 0 || !this.anyDownloadsSelected) {
        return // nothing to do
      }
      store.dispatch('downloadSelectedModels', this.downloadOptions)
    },

    toggle: function (id) {
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

.model-control-menu {
  a {
    cursor: pointer;
    user-select: none;
  }

  .dropdown-menu-checkbox {
    cursor: pointer;
    padding: 3px 20px;

    &:hover {
      background-color: $col-bw-1;
    }

    input {
      &[type='checkbox'] {
        margin: 0;
      }
    }
  }

  .disabled {
    cursor: not-allowed;

    .dropdown-menu-checkbox {
      color: $col-bw-5;
      cursor: not-allowed;
    }
  }
}
</style>
