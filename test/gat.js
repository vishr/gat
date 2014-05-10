var path = require("path");
var fs = require("fs-extra");
var Gat = require("../gat").Gat;
var cfg = require("../gat").config;

var TMP_DIR = path.join(__dirname, "tmp");
var FILE1 = "walle_128.png";
var FILE2 = "walle_256.png";
var FILE3 = "404.png";

var gat = new Gat("https", "dl.dropboxusercontent.com");

describe("Gat", function() {
  before(function(done) {
    // Make temporary directory
    fs.mkdirs(TMP_DIR, function() {
      // Empty cache
      fs.remove(cfg.cacheDir, function() {
        // Cache FILE2
        gat.get("/s/u09l2rafkasebv4/" + FILE2, null, function(err, stream) {
          if (err) {
            return done(err);
          }
          stream.on("end", done);
          // Create FILE3
          stream.pipe(fs.createWriteStream(path.join(stream.gat.dir, FILE3)));
        });
      });
    });
  });

  describe("#get()", function() {
    it("should get the resouce from remote host", function(done) {
      gat.get("/s/j4ev9qfa3wz34xl/" + FILE1, null, function(err, stream) {
        if (err) {
          return done(err);
        }
        if (stream.headers) {
          stream.on("close", done);
          stream.pipe(fs.createWriteStream(path.join(TMP_DIR, FILE1)));
        } else {
          done(new Error("failed getting the resource"));
        }
      });
    });

    it("should get the resouce from local cache", function(done) {
      gat.get("/s/u09l2rafkasebv4/" + FILE2, null, function(err, stream) {
        if (err) {
          return done(err);
        }
        if (!stream.headers) {
          stream.on("close", done);
          stream.pipe(fs.createWriteStream(path.join(TMP_DIR, FILE2)));
        } else {
          done(new Error("failed getting the resource"));
        }
      });
    });

    it("should delete the resouce from cache for 404 from remote host", function(done) {
      gat.get("/" + FILE3, null, function(err, stream) {
        if (err) {
          return done(err);
        }
        if (!stream) {
          done();
        } else {
          done(new Error("failed deleting the resource"));
        }
      });
    });
  });
});