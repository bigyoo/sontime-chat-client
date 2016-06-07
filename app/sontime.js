'use strict';

// This is needed because sontime SSL certifacite is expired
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var sontime = {
    axios: require('axios'),
    baseUrl: "https://192.168.9.47:8443/sontime2-service/rest/"
};

/**
 * Converts REST resource URLs to full URLs by 
 * concatenating path to the baseUrl.
 */
sontime.getUrl = function (path) {
    return sontime.baseUrl + path;
};

/**
 * Wrapper around the axios function that
 * uses the getUrl above to map to REST
 * endpoints.
 */
sontime.executeRequest = function (requestArgs) {
    return sontime.axios(sontime.getUrl(requestArgs.url), {
        method: requestArgs.method,
        data: requestArgs.data,
        auth: requestArgs.auth
    }).then(function (response) {
        return response.data;
    }).catch(function (response) {
        console.error(response);
    });
};

/**
 * SontimeUser storing the token received during
 * login and allowing for further REST calls to be
 * made. Should be instantiated by the getUser
 * method below.
 */
sontime.SontimeUser = function (userName, token) {
    this.userName = userName;
    this.token = token;

    this.accessResource = function (method, url, data) {
        return sontime.executeRequest({
            method: method,
            url: url,
            data: data,
            auth: {
                username: token,
                password: ''
            }
        });
    };

    /**
     * Executes a GET request against the Sontime REST API.
     * 
     * E.g. for url: v2/projects/100 it will return
     * the project entity with id 100.
     * 
     * @param {String} url
     * @param {Object} data
     * @returns Promise that's going to resolve as the an Object
     */
    this.getResource = function (url, data) {
        return this.accessResource('get', url, data);
    };
};

/**
 * Create a new Sontime user instance by providing
 * its login credentials. 
 * 
 * Example usage:
 * 
 * require('./sontime').getUser('szirmayb', 'password').then(function(user){
 *      return user.getResource('v2/projects/100');
 * }).then(function (project) {
 *      console.log(project);
 * });
 * 
 * @param {String} userName LDAP username
 * @param {String} password LDAP password
 * @returns Promise that is going to resolve to be a SontimeUser
 */
sontime.getUser = function (userName, password) {
    return sontime.executeRequest({
        method: 'post',
        url: "login",
        auth: {
            username: userName,
            password: password
        },
        data: {
            rememberMe: true
        }
    }).then(function (token) {
        return new sontime.SontimeUser(userName, token);
    });
};


module.exports = sontime;

