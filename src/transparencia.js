'use strict';

var request = require('request')
  , qs = require('querystring')
  , q = require('q')
  , API_SERVER = 'https://api.transparencia.org.br/api/v1';

function Transparencia (token) {
  if (!token) throw new Error('A token must be specified.')

  this.token = token;
}
