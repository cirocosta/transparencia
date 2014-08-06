'use strict';

var request = require('request')
  , qs = require('querystring')
  , q = require('q')
  , API_SERVER = 'https://api.transparencia.org.br/api/v1';

var each = Array.prototype.forEach;
var extend = function (obj) {
  each.call(Array.slice.call(arguments, 1), function(source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  });

  return obj;
};

function Transparencia (token) {
  if (!token) throw new Error('A token must be specified.')

  this.token = token;
}

module.exports = Transparencia;
