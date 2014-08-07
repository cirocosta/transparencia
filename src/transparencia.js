'use strict';

var request = require('request')
  , qs = require('querystring')
  , q = require('q')
  , API_SERVER = 'https://api.transparencia.org.br/api/v1';


function Transparencia (token) {
  if (!token) throw new Error('A token must be specified.')

  this.token = token;
}

Transparencia.prototype._get = function(url) {
  var dfd = q.defer();

  request.get({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: {
      'App-Token': this.token
    }}, function (err, res, body) {
      if (err)
        return dfd.reject(err);

      dfd.resolve(res);
    });

  return dfd.promise;
};

Transparencia.prototype.candidatos = function(id, end) {
  var url = id
    ? API_SERVER + '/candidatos/' + id
    : API_SERVER + '/candidatos';

  return this._get(url);
};

module.exports = Transparencia;
