/**
 * email.js
 * Email sending modules (via nodemailer).
 *
 * Copyright (C) 2014 Karim Alibhai.
 **/

(function () {
    "use strict";

    var nodemailer = require('nodemailer');

    module.exports = function (Kinvey) {
        // transport must be created when email
        // sending is requested to ensure that
        // Kinvey has setup properly
        var transport = function () {
            var opts = Kinvey._mailTransport,
                mailer;

            if (opts && opts.hasOwnProperty('service') && opts.hasOwnProperty('auth')) {
                mailer = nodemailer.createTransport(Kinvey._mailTransport);
            } else if (opts === 'events') {
                mailer = {
                    sendMail: function (data) {
                        Kinvey._events.emit('email', data);
                    }
                };
            } else {
                mailer = {
                    sendMail: function (data) {
                        console.log('\n---------------- OUTGOING EMAIL ----------------');
                        console.log('To: %s', data.to);
                        console.log('From: %s%s', data.from, data.replyTo ? (' (' + data.replyTo + ')') : '');
                        console.log('Subject: %s', data.subject);
                        console.log('\n%s', data.text);
                        console.log('----------------    END EMAIL   ----------------\n');
                    }
                };
            }

            return mailer;
        };

        // return mail sender
        return {
            send: function (from, to, subject, text, reply, html) {
                return transport().sendMail({
                    from: from,
                    to: to,
                    replyTo: reply,
                    subject: subject,
                    text: text,
                    html: html
                });
            }
        };
    };
}());