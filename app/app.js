
// Example usage of the sontime node module

var sontime = require('./sontime');
sontime.getUser('szirmayb', 'password').then(function (sontimeUser) {
    return sontimeUser.getResource('v2/projects/100');
}).then(function (project) {
    console.log(project);
});
