'use strict';

var Transparencia = require('../src/transparencia')
  , assert = require('assert')
  , sinon = require('sinon')
  , request = require('request');

describe('Transparencia', function() {
  it('be sane', function() {
    assert(!!Transparencia);
  });

  it('should throw if no token passed to constructor', function() {
    var badConstructor = function () {
      new Transparencia();
    };
    var goodConstructor = function () {
      new Transparencia('token');
    };

    assert.doesNotThrow(goodConstructor);
    assert.throws(badConstructor);
  });

  var token = 'TOKEN';
  var transp = new Transparencia(token);

  describe('_get', function() {
    beforeEach(function (done) {
      sinon.stub(request, 'get');
      done();
    });

    afterEach(function (done) {
      request.get.restore();
      done();
    });

    it('should use the token', function() {
      transp._get('URL');

      var expected = {'App-Token': token};
      var actual = request.get.getCall(0).args[0].headers;

      assert(request.get.calledOnce);
      assert.deepEqual(actual, expected);
    });

    it('should use data', function() {
      transp._get('URL', {estado: 'SP'});

      var expected = {estado: 'SP'};
      var actual = request.get.getCall(0).args[0].qs;

      assert(request.get.calledOnce);
      assert.deepEqual(actual, expected);
    });
  });

  describe('candidatos', function() {
    beforeEach(function (done) {
      sinon.stub(transp, '_get');
      done();
    });

    afterEach(function (done) {
      transp._get.restore();
      done();
    });

    it('call correct list endpoint', function() {
      transp.candidatos();

      var expected = 'https://api.transparencia.org.br/api/v1/candidatos';
      var actual = transp._get.getCall(0).args[0];

      assert(transp._get.calledOnce);
      assert.equal(actual, expected);
    });

    it('call correct candidato endpoint with params', function () {
      transp.candidatos({estado: 'SP', cargo: 3});

      var expected = {estado: 'SP', cargo: 3};
      var actual = transp._get.getCall(0).args[1];

      assert(transp._get.calledOnce);
      assert.deepEqual(actual, expected);
    });

    it('call correct candidato/id endpoint', function () {
      transp.candidatos('ID');

      var expected = 'https://api.transparencia.org.br/api/v1/candidatos/ID';
      var actual = transp._get.getCall(0).args[0];

      assert(transp._get.calledOnce);
      assert.equal(actual, expected);
    });

  });
});
