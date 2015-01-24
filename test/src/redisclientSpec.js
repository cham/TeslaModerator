'use strict';

var SandboxedModule = require('sandboxed-module');
var sinon = require('sinon');
var redisclient;

describe('redisclient', function(){
    var deferStub;
    var sandbox;
    var fakeQ;
    var fakeRedis;
    var fakeClient;
    var onceStub;
    var resolveStub;
    var rejectStub;
    var thenStub;

    beforeEach(function(){
        sandbox = sinon.sandbox.create();

        resolveStub = sandbox.stub();
        rejectStub = sandbox.stub();
        thenStub = sandbox.stub();

        deferStub = sandbox.stub().returns({
            resolve: resolveStub,
            reject: rejectStub,
            promise: {
                then: thenStub
            }
        });

        onceStub = sandbox.stub();

        fakeQ = {
            defer: deferStub
        };

        fakeClient = {
            once: onceStub
        };

        fakeRedis = {
            createClient: sandbox.stub().returns(fakeClient)
        };

        redisclient = SandboxedModule.require('../../src/redisclient', {
            requires: {
                q: fakeQ,
                redis: fakeRedis
            }
        });
    });

    describe('module initialisation', function(){
        it('creates a new redis client', function(){
            expect(fakeRedis.createClient.calledOnce).toEqual(true);
        });

        it('listens to a two events on the redis client with "on"', function(){
            expect(onceStub.calledTwice).toEqual(true);
        });

        it('listens to the "error" event with "on"', function(){
            expect(onceStub.args[0][0]).toEqual('error');
        });

        it('passes a callback to the "error" event listener', function(){
            expect(typeof onceStub.args[0][1]).toEqual('function');
        });

        it('listens to the "ready" event with "once"', function(){
            expect(onceStub.args[1][0]).toEqual('ready');
        });

        it('passes a callback to the "ready" event listener ', function(){
            expect(typeof onceStub.args[1][1]).toEqual('function');
        });

        it('creates a deferred promise with Q', function(){
            expect(fakeQ.defer.calledOnce).toEqual(true);
        });

        describe('when an "error" event is emitted', function(){
            beforeEach(function(){
                onceStub.args[0][1]();
            });

            it('rejects the promise', function(){
                expect(rejectStub.calledOnce).toEqual(true);
            });
        });

        describe('when a "ready" event is emitted', function(){
            beforeEach(function(){
                onceStub.args[1][1]();
            });

            it('resolves the promise', function(){
                expect(resolveStub.calledOnce).toEqual(true);
            });
        });
    });

    describe('getClient', function(){
        var callback;

        beforeEach(function(){
            callback = sandbox.stub();
            redisclient.getClient(callback);
        });

        it('adds a function to the promise via promise.then', function(){
            expect(thenStub.calledOnce).toEqual(true);
        });

        describe('when the promise is resolved', function(){
            beforeEach(function(){
                thenStub.yield();
            });

            it('executes the callback', function(){
                expect(callback.calledOnce).toEqual(true);
            });

            it('passes the redis client as the first parameter of the callback', function(){
                expect(callback.args[0][0]).toEqual(fakeClient);
            });
        });
    });

    describe('ready', function(){
        var callback;

        beforeEach(function(){
            callback = sandbox.stub();
            redisclient.ready(callback);
        });

        it('adds a function to the promise via promise.then', function(){
            expect(thenStub.calledOnce).toEqual(true);
        });

        describe('when the promise is resolved', function(){
            beforeEach(function(){
                thenStub.yield();
            });

            it('executes the callback', function(){
                expect(callback.calledOnce).toEqual(true);
            });

            it('passes no arguments to the callback', function(){
                expect(callback.args[0].length).toEqual(0);
            });
        });
    });

});
