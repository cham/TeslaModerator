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

    describe('getUsers', function(){
        var callback;
        var filters;
        var sortBy;

        beforeEach(function(){
            filters = {
                startswith: 'ch'
            };
            sortBy = 'urlname';
            callback = sandbox.stub();

            users.getUsers(filters, sortBy, callback);
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

            it('passes the method option as get', function(){
                expect(makeRequestOptions.method).toEqual('get');
            });

            it('passes the method url as "/users"', function(){
                expect(makeRequestOptions.url).toEqual('/users');
            });

            describe('the query string', function(){
                var queryString;

                beforeEach(function(){
                    queryString = makeRequestOptions.qs;
                });

                it('passes the querystring a hash named "qs"', function(){
                    expect(typeof queryString).toEqual('object');
                });

                it('passes the filters in the qs hash', function(){
                    var filterKeys = Object.keys(filters);
                    filterKeys.forEach(function(key){
                        expect(queryString[key]).toEqual(filters[key]);
                    });
                });

                it('passes the sortBy argument in the qs hash', function(){
                    expect(queryString.sortBy).toEqual(sortBy);
                });
            });

            describe('the callback', function(){
                it('passes a callback to makeRequest as the second argument', function(){
                    expect(typeof makeRequestStub.args[0][1]).toEqual('function');
                });

                describe('when resolved with no errors', function(){
                    var users;

                    beforeEach(function(){
                        users = [
                            {
                                username: 'cham'
                            },
                            {
                                username: 'chan'
                            }
                        ];

                        makeRequestStub.args[0][1](null, users);
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
                        makeRequestStub.args[0][1](new Error('something went wrong'));
                    });

                    it('executes the callback', function(){
                        expect(callback.calledOnce).toEqual(true);
                    });

                    it('passes the error to the callback', function(){
                        expect(callback.args[0][0] instanceof Error).toEqual(true);
                        expect(callback.args[0][0].message).toEqual('something went wrong');
                    });
                });
            });
        });
    });

    describe('editUser', function(){
        var callback;
        var username;
        var newDetails;

        beforeEach(function(){
            username = 'cham';
            newDetails = {
                email: 'foo@bar.com',
                banned: true,
                points: 123
            };
            callback = sandbox.stub();
        });

        describe('with email, banned and points parameters', function(){
            beforeEach(function(){
                users.editUser(username, newDetails, callback);
            });

            it('calls apiRequest.makeRequest three times', function(){
                expect(makeRequestStub.calledThrice).toEqual(true);
            });

            describe('the change email call', function(){
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

                it('passes the method url as "/user/:username/changeemail"', function(){
                    expect(makeRequestOptions.url).toEqual('/user/cham/changeemail');
                });

                describe('the form parameter', function(){
                    var form;

                    beforeEach(function(){
                        form = makeRequestOptions.form;
                    });

                    it('passes the form a hash named "form"', function(){
                        expect(typeof form).toEqual('object');
                    });

                    it('passes the email in the form hash', function(){
                        expect(form.email).toEqual('foo@bar.com');
                    });
                });

                describe('the callback', function(){
                    it('passes a callback to makeRequest as the second argument', function(){
                        expect(typeof makeRequestStub.args[0][1]).toEqual('function');
                    });
                });
            });

            describe('the banned call', function(){
                var makeRequestOptions;

                beforeEach(function(){
                    makeRequestOptions = makeRequestStub.args[1][0];
                });

                it('passes an options hash to makeRequest as the first argument', function(){
                    expect(typeof makeRequestOptions).toEqual('object');
                });

                it('passes the method option as put', function(){
                    expect(makeRequestOptions.method).toEqual('put');
                });

                it('passes the method url as "/user/:username/ban"', function(){
                    expect(makeRequestOptions.url).toEqual('/user/cham/ban');
                });

                describe('the callback', function(){
                    it('passes a callback to makeRequest as the second argument', function(){
                        expect(typeof makeRequestStub.args[0][1]).toEqual('function');
                    });
                });
            });

            describe('the points call', function(){
                var makeRequestOptions;

                beforeEach(function(){
                    makeRequestOptions = makeRequestStub.args[2][0];
                });

                it('passes an options hash to makeRequest as the first argument', function(){
                    expect(typeof makeRequestOptions).toEqual('object');
                });

                it('passes the method option as put', function(){
                    expect(makeRequestOptions.method).toEqual('put');
                });

                it('passes the method url as "/user/:username/points"', function(){
                    expect(makeRequestOptions.url).toEqual('/user/cham/points');
                });

                describe('the form parameter', function(){
                    var form;

                    beforeEach(function(){
                        form = makeRequestOptions.form;
                    });

                    it('passes the form a hash named "form"', function(){
                        expect(typeof form).toEqual('object');
                    });

                    it('passes the number of points in the form hash as "points"', function(){
                        expect(form.points).toEqual(123);
                    });
                });

                describe('the callback', function(){
                    it('passes a callback to makeRequest as the second argument', function(){
                        expect(typeof makeRequestStub.args[0][1]).toEqual('function');
                    });
                });
            });

            describe('when all three makeRequest calls have resolved', function(){
                describe('with no errors', function(){
                    beforeEach(function(){
                        makeRequestStub.args[0][1]();
                        makeRequestStub.args[1][1]();
                        makeRequestStub.args[2][1]();
                    });

                    it('executes the callback', function(){
                        expect(callback.calledOnce).toEqual(true);
                    });

                    it('passes no errors to the callback', function(){
                        expect(callback.args[0][0]).toBeFalsey();
                    });
                });

                describe('with any error', function(){
                    beforeEach(function(){
                        makeRequestStub.args[0][1]();
                        makeRequestStub.args[1][1](new Error('error!'));
                        makeRequestStub.args[2][1]();
                    });

                    it('executes the callback', function(){
                        expect(callback.calledOnce).toEqual(true);
                    });

                    it('passes the error to the callback', function(){
                        expect(callback.args[0][0] instanceof Error).toEqual(true);
                        expect(callback.args[0][0].message).toEqual('error!');
                    });
                });
            })
        });
    });

});
