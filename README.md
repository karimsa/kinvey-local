# kinvey-local [![Build Status](http://img.shields.io/travis/karimsa/kinvey-local.svg?style=flat)](https://travis-ci.org/karimsa/kinvey-local) [![View on NPM](http://img.shields.io/npm/dm/kinvey-local.svg?style=flat)](http://npmjs.org/package/kinvey-local) [![code climate](http://img.shields.io/codeclimate/github/karimsa/kinvey-local.svg?style=flat)](https://codeclimate.com/github/karimsa/kinvey-local) [![code coverage](http://img.shields.io/codeclimate/coverage/github/karimsa/kinvey-local.svg?style=flat)](https://codeclimate.com/github/karimsa/kinvey-local)

Tool to mock the [Kinvey](http://kinvey.com/) environment for testing.

[![NPM](https://nodei.co/npm/kinvey-local.png)](https://nodei.co/npm/kinvey-local/)

## Installation

Install the latest version of this package with npm:

```
$ npm install kinvey-local
```

## Usage

This package can simply replace your regular Kinvey import. For example:

```javascript
// with regular kinvey object
var Kinvey = require('kinvey');

Kinvey.User.login('username', 'password', {
    success: function () {
        console.log('Success.');
    }
});
```

```javascript
// inside your tests
var Kinvey = require('kinvey-local');

test.expect(1);
Kinvey.User.login('username', 'password', {
    success: function () {
        test.ok(true);
    }
});
```

## Example Usage

An example of a business-logic repository is available in the [example](https://github.com/karimsa/kinvey-local/blob/master/example) directory.

## Options

### How to Set Options

Options for kinvey-local should be saved inside a JSON file in your repo and loaded through the `.setOptions()` member of the `kinvey-local` object:

```javascript
var Kinvey = require('kinvey-local');

// you can use a file path to load the document
Kinvey.setOptions(path.resolve('./kinvey-local.json'));

// you can also send a pre-parsed document as an argument:
Kinvey.setOptions({
    /* .. TODO: add values .. */
});
```

### List of Options

- `endpoints-base`: an absolute path to the directory with all the endpoints source code. (i.e. `options["endpoints-base"] = path.resolve('./endpoints')`)
- `email`: a JSON document consisting of the [nodemailer configuration](http://www.nodemailer.com/) to use for the email module. Most basic example (with gmail):
```json
{
    "email": {
        "service": "Gmail",
        "auth": {
            "user": "my-email@gmail.com",
            "pass": "my-password"
        }
    }
}
```
**Note:** you can set this property to the string `events` to turn the event reporting into an event-based thing, where the event emitter is: `Kinvey._events`
- `collections`: a JSON document to add pre-made data stores to the phony local environment. The property names are the names of the data stores and the value must an array of documents. Sample:
```json
{
    "collections": {
        "my-data-store": [
            {
                "_id": "xxx",
                "name": "Document #1"
            }
        ]
    }
}
```
- `users`: an array of user configurations. Sample:
```json
{
    "users": [
        {
            // the _id property is required
            // and must be a valid string containing
            // only letters and numbers
            "_id": "identifier",
            "username": "userone",
            "password": "******",
            "email": "user.one@example.com"
        }
    ]
}
```

## What isn't yet supported?

This project is still in its early stages, so the local environment does not support **everything**. I've tried to extend the support as much for it to work exactly as intended, but have no gotten around to *implementing hooks and the tempObjectStore* just yet. This is on the TODO list and will be supported soon.

## Licensing

For license information, see [LICENSE.md](LICENSE.md).

## Support

I will try to keep this project as up-to-date as possible with the Kinvey spec, and bring the hooks support in soon.
For all issues/todo-wishes, please use the official [GitHub issues](http://github.com/karimsa/kinvey-local/issues) section.
