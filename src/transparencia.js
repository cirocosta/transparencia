'use strict';

var request = require('request')
  , qs = require('querystring')
  , q = require('q')
  , API_SERVER = 'https://api.transparencia.org.br/api/v1';


function Transparencia (token) {
  if (!token) throw new Error('A token must be specified.')

  this.token = token;
}

Transparencia.prototype._get = function (url, data) {
  var dfd = q.defer();

  request.get({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    qs: data,
    headers: {
      'App-Token': this.token
    }}, function (err, res, body) {
      if (err)
        return dfd.reject(err);

      dfd.resolve(res);
    });

  return dfd.promise;
};

// Transparencia.prototype.obj = {
//   get: this._get
// };

Transparencia.prototype.candidatos = function (a, b) {
  var url = API_SERVER + '/candidatos';
  var id, ops;

  if (typeof a == 'string' || a instanceof String)
    url += (ops = b, '/' + a);
  else
    ops = a;

  return this._get(url, ops);

  // var scope = this;

  // return {
  //   get: scope._get,
  //   bens: function () {
  //     return {
  //       get: scope._get
  //     }
  //   }
  // };
};

module.exports = Transparencia;
