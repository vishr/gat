# Gat [![Build Status](https://travis-ci.org/vishr/gat.png?branch=master)](https://travis-ci.org/vishr/gat)

An HTTP caching server

## Features
* Supports http and https protocols
* Configurable limit for the cache - coming soon!
* Automatically deletes the resouce not found on the remote host
* Automatically reclaims the disk space based on LRU - coming soon!
* Saves bandwidth and time

## Installation
```sh
  $ npm i gat -g
```

## Usage

### Standalone
**Commands**
```sh
  $ gat -h

    Usage: gat [options] [command]

    Commands:

      config                 Show config
      start                  Start gat
      stop                   Stop gat
      restart                Restart gat
      empty                  Empty cache
      *                      Unknown command

    Options:

      -h, --help     output usage information
      -V, --version  output the version number

  $ gat start
    info: starting gat on port 1947

  $ gat stop
    warn: stopping gat

  $ gat restart
    warn: stopping gat
    info: starting gat on port 1947

  $ gat config
    info: {
      "port": 1947,
      "pidFile": "gat.pid",
      "logFile": "gat.log",
      "cacheDir": "/Users/vrana/.gat"
    }

  $ gat empty
    warn: emptying cache
```
**Request**
```sh
  Request URL: http://[hostname]:[port]/?protocol=https&hostname=dl.dropbox.com&resource=/u/11522638/node.png
  Request Method: GET
```
**Response**
```sh
  HTTP/1.1 200 OK
  accept-ranges: bytes
  cache-control: max-age=0
  connection: keep-alive
  content-length: 817701
  content-type: image/png
  date: Thu, 28 Feb 2013 23:30:02 GMT
  pragma: public
  server: Gat/0.0.3
  x-dropbox-request-id: 0e86ab125c680083
  x-robots-tag: noindex,nofollow
  x-server-response-time: 381
```

### As a node module
```js
  var os = require("os");
  var fs = require("fs");
  var path = require("path");
  var Gat = require("../gat").Gat;

  var FILE = "walle.png";
  var FILE_PATH = path.join(os.tmpDir(), FILE);

  Gat.setConfig({
    port: 4444
  });

  var gat = new Gat("https", "dl.dropbox.com");
  gat.get("/u/11522638/" + FILE, null, function(err, stream) {
    if (err) {
      return console.error(err);
    }
    stream.pipe(fs.createWriteStream(FILE_PATH));
    stream.on("close", function() {
      console.info("File saved: " + FILE_PATH);
    });
  });
```