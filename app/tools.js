var util = require('util');

module.exports = {

    toConsole: function(msg, obj) {
        console.log(msg, util.inspect(obj, false, null));
    }

}
