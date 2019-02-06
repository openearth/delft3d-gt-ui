<template id="template-user-details">
  <ul class="nav navbar-nav">
    <li class="dropdown">
      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
        <span class="fa fa-user" aria-hidden="true"></span>
        {{ sharedState.user.first_name }} {{ sharedState.user.last_name }}
        <span class="caret"></span>
      </a>
      <div class="dropdown-menu">
        <li><a href="/logout/" title="Log out" class="dropdown-item">Logout <span class="fa fa-sign-out" aria-hidden="true"></span></a></li>
      </div>
    </li>
  </ul>

</template>

<script>
import store from '../store.js'

export default {
  store,
  template: '#template-user-details',
  data: function () {
    return {
      sharedState: store.state
    }
  }
}
</script>

<style>
</style>
