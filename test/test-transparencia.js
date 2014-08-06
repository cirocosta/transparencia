'use strict';

jest.autoMockOff();
var Transparencia = require('../src/transparencia');

describe('Transparencia', function() {
  it('be sane', function() {
    expect(!!Transparencia).toBe(true);
  });

  it('should throw if no token passed to constructor', function() {
    var badConstructor = function () {
      new Transparencia();
    };
    var goodConstructor = function () {
      new Transparencia('token');
    };

    expect(goodConstructor).not.toThrow();
    expect(badConstructor).toThrow();
  });
});
