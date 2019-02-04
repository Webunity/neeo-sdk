'use strict';

import { expect } from 'chai';
import * as nock from 'nock';
import * as recipe from '../../../../src/lib/recipe/index';

describe('./lib/recipe/index.ts', () => {
  let netMock;

  beforeEach(() => {
    netMock = null;
    nock.cleanAll();
  });

  afterEach(() => {
    if (netMock) {
      expect(netMock.isDone()).to.equal(true);
    }
  });

  it('should get active recipes, but fail due missing parameter', (done) => {
    // @ts-ignore
    const promise = recipe.getActiveRecipes();
    promise.catch((error) => {
      expect(error.message).to.equal('MISSING_BRAIN_PARAMETER');
      done();
    });
  });

  it('should get active recipes, valid response', (done) => {
    netMock = nock('http://192.168.1.1:3000')
      .get('/v1/api/activeRecipes')
      .reply(200, [1, 2, 3]);
    const promise = recipe.getActiveRecipes('192.168.1.1');
    promise.then((result) => {
      expect(result).to.deep.equal([1, 2, 3]);
      done();
    });
  });

  it('should get active recipes, invalid response', (done) => {
    netMock = nock('http://192.168.1.1:3000')
      .get('/v1/api/activeRecipes')
      .reply(200, { foo: 'bar' });
    const promise = recipe.getActiveRecipes('192.168.1.1');
    promise.then((result) => {
      expect(result).to.deep.equal([]);
      done();
    });
  });

  it('should get active recipes, server replies with error 500', (done) => {
    netMock = nock('http://192.168.1.1:3000')
      .get('/v1/api/activeRecipes')
      .reply(500);
    const promise = recipe.getActiveRecipes('192.168.1.1');
    promise.catch((error) => {
      expect(error.response.status).to.equal(500);
      done();
    });
  });

  it('should get all recipes, but fail due missing parameter', (done) => {
    // @ts-ignore
    const promise = recipe.getRecipes();
    promise.catch((error) => {
      expect(error.message).to.equal('MISSING_BRAIN_PARAMETER');
      done();
    });
  });

  it('should get all recipes, invalid response', (done) => {
    netMock = nock('http://192.168.1.1:3000')
      .get('/v1/api/recipes')
      .reply(200, { foo: 'bar' });
    const promise = recipe.getRecipes('192.168.1.1');
    promise.then((result) => {
      expect(result).to.deep.equal([]);
      done();
    });
  });

  it('should get all recipes, valid response', (done) => {
    const answer = [
      {
        type: 'launch',
        detail: {
          devicename: 'TV',
          roomname: 'Living%20Room',
          model: 'LHD32V78HUS%20(HOTEL%20TV)',
          manufacturer: 'Hisense',
          devicetype: 'TV',
        },
        url: {
          identify: 'http://127.0.0.1:3000/v1/systeminfo/identbrain',
          setPowerOn:
            'http://127.0.0.1:3000/v1/projects/home/rooms/6213841889238450176/recipes/6223454602382016512/execute',
          setPowerOff:
            'http://127.0.0.1:3000/v1/projects/home/rooms/6213841889238450176/recipes/6223454602394599424/execute',
          getPowerState:
            'http://127.0.0.1:3000/v1/projects/home/rooms/6213841889238450176/recipes/6223454602382016512/isactive',
        },
        isCustom: false,
        isPoweredOn: false,
        uid: '6223454581767012352',
        powerKey: '6223454602377822208',
      },
    ];
    netMock = nock('http://192.168.1.1:3000')
      .get('/v1/api/recipes')
      .reply(200, answer);
    const promise = recipe.getRecipes('192.168.1.1');
    promise.then((result) => {
      expect(result.length).to.equal(1);
      const action = result[0].action;
      // @ts-ignore
      delete result[0].action;
      expect(result).to.deep.equal(answer);
      expect(typeof action.identify).to.equal('function');
      expect(typeof action.getPowerState).to.equal('function');
      expect(typeof action.powerOn).to.equal('function');
      expect(typeof action.powerOff).to.equal('function');
      done();
    });
  });
});
