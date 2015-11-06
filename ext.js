module.exports = function(app, io){

  var path = require('path');
  var fs = require('fs');
  
  var url = 'mongodb://85.143.218.29:27017/images';

  var mongodb     = require('mongodb'),
      Grid        = require('gridfs-stream'),
      MongoClient = mongodb.MongoClient,
      db          = new mongodb.Db( 'images', new mongodb.Server("85.143.218.29", 27017) ),
      gfs;

      db.open(function (err) {
        if (err) return handleError(err);
        var gfs = Grid(db, mongodb);

          function onCollection(err, collection) {
              var cursor = collection.find({}, { tailable: true, awaitdata: true } ),
              cursorStream = cursor.stream(),
              itemsProcessed = 0

              cursorStream.on('data', function (data) {
                  console.log(data);
                  itemsProcessed++;
              });
          }

          function onConnected(err, db) {
              db.collection('images', onCollection);
          }

          MongoClient.connect(url, onConnected);

        // Setup the ready route, and emit talk event.
          app.io.route('connection', function(req) {
              req.io.emit('total', {})
          })

          // Send the client html.
          app.get('/', function(req, res) {
              console.log('/');
              res.sendfile(__dirname + '/index.html')
          })



          app.post('/upload', function(req, res) {
              var fstream;

              var camId    = req.headers['camid'];
              var token    = req.headers['token'];
              var datetime = req.headers['datetime'];

              console.log("CAM: "  + camId);
              console.log("CAM: "  + token);
              console.log("CAM: "  + datetime);

              console.log(req.files);

             //  var a = req.pipe(req.busboy);
             req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                  console.log("Uploading: " + filename); 
                  // fstream = fs.createWriteStream(__dirname + '/files/' + filename);

                  var writestream = gfs.createWriteStream({
                      filename: filename,
                      mode: "w",
                      chunkSize: 1024*4,
                      content_type: mimetype,
                      root: "fs",
                       metadata: {camId:camId}
                  });
                  console.log("file.pipe")
                  file.pipe(writestream);

                  writestream.on('close', function () {
                    res.redirect('back');
                  });

                  var readstream = gfs.createReadStream({
                    filename: filename
                  });

              });
          });
      })
};