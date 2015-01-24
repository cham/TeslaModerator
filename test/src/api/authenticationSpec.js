'use strict';

var SandboxedModule = require('sandboxed-module');
var sinon = require('sinon');
var authentication;

describe('authentication', function(){
    var sandbox;
    var req;
    var fakeYargs;
    var fakeApiRequest;
    var makeRequestStub;

    beforeEach(function(){
        sandbox = sinon.sandbox.create();

        fakeYargs = {
            argv: {
                moderators: 'foobar'
            }
        };

        makeRequestStub = sandbox.stub();

        fakeApiRequest = {
            makeRequest: makeRequestStub
        };

        authentication = SandboxedModule.require('../../../src/api/authentication', {
            requires: {
                yargs: fakeYargs,
                './apiRequest': fakeApiRequest
            }
        });

        req = {
            session: {
                authenticated: true
            }
        };
    });

    afterEach(function(){
        sandbox.restore();
    });

    describe('isAuthenticated', function(){
        it('returns true if the current session is authenticated', function(){
            expect(authentication.isAuthenticated(req)).toEqual(true);
        });

        it('returns false if the current session is not authenticated', function(){
            req.session.authenticated = false;
            expect(authentication.isAuthenticated(req)).toEqual(false);
        });

        it('returns false if there is no authenticated property on the session', function(){
            delete req.session.authenticated;
            expect(authentication.isAuthenticated(req)).toEqual(false);
        });

        it('returns false if there is no session', function(){
            delete req.session;
            expect(authentication.isAuthenticated(req)).toEqual(false);
        });
    });

    describe('login', function(){
        var loginOptions;

        beforeEach(function(){
            delete req.session.authenticated;
            loginOptions = {
                username: 'foobar',
                password: 'barfoo'
            };
        });

        describe('with invalid options', function(){
            it('throws if username is not supplied', function(){
                delete loginOptions.username;
                expect(function(){
                    return authentication.login(req, loginOptions);
                }).toThrow('username is required');
            });

            it('throws if password is not supplied', function(){
                delete loginOptions.password;
                expect(function(){
                    return authentication.login(req, loginOptions);
                }).toThrow('password is required');
            });

            it('throws if the username is not in the user whitelist', function(){
                loginOptions.username = 'a_non_whitelisted_user';
                expect(function(){
                    return authentication.login(req, loginOptions);
                }).toThrow('user is not in the moderator whitelist');
            });
        });

        describe('with valid options', function(){
            var callback;

            beforeEach(function(){
                callback = sandbox.stub();

                authentication.login(req, loginOptions, callback);
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

                it('passes the method option as post', function(){
                    expect(makeRequestOptions.method).toEqual('post');
                });

                it('passes the method url as "/login"', function(){
                    expect(makeRequestOptions.url).toEqual('/login');
                });

                describe('the form hash', function(){
                    var formOptions;

                    beforeEach(function(){
                        formOptions = makeRequestOptions.form;
                    });

                    it('passes the form option as a hash', function(){
                        expect(typeof formOptions).toEqual('object');
                    });

                    it('passes the username as in the form as "username"', function(){
                        expect(formOptions.username).toEqual('foobar');
                    });

                    it('passes the password as in the form as "password"', function(){
                        expect(formOptions.password).toEqual('barfoo');
                    });
                });
            });

            describe('the makeRequest callback', function(){
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

                    it('sets authenticated to true on req.session', function(){
                        expect(req.session.authenticated).toEqual(true);
                    });

                    it('executes the callback passed to login', function(){
                        expect(callback.calledOnce).toEqual(true);
                    });

                    it('passes no errors to the callback', function(){
                        expect(callback.args[0][0]).not.toBeDefined();
                    });
                });

                describe('when resolved with an error', function(){
                    beforeEach(function(){
                        makeRequestStub.args[0][1](new Error('user not found'));
                    });

                    it('sets authenticated to false on req.session', function(){
                        expect(req.session.authenticated).toEqual(false);
                    });

                    it('executes the callback passed to login', function(){
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

    describe('logout', function(){
        beforeEach(function(){
            authentication.logout(req);
        });

        it('sets authenticated to false on req.session', function(){
            expect(req.session.authenticated).toEqual(false);
        });
    });
});
