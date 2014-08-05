'use strict';

var http = require('http')
  , qs = require('querystring')
  , q = require('q');
  , API_SERVER = 'https://api.transparencia.org.br/api/v1';

function Transparencia (token) {
  this.token = token || throw new Error('A token must be specified.');
}
