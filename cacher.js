// "use strict";
var http = require("http");
var https = require("https");
var p = require("path");
var fs = require("fs-extra");
var winston = require("winston");
var cfg = require("./config.json");
var pkg = require("./package.json");

cfg.root = p.join(process.env.HOME || process.env.USERPROFILE, ".cacher");

// Logging
var logger = new winston.Logger({
  transports: [
  new winston.transports.File({
    filename: cfg.logFile
  })]
});

function Cacher(protocol, hostname, port) {
  // Validation
  if (!protocol || !hostname) {
    throw new Error("Invalid request");
  }

  this.hostname = hostname;
  if (protocol === "http") {
    this.port = port || 80;
    this.httpGet = http.get;
  } else if (protocol === "https") {
    this.port = port || 443;
    this.httpGet = https.get;
  } else {
    throw new Error("Invalid protocol");
  }
}

Cacher.prototype._mkdirs = function(dir, cb) {
  fs.exists(dir, function(exists) {
    if (exists) {
      return cb();
    }
    fs.mkdirs(dir, function(err) {
      if (err) {
        return cb(err);
      }
      cb();
    });
  });
};


Cacher.prototype._interceptHeaders = function(headers, cacher, cb) {
  headers["host"] = this.hostname + ":" + this.port;
  headers["user-agent"] = "Cacher/" + pkg.version;
  fs.readJson(cacher.head, function(err, data) {
    if (!err) {
      headers["if-modified-since"] = data["last-modified"];
      headers["if-none-match"] = data["etag"];
      cacher.headers = data;
    }
    cb();
  });
};

Cacher.prototype.get = function(path, headers, cb) {
  headers = headers || {};
  var target;
  var self = this;
  var dir = p.join(cfg.root, self.hostname, p.dirname(path));
  var cacher = {
    dir: dir,
    file: p.join(dir, p.basename(path)),
    head: p.join(dir, p.basename(path) + ".head")
  };
  var opts = {
    hostname: self.hostname,
    port: self.port,
    path: path,
    headers: headers
  };

  self._mkdirs(dir, function(err) {
    if (err) {
      logger.error(err);
      return cb(err);
    }
    self._interceptHeaders(headers, cacher, function() {
      self.httpGet(opts, function(res) {
        if (res.statusCode === 200) {
          logger.info("Serving from remote host " + self.hostname);
          target = res;
          var stream = fs.createWriteStream(cacher.file);
          stream.on("close", function() {
            // Save headers
            fs.writeJson(cacher.head, res.headers, function(err) {
              if (err) {
                logger.error(err);
                // TODO: emit error?
                // return cb(err);
              }
              target.emit("close");
            });
          });
          target.pipe(stream);
          target.cacher = cacher;
          cb(null, target);
        } else if (res.statusCode === 304) {
          logger.info("Serving from local cache " + dir);
          cacher.headers.date = res.headers.date;
          target = fs.createReadStream(cacher.file);
          target.cacher = cacher;
          cb(null, target);
        } else {
          // ?
        }
      });
    });
  });
};

exports.Cacher = Cacher;
exports.cfg = cfg;