<template id="template-user-details">
  <div class="dropdown">
    <a href="#" class="dropdown-toggle my-auto dropdown-menu-item" id="dropdown-menu-item" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      <span class="fa fa-user" aria-hidden="true"></span>
        {{ sharedState.first_name }}{{ sharedState.last_name }}
    </a>
  <div class="dropdown-menu" aria-labelledby="dropdown-menu-item">
    <a href="/logout/" title="Log out" class="dropdown-item">
      Logout <span class="fa fa-sign-out" aria-hidden="true"></span></a>
  </div>
</div>

</template>

<script>
import store from '../store'
import { mapState } from 'vuex'

export default {
  store,
  template: '#template-user-details',
  computed: mapState({
    sharedState: state => state.user
  })
}
</script>

<style lang="scss">
@import '../assets/variables.scss';

.dropdown-menu-item {
  padding-left: 130px;
}

.dropdown-item {
  width: 160px;
}

.navbar {
    margin-bottom: 0;
    // override default bootstrap value
    height: 51px;
    background-color: $col-bw-3;

    //
    // #navbarNav {
    //   height: 100%;
    // }

    .logoholder {
      float: left;
      position: relative;
      height: 51px;
      width: 51px;
      background-color: $col-bg-d3d;
    }

    #logoimage {
        float: left;
        position: relative;
        height: 51px;
        width: 51px;
        // margin: -15px 0 0 -15px;
        z-index: 1;
        -webkit-animation: sping 4s ease-in;
        -moz-animation: spin 4s ease-in;
        animation: spin 4s ease-in;
        min-width: 51px;
    }

    &.navbar-default .active > a,
    &.navbar-default .active > a:focus,
    &.navbar-default .active > a:hover {
        background: $col-bw-4;
    }
    .nav-item.active {
      background-color: $col-bw-5;
      color: white;
    }

    #navbarNav, .navbar-nav {
      height: 51px;
    }
    .nav-item {
      height: 100%;
      display: flex;
      color: black;
    }
    .navbar-brand {
        font-size: 1em;
    }
}

@media (min-width: $screen-xs-sm) {
    .navbar {
        a.navbar-brand {
            font-size: 18px;
            color: $col-bw-6;
        }
        a.navbar-brand:hover {
            color: $col-bw-4;
        }
    }
    .navbar-inverse .navbar-nav > li > a {
        color: $col-bw-6;
    }

    .navbar-inverse .navbar-nav > li > a:hover {
        color: $col-bw-4;
    }

    .navbar-inverse .navbar-nav > li > a.disabled {
        color: $col-bw-7;
    }

    .navbar-collapse {
        .navbar-nav.navbar-left {
            &:first-child {
                margin-left: 0;
            }
        }
    }
}
</style>
