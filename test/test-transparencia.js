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

  describe('get', function() {
    beforeEach(function (done) {
      sinon.stub(request, 'get');
      done();
    });

    afterEach(function (done) {
      request.get.restore();
      done();
    });

    it('should use the token', function() {
      transp.get('URL');

      var expected = {'App-Token': token};
      var actual = request.get.getCall(0).args[0].headers;

      assert(request.get.calledOnce);
      assert.deepEqual(actual, expected);
    });

    it('should use data and url as parameters', function() {
      transp.get('URL', {estado: 'SP'});

      var expected = {estado: 'SP'};
      var actual = request.get.getCall(0).args[0].qs;

      assert(request.get.calledOnce);
      assert.deepEqual(actual, expected);
    });
  });

  describe('candidatos', function() {
    beforeEach(function (done) {
      sinon.stub(request, 'get');
      done();
    });

    afterEach(function (done) {
      request.get.restore();
      done();
    });

    it('call correct list endpoint', function() {
      transp.candidatos().get();

      var expected = 'https://api.transparencia.org.br/api/v1/candidatos';
      var actual = request.get.getCall(0).args[0].uri;

      assert(request.get.calledOnce);
      assert.equal(actual, expected);
    });

    it('call correct /candidato endpoint with params', function () {
      transp.candidatos({estado: 'SP', cargo: 3}).get();

      var expected = {estado: 'SP', cargo: 3};
      var actual = request.get.getCall(0).args[0].qs;

      assert(request.get.calledOnce);
      assert.deepEqual(actual, expected);
    });

    it('call correctly /candidato/id endpoint', function () {
      transp.candidatos('ID').get();

      var expected = 'https://api.transparencia.org.br/api/v1/candidatos/ID';
      var actual = request.get.getCall(0).args[0].uri;

      assert(request.get.calledOnce);
      assert.equal(actual, expected);
    });

    it('call correct /candidato/id/doadores endpoint with params', function () {
      transp.candidatos('ID').doadores({anoEleitoral: '2010'}).get();

      var expected = {anoEleitoral: '2010'};
      var actual = request.get.getCall(0).args[0].qs;

      assert(request.get.calledOnce);
      assert.deepEqual(actual, expected);
    });
  });
});
