<template>
  <nav class="navbar navbar-expand-lg fixed-top navbar-light py-0 pl-0">
    <div class="logoholder">
      <img src="../assets/images/logo/delft3d-gt-logo.svg" alt="logo" id="logoimage" class="p-auto" />
    </div>

    <a class="navbar-brand ml-2" href="/">
      Delft3D Geological Tool
    </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarToggleExternalContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav mr-auto nav-pills">
        <li :class="{'active': $route.name === 'home'}" class="nav-item">
          <router-link class="nav-link my-auto" :to="{name: 'home'}" title="Create scenario">Database</router-link>
        </li>
        <li :class="{'active': $route.name === 'scenarios-create'}" class="nav-item">
          <router-link class="nav-link my-auto" :to="{name: 'scenarios-create'}" title="Create scenario">
            Scenario builder
          </router-link>
        </li>
        <li class="nav-item">
          <a class="nav-link my-auto" href="docs/User_Manual_Delft3D-Geological_Tool.pdf" title="Download Manual" target="_blank">
            Manual
          </a>
        </li>
      </ul>
      <user-details></user-details>
    </div>
  </nav>
</template>

<script>
import UserDetails from './UserDetails'

export default {
  components: {
    UserDetails
  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';
@-moz-keyframes spin {
    0% {
        width: 0;
        height: 0;
        left: 0;
    }
    95% {
        -moz-transform: rotate(380deg);
        width: 51px;
        height: 51px;
    }
    100% {
        -moz-transform: rotate(360deg);
    }
}
@-webkit-keyframes spin {
    0% {
        width: 0;
        height: 0;
        left: 0;
    }
    95% {
        -webkit-transform: rotate(380deg);
        width: 51px;
        height: 51px;
    }
    100% {
        -webkit-transform: rotate(360deg);
    }
}
@keyframes spin {
    0% {
        width: 0;
        height: 0;
        left: 0;
    }
    95% {
        transform: rotate(380deg);
        width: 51px;
        height: 51px;
    }
    100% {
        transform: rotate(360deg);
    }
}

.navbar-static-top {
    border-width: 0 0 0;
}

.disabled {
    pointer-events: none;
    cursor: default;
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
