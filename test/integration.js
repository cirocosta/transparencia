var assert = require('asset');
var fs = require('fs');
var path = require('path');
var filename = path.resolve(__dirname, '../.token');
var token = fs.readFileSync(filename, {encoding: 'utf8'});
