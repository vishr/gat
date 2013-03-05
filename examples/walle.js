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