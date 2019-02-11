export default function stopSync (store) {
  clearInterval(store.interval)
  store.interval = null
}
