var os = require("os");
var fs = require("fs");
var path = require("path");
var Gat = require("../gat").Gat;

var FILE = "walle_128.png";
var FILE_PATH = path.join(os.tmpDir(), FILE);

Gat.setConfig({
  port: 3737
});

var gat = new Gat("https", "dl.dropbox.com");
gat.get("/s/j4ev9qfa3wz34xl/" + FILE, null, function(err, stream) {
  if (err) {
    return console.error(err);
  }
  stream.pipe(fs.createWriteStream(FILE_PATH));
  stream.on("close", function() {
    console.info("File saved: " + FILE_PATH);
  });
});