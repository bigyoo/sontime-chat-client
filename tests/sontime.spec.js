var q = require('q');

/**
 * Create a mocked version of axios. A map from URL endpoints to response strings
 * can be specified and it will generate Q promises that are going to resolve
 * to those responses.
 */
var createMockAxios = function (urlToResponseMap) {
    this.mockCalls = [];
    this.instance = function (absoluteUrl, data) {
        // Convert absolute URL to relative ones, 
        // for instance this will convert http://something/a/b/c to a/b/c
        var url = absoluteUrl.replace(/^(?:\/\/|[^\/]+)*\//, "");

        if (urlToResponseMap[url] === undefined) {
            var errorMessage =
                    "Received " +
                    url +
                    " but was prepared only for " +
                    Object.keys(urlToResponseMap).join();

            throw new Error(errorMessage);
        }

        var deferred = q.defer();
        deferred.resolve({
            data: urlToResponseMap[url]
        });

        mockCalls[mockCalls.length] = {
            absoluteUrl: absoluteUrl,
            data: data
        };

        // Note that calling the .then(function(){..}) will
        // still won't be automatically resolved only when that
        // thread yields execution. So you need to write
        // any Jasmine tasks to use this.
        return deferred.promise;
    };
    return this;
};

describe('sontime', function () {
    it('should login with basic auth', function (done) {

        var mockToken = 'abc123';
        var sontime = require('../app/sontime');
        
        var mockAxios = createMockAxios({
            'sontime2-service/rest/login': mockToken
        });
        sontime.axios = mockAxios.instance;

        sontime.getUser('name', 'password').then(function (userEntity) {
            expect(userEntity).toBeDefined();
            expect(userEntity.userName).toBe('name');
            expect(userEntity.token).toBe(mockToken);
            expect(mockAxios.mockCalls.length).toBe(1);
            expect(mockAxios.mockCalls[0].data.data).toEqual({rememberMe: true});
            done();
        });
    });

    it('should allow parameterized get requests', function (done) {
        var mockToken = "abc123";
        var mockResponse = {
            "id": 100,
            "name": "K11",
            "company": {
                "id": 23,
            }
        };
        var mockAxios = createMockAxios({
            'sontime2-service/rest/login': mockToken,
            'sontime2-service/rest/basicService/getProject': mockResponse
        });
        var sontime = require('../app/sontime');
        sontime.axios = mockAxios.instance;
        
        sontime.getUser("username", "password").then(function (sontimeUser) {
            return sontimeUser.getResource('basicService/getProject');
        }).then(function (project) {
            expect(project).toBeDefined();
            expect(project.id).toBe(mockResponse.id);
            expect(mockAxios.mockCalls.length).toBe(2);
            expect(mockAxios.mockCalls[1].data.auth).toEqual({
                'username': mockToken,
                'password': ''
            });
            done();
        });
    });
});
