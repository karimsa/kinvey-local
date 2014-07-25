/*jslint unparam:true*/
var onRequest = function (request, response, modules) {
    "use strict";

    var errors = modules.validation.doValidation({
        text: {
            required: true,
            pattern: ['.*']
        },
        number: {
            pattern: ['[0-9]*']
        }
    }, request.body);

    modules.logger.info('incoming payload: ' + JSON.stringify(request.body));

    if (errors.length > 0) {
        modules.logger.error('validation: ' + JSON.stringify(errors));
        response.error('You must specify the text to be echoed.');
    } else {
        modules.email.send('from@example.com', 'receiver@example.com', request.body.text, 'This is a sample email message.', 'reply-to@example.com', '<h1>This is a sample email message.</h1>');
        modules.push.broadcastMessage('hello world');
        modules.push.broadcastPayload({
            isFor: 'iOSAps'
        }, {
            isFor: 'iOSExtras'
        }, {
            isFor: 'androidPayload'
        });

        response.body = modules.utils.renderTemplate(modules.utils.base64.decode(modules.utils.base64.encode('{{body}}')), {
            body: request.body.text
        });
        response.complete(200);
    }
};