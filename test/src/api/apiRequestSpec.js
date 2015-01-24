'use strict';

var SandboxedModule = require('sandboxed-module');
var sinon = require('sinon');
var request = require('request');
var apiRequest;

describe('apiRequest', function(){
    var sandbox;
    var requestInitStub;

    beforeEach(function(){
        sandbox = sinon.sandbox.create();

        requestInitStub = sandbox.stub(request.Request.prototype, 'init');

        apiRequest = SandboxedModule.require('../../../src/api/apiRequest', {
            requires: {
                request: request
            }
        });
    });

    afterEach(function(){
        sandbox.restore();
    });

    describe('makeRequest', function(){
        var options;
        var callback;

        beforeEach(function(){
            options = {
                method: 'get',
                url: 'http://foo.bar/bish/bash/bosh'
            };

            callback = sandbox.stub();
        });

        describe('required parameters', function(){
            it('throws if method is not specified in options', function(){
                expect(function(){
                    delete options.method;
                    apiRequest.makeRequest(options, callback);
                }).toThrow('method is required');
            });

            it('throws if url is not specified in options', function(){
                expect(function(){
                    delete options.url;
                    apiRequest.makeRequest(options, callback);
                }).toThrow('url is required');
            });
        });

        describe('when called', function(){
            var requestOptions;

            beforeEach(function(){
                apiRequest.makeRequest(options, callback);
                requestOptions = requestInitStub.args[0][0];
            });

            it('calls request once', function(){
                expect(requestInitStub.calledOnce).toEqual(true);
            });

            it('passes the url option from the options passed to makeRequest', function(){
                expect(requestOptions.url).toEqual(options.url);
            });

            it('passes the method option from the options passed to makeRequest', function(){
                expect(requestOptions.method).toEqual(options.method);
            });

            it('passes the encoding option as utf8', function(){
                expect(requestOptions.encoding).toEqual('utf8');
            });

            it('passes the json option as true', function(){
                expect(requestOptions.json).toEqual(true);
            });

            it('passes the gzip option as true', function(){
                expect(requestOptions.gzip).toEqual(true);
            });

            it('passes a callback option', function(){
                expect(requestOptions.callback).toBeDefined();
            });

            describe('when the request resolves with no error', function(){
                var jsonString;

                beforeEach(function(){
                    jsonString = '{"foo":"bar","aNumber":5}';
                    requestOptions.callback(null, {statusCode: 200}, jsonString);
                });

                it('executes the callback passed to makeRequest', function(){
                    expect(callback.calledOnce).toEqual(true);
                });

                it('passes no errors as the first argument', function(){
                    expect(callback.args[0][0]).toEqual(null);
                });

                it('passes the parsed json as the second argument', function(){
                    var data = callback.args[0][1];
                    var keys = Object.keys(data);
                    
                    expect(keys.length).toEqual(2);
                    expect(data.foo).toEqual('bar');
                    expect(data.aNumber).toEqual(5);
                });
            });

            describe('when the request resolves with an error', function(){
                beforeEach(function(){
                    requestOptions.callback(new Error('an error'));
                });

                it('executes the callback passed to makeRequest', function(){
                    expect(callback.calledOnce).toEqual(true);
                });

                it('passes the error as the first argument', function(){
                    expect(callback.args[0][0] instanceof Error).toEqual(true);
                    expect(callback.args[0][0].message).toEqual('an error');
                });
            });

            describe('when the api response contains an error code', function(){
                beforeEach(function(){
                    requestOptions.callback(null, {statusCode: 500});
                });

                it('executes the callback passed to makeRequest', function(){
                    expect(callback.calledOnce).toEqual(true);
                });

                it('passes a generated error as the first argument', function(){
                    expect(callback.args[0][0] instanceof Error).toEqual(true);
                    expect(callback.args[0][0].message).toEqual('API error');
                });
            });
        });
    });
});
