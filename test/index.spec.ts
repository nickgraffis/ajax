import { describe, test } from 'vitest'
import { ajax } from "../src"

describe('#AJAX - Test `get` method', function () {
  var request = ajax({ baseUrl: 'https://api.github.com/users/octocat' })

  test('Should return an object (users list)', function (done) {
    request.get('').then(function (response) {
      console.log(response)
      done()
    })
  }, 10000)
})