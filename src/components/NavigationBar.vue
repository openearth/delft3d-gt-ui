<template>

    <nav class="navbar navbar-inverse navbar-default navbar-static-top" id="top-bar">

      <div class="container-fluid">

        <div class="navbar-header">

          <a href="/" class="navbar-brand">
            <img src="../assets/images/logo/delft3d-gt-logo.svg" alt="logo" id="logoimage"/>
            Global Tide and Surge Model
          </a>

          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>

        </div>

        <div id="navbar" class="collapse navbar-collapse">

          <ul class="nav navbar-nav navbar-left">
            <li :class="{'active': $route.name === 'home'}"><router-link :to="{name: 'home'}" title="Create scenario">Database</router-link></li>
            <li :class="{'active': $route.name === 'scenarios-create'}"><router-link :to="{name: 'scenarios-create'}" title="Create scenario">Scenario builder</router-link></li>
            <li><a href="docs/User_Manual_Delft3D-Geological_Tool.pdf" title="Download Manual" target="_blank">Manual</a></li>
          </ul>

          <!-- <ul class="nav navbar-nav navbar-left">
            <li :class="{'active': $route.path === '/'}"><router-link to="/" title="Create scenario">Database</router-link></li>
            <li :class="{'active': $route.path.startsWith('/scenarios/create') }"><router-link to="/" title="Create scenario">Scenario builder</router-link></li>
            <li><a href="" title="Download Manual" target="_blank" class="disabled">Manual</a></li>
          </ul> -->

          <!-- <user-details></user-details> -->

        </div>

      </div>

    </nav>

</template>

<script></script>

<style lang="scss">
@import '../assets/variables.scss';
@-moz-keyframes spin {
  0% {width: 0; height: 0; left: 0px; }
  95% { -moz-transform: rotate(380deg); width: 51px; height: 51px; }
  100% { -moz-transform: rotate(360deg); }
}
@-webkit-keyframes spin {
  0% {width: 0; height: 0; left: 0px; }
  95% { -webkit-transform: rotate(380deg); width: 51px; height: 51px; }
  100% { -webkit-transform: rotate(360deg); }
}
@keyframes spin {
  0% {width: 0; height: 0; left: 0px; }
  95% { transform: rotate(380deg); width: 51px; height: 51px;}
  100% { transform: rotate(360deg); }
}

.navbar-static-top {
  border-width: 0 0 0px;
}

.disabled {
  pointer-events: none;
  cursor: default;
}

.navbar {
  margin-bottom: 0;  // override default bootstrap value

  background-image: -webkit-linear-gradient(left, #103551, #3a5a6f, #66818e, #96a9af, #cad2d3);
  background-image: -o-linear-gradient(left, #103551, #3a5a6f, #66818e, #96a9af, #cad2d3);
  background-image: linear-gradient(to right, #103551, #3a5a6f, #66818e, #96a9af, #cad2d3);

  #logoimage {
    float: left;
    position: relative;
    height: 51px;
    width: 51px;
    margin: -15px 15px 15px -15px;
    z-index: 1;
    -webkit-animation: sping 4s ease-in;
    -moz-animation: spin 4s ease-in;
    animation: spin 4s ease-in;
    min-width: 51px;
  }

  &.navbar-default .active > a,
  &.navbar-default .active > a:hover,
  &.navbar-default .active > a:focus {
    background: $col-bw-4;
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
    .navbar-nav.navbar-left{
      &:first-child {
        margin-left: 0;
      }
    }
  }
}
</style>
