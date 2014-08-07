/**
 * dev.transparencia.org exposes its api methods
 * and structure in json files. We could use
 * that to generate our docs. This extractor
 * fetches info and displays in a great way so
 * that it is easy for us to generate the docs.
 */

'use strict';

var request = require('request');
var BASE_PATH = 'http://dev.transparencia.org.br/api-portal/sites/default/files/swagger/ENTRANCE';
var API_DOCS_PATH = 'http://dev.transparencia.org.br/api-portal/sites/default/files/swagger/api-docs.json';
var q = require('q');

request.get({uri: API_DOCS_PATH, json: true}, function (err, res, body) {
  var promises = [];

  if (err || res.statusCode !== 200)
    throw new Error(err);

  var apiInfo = body;

  for (var i in apiInfo.apis) {
    var api = apiInfo.apis[i];
    api.path = api.path.replace('/../','')

    promises.push(q.nfcall(request.get, {
      json: true,
      uri: BASE_PATH.replace('ENTRANCE', api.path)
    }));
  }

  q.all(promises).then(function (results) {
    for (var i in results) {
      var info = results[i][0].body;

      console.log(info);
    }
  }, function (err) {
    console.error(err);
  });

});


var a = q.nfcall(request.get, API_DOCS_PATH);
a.then(function (r) {
  console.log(r[0].body);
});
