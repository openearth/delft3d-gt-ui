<template>
  <div id="app">
    <navigation-bar></navigation-bar>
    <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
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

</style>
