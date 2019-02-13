export default function updateUser (store) {
  store.dispatch('fetchUser').then((json) => {
    console.log('updateuser', json)
    store.state.user = json
  })
    .catch((jqXhr) => {
      store.state.failedUpdate(jqXhr)
      store.state.updating = false
    })
}
