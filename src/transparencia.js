'use strict';

var request = require('request')
  , qs = require('querystring')
  , q = require('q')
  , API_SERVER = 'https://api.transparencia.org.br/api/v1';

function empty (obj) {
  return Object.keys(obj).length ? true : false;
}

function Transparencia (token) {
  if (!token) throw new Error('A token must be specified.')

  this.token = token;
  this.url = '';
  this.ops = {};
}

Transparencia.prototype.get = function (url, ops) {
  var dfd = q.defer();

  request.get({
    uri: this.url || url,
    rejectUnauthorized: false,
    json: true,
    qs: empty(this.ops) ? this.ops : ops,
    headers: {
      'App-Token': this.token
    }}, function (err, res, body) {
      if (err) dfd.reject(err);
      else dfd.resolve(res);
    });

  return dfd.promise;
};


Transparencia.prototype.bens = function () {
  this.url += '/bens';
};

Transparencia.prototype.candidatos = function (a, b) {
  this.url = API_SERVER + '/candidatos';

  if (typeof a == 'string' || a instanceof String)
    this.url += (this.ops = b || {}, '/' + a);
  else
    this.ops = a || {};

  return this;
};

module.exports = Transparencia;
