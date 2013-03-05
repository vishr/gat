// "use strict";
var http = require("http");
var https = require("https");
var path = require("path");
var fs = require("fs-extra");
var winston = require("winston");
var _ = require("lodash");
var pkg = require("./package.json");

// Configuration
var cfgFile = path.join(__dirname, "config.json");
var cfg = exports.config = fs.existsSync(cfgFile) ? fs.readJsonSync(cfgFile) : {};
cfg.port = cfg.port || 1947;
cfg.pidFile = cfg.pidFile || "gat.pid";
cfg.logFile = cfg.logFile || "gat.log";
cfg.cacheDir = cfg.cacheDir || path.join(process.env.HOME || process.env.USERPROFILE, ".gat");
fs.writeJsonSync(cfgFile, cfg);

// Logging
var logger = new winston.Logger({
  transports: [
  new winston.transports.File({
    filename: cfg.logFile
  })]
});

var Gat = exports.Gat = function Gat(protocol, hostname, port) {
  // Validation
  if (!protocol) {
    throw new Error("invalid protocol");
  }
  if (!hostname) {
    throw new Error("invalid hostname");
  }

  this.hostname = hostname;
  if (protocol === "http") {
    this.port = port || 80;
    this.httpGet = http.get;
  } else if (protocol === "https") {
    this.port = port || 443;
    this.httpGet = https.get;
  } else {
    throw new Error("invalid protocol");
  }
};

Gat.setConfig = function(config) {
  logger.info("setting config");
  try {
    fs.writeJsonSync(cfgFile, _.assign(cfg, config));
  } catch (e) {
    logger.error("error saving config");
  }
};

Gat.prototype._mkdirs = function(dir, cb) {
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

Gat.prototype._interceptHeaders = function(headers, gat, cb) {
  headers["host"] = this.hostname + ":" + this.port;
  headers["user-agent"] = "Gat/" + pkg.version;
  fs.readJson(gat.head, function(err, data) {
    if (!err) {
      headers["if-modified-since"] = data["last-modified"];
      headers["if-none-match"] = data["etag"];
      gat.headers = data;
    }
    cb();
  });
};

Gat.prototype.get = function(resource, headers, cb) {
  // Validation
  if (!resource) {
    return cb(new Error("invalid resource"));
  }
  headers = headers || {};

  var target;
  var self = this;
  var dir = path.join(cfg.cacheDir, self.hostname, path.dirname(resource));
  var gat = {
    dir: dir,
    file: path.join(dir, path.basename(resource)),
    head: path.join(dir, path.basename(resource) + ".head")
  };
  var opts = {
    hostname: self.hostname,
    port: self.port,
    path: resource,
    headers: headers
  };

  self._mkdirs(dir, function(err) {
    if (err) {
      logger.error(err);
      return cb(err);
    }
    self._interceptHeaders(headers, gat, function() {
      self.httpGet(opts, function(res) {
        if (res.statusCode === 200) {
          logger.info("serving from remote host " + self.hostname);
          target = res;
          var stream = fs.createWriteStream(gat.file);
          stream.on("close", function() {
            // Save headers
            fs.writeJson(gat.head, res.headers, function(err) {
              if (err) {
                logger.error(err);
              }
              target.emit("close");
            });
          });
          target.pipe(stream);
          target.gat = gat;
          cb(null, target);
        } else if (res.statusCode === 304) {
          logger.info("serving from local cache " + dir);
          gat.headers.date = res.headers.date;
          target = fs.createReadStream(gat.file);
          target.gat = gat;
          cb(null, target);
        } else if (res.statusCode === 404) {
          // Delete the resource
          fs.remove(gat.file, function(err) {
            if (err) {
              return cb(err);
            }
            cb(null, null);
          });
        } else {
          // ???
        }
      });
    });
  });
};