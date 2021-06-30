<template>
  <div id="app">
    <navigation-bar>
    </navigation-bar>
    <router-view/>
  </div>
</template>

<script>
import NavigationBar from './components/NavigationBar'

export default {
  components: {
    NavigationBar
  }
}

</script>

<style lang="scss">
@import './assets/main.scss';

.app {
  height: 100%;
  overflow-y: hidden;
}
</style>
