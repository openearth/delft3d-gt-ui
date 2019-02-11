export default function startSync (store) {
  // var x = 0
  // var intervalID = setInterval(() => {
  //   store.dispatch('update')
  //   // Your logic here
  //
  //   if (++x === 5) {
  //     window.clearInterval(intervalID)
  //   }
  // }, )
  console.log('startSync, checking updateInterval', store.state.updateInterval)
  store.interval = setInterval(() => { store.dispatch('update') }, store.state.updateInterval)
}
