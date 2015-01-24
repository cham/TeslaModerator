'use strict';

var SandboxedModule = require('sandboxed-module');
var sinon = require('sinon');
var users;

describe('users', function(){
    var sandbox;
    var makeRequestStub;
    var fakeApiRequest;

    beforeEach(function(){
        sandbox = sinon.sandbox.create();

        makeRequestStub = sandbox.stub();

        fakeApiRequest = {
            makeRequest: makeRequestStub
        };

        users = SandboxedModule.require('../../../src/api/users', {
            requires: {
                './apiRequest': fakeApiRequest
            }
        });
    });

    afterEach(function(){
        sandbox.restore();
    });

    describe('changePassword', function(){
        var changePasswordOptions;

        beforeEach(function(){
            changePasswordOptions = {
                username: 'foobar',
                password: 'barfoo'
            };
        });

        describe('required options', function(){
            it('throws if username is not supplied', function(){
                delete changePasswordOptions.username;
                expect(function(){
                    return users.changePassword(changePasswordOptions);
                }).toThrow('username is required');
            });

            it('throws if password is not supplied', function(){
                delete changePasswordOptions.password;
                expect(function(){
                    return users.changePassword(changePasswordOptions);
                }).toThrow('password is required');
            });
        });

        describe('with valid options', function(){
            var callback;

            beforeEach(function(){
                callback = sandbox.stub();

                users.changePassword(changePasswordOptions, callback);
            });

            it('calls apiRequest.makeRequest once', function(){
                expect(makeRequestStub.calledOnce).toEqual(true);
            });

            describe('makeRequest options', function(){
                var makeRequestOptions;

                beforeEach(function(){
                    makeRequestOptions = makeRequestStub.args[0][0];
                });

                it('passes an options hash to makeRequest as the first argument', function(){
                    expect(typeof makeRequestOptions).toEqual('object');
                });

                it('passes the method option as put', function(){
                    expect(makeRequestOptions.method).toEqual('put');
                });

                it('passes the method url as "/user/:username/resetpassword"', function(){
                    expect(makeRequestOptions.url).toEqual('/user/foobar/resetpassword');
                });

                describe('the form hash', function(){
                    var formOptions;

                    beforeEach(function(){
                        formOptions = makeRequestOptions.form;
                    });

                    it('passes the form option as a hash', function(){
                        expect(typeof formOptions).toEqual('object');
                    });

                    it('passes the password as in the form as "password"', function(){
                        expect(formOptions.password).toEqual('barfoo');
                    });
                });

                describe('the callback', function(){
                    it('passes a callback to makeRequest as the second argument', function(){
                        expect(typeof makeRequestStub.args[0][1]).toEqual('function');
                    });

                    describe('when resolved with no errors', function(){
                        var userData;

                        beforeEach(function(){
                            userData = {
                                username: 'foobar'
                            };

                            makeRequestStub.args[0][1](null, userData);
                        });

                        it('executes the callback', function(){
                            expect(callback.calledOnce).toEqual(true);
                        });

                        it('passes no errors to the callback', function(){
                            expect(callback.args[0][0]).toBeFalsey();
                        });
                    });

                    describe('when resolved with an error', function(){
                        beforeEach(function(){
                            makeRequestStub.args[0][1](new Error('user not found'));
                        });

                        it('executes the callback', function(){
                            expect(callback.calledOnce).toEqual(true);
                        });

                        it('passes the error to the callback', function(){
                            expect(callback.args[0][0] instanceof Error).toEqual(true);
                            expect(callback.args[0][0].message).toEqual('user not found');
                        });
                    });
                });
            });
        });
    });

});
