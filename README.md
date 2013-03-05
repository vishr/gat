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
  wget -O node.png "http://localhost:1947/?protocol=https&hostname=dl.dropbox.com\
  &resource=/u/11522638/node.png"
```
**Response**
```sh
  HTTP/1.1 200 OK
  server: Gat/0.0.5
  date: Tue, 05 Mar 2013 20:49:56 GMT
  content-type: image/png
  content-length: 817701
  connection: keep-alive
  x-robots-tag: noindex,nofollow
  accept-ranges: bytes
  x-server-response-time: 577
  x-dropbox-request-id: 9714a7f21dd6be8b
  pragma: public
  cache-control: max-age=0
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
    port: 3737
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