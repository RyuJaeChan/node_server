

var route_loader = {};

var config = require('../config/config')

route_loader.init = function (app){
    return initeRoutes(app)
}

function initeRoutes(app){
    var infoLen = config.route_info.length

    for(var i = 0 ; i < infoLen; i++){
        var curr = config.route_info[i]

        var currModule = require(curr.file);

        if(curr.type == 'get'){
            app.get(curr.path, currModule[curr.method])
        }
        if(curr.type == 'post'){
            app.post(curr.path, currModule[curr.method])
        }

    }
}

module.exports = route_loader;