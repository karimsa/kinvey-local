/*jslint unparam:true*/
var onRequest = function (request, response, modules) {
    "use strict";

    response.body = request.body.text;
    response.complete(200);
};