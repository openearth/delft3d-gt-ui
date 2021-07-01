<template>
  <div class="app">
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

<style scoped>
.app {
  height: 100%;
}
</style>
