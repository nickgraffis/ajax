type Method = 'get' | 'post' | 'put' | 'delete'
type ReturnMethods = 'then' | 'catch' | 'always' | 'abort'

// If you are trying to use with nodejs
const XMLHttpRequest = 
  typeof window !== 'undefined' && window.XMLHttpRequest
    ? window.XMLHttpRequest
    :  require('xmlhttprequest').XMLHttpRequest
    
export function ajax (options: { baseUrl?: any; method?: any; url?: any; data?: any }) {
  var methods: Method[] = ['get', 'post', 'put', 'delete']
  options = options || {}
  options.baseUrl = options.baseUrl || ''
  if (options.method && options.url) {
    return xhrConnection(
      options.method,
      options.baseUrl + options.url,
      maybeData(options.data),
      options
    )
  }
  return methods.reduce(function (acc, method) {
    acc[method] = function (url: any, data: any) {
      return xhrConnection(
        method,
        options.baseUrl + url,
        maybeData(data),
        options
      )
    }
    return acc
  }, {} as any)
}

function maybeData (data: any) {
  return data || null
}

function xhrConnection (type: string, url: any, data: Document | XMLHttpRequestBodyInit | null | undefined, options: { baseUrl?: any; method?: any; url?: any; data?: any; hasOwnProperty?: any; headers?: any; }) {
  var returnMethods: ReturnMethods[] = ['then', 'catch', 'always']
  var promiseMethods = returnMethods.reduce(function (promise, method) {
    promise[method] = function (callback: any) {
      promise[method] = callback
      return promise
    }
    return promise
  }, {} as any)
  var xhr = new XMLHttpRequest()
  var featuredUrl = getUrlWithData(url, data, type)
  xhr.open(type, featuredUrl, true)
  xhr.withCredentials = options.hasOwnProperty('withCredentials')
  setHeaders(xhr, options.headers, data)
  xhr.addEventListener('readystatechange', ready(promiseMethods, xhr), false)
  xhr.send(isObject(data) ? JSON.stringify(data) : data)
  promiseMethods.abort = function () {
    return xhr.abort()
  }
  return promiseMethods
}

function getUrlWithData (url: string, data: Document | XMLHttpRequestBodyInit | null | undefined, type: string) {
  if (type.toLowerCase() !== 'get' || !data) {
    return url
  }
  var dataAsQueryString = objectToQueryString(data)
  var queryStringSeparator = url.indexOf('?') > -1 ? '&' : '?'
  return url + queryStringSeparator + dataAsQueryString
}

function setHeaders (xhr: XMLHttpRequest, headers: { [x: string]: any; }, data: Document | XMLHttpRequestBodyInit | null | undefined) {
  headers = headers || {}
  if (!hasContentType(headers)) {
    headers['Content-Type'] = isObject(data)
      ? 'application/json'
      : 'application/x-www-form-urlencoded'
  }
  Object.keys(headers).forEach(function (name) {
    (headers[name] && xhr.setRequestHeader(name, headers[name]))
  })
}

function hasContentType (headers: { [x: string]: any; }) {
  return Object.keys(headers).some(function (name) {
    return name.toLowerCase() === 'content-type'
  })
}

function ready (promiseMethods: { always: { apply: (arg0: any, arg1: any[]) => void; }; then: { apply: (arg0: any, arg1: any[]) => void; }; catch: { apply: (arg0: any, arg1: any[]) => void; }; }, xhr: XMLHttpRequest) {
  return function handleReady () {
    if (xhr.readyState === xhr.DONE) {
      xhr.removeEventListener('readystatechange', handleReady, false)
      promiseMethods.always.apply(promiseMethods, parseResponse(xhr))

      if (xhr.status >= 200 && xhr.status < 300) {
        promiseMethods.then.apply(promiseMethods, parseResponse(xhr))
      } else {
        promiseMethods.catch.apply(promiseMethods, parseResponse(xhr))
      }
    }
  }
}

function parseResponse (xhr: XMLHttpRequest) {
  var result
  try {
    result = JSON.parse(xhr.responseText)
  } catch (e) {
    result = xhr.responseText
  }
  return [ result, xhr ]
}

function objectToQueryString (data: Document | XMLHttpRequestBodyInit) {
  return isObject(data) ? getQueryString(data) : data
}

function isObject (data: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | null | undefined) {
  return Object.prototype.toString.call(data) === '[object Object]'
}

function getQueryString (obj: Document | XMLHttpRequestBodyInit, prefix?: string | undefined): string {
  return Object.keys(obj).map(function (key) {
    if (obj.hasOwnProperty(key) && undefined !== obj[key as keyof (Document | XMLHttpRequestBodyInit)]) {
      var val = obj[key as keyof (Document | XMLHttpRequestBodyInit)]
      key = prefix ? prefix + '[' + key + ']' : key
      return val !== null && typeof val === 'object' ? getQueryString(val, key) : encode(key) + '=' + encode(val)
    }
  })
    .filter(Boolean)
    .join('&')
}

function encode (value: string | number | boolean) {
  return encodeURIComponent(value)
}

export default ajax