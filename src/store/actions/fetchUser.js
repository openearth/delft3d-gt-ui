

export default function fetchUser (context) {
  if (context.state.reqUser !== undefined) {
    context.state.reqUser.abort()
  }
  return new Promise((resolve, reject) => {
    context.state.user = $.ajax({ url: 'api/v1/users/me/', data: context.state.params, traditional: true, dataType: 'json' })
      .done(function (json) {
        console.log('fetchuser worked', json)
        resolve(json[0])
      })
      .fail(function (jqXhr) {
        reject(jqXhr)
      })
  })
}
