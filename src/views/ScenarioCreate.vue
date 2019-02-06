<template>
  <div>
    Scenario create
  </div>
</template>

<script>
export default {
  mounted () {
    fetch('http://dl-026.xtr.deltares.nl/api/v1/scenarios/?search=&created_before=&created_after=&_=1549381521490', { credentials: 'include', mode: 'cors' })
      .then(response => {
        return response.json
      })
      .then(resp => {
        console.log(resp)
      })
  }
}
</script>
