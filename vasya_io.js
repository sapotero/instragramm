module.exports = function(app, io){
//vova photo 563cc0ab1eef54506038475f
  var path = require('path');
  var fs = require('fs');
  var moment = require('moment');
  
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

          app.io.route('ready', function(req) {
              console.log('ready')

              var filesCollection = db.collection('fs.files');
              filesCollection.find({}).sort({uploadDate: -1}).limit(1).toArray(function (err, result) {
                if (err) {
                  console.log(err);
                } else if (result.length) {
                  console.log('Found:', result);
                  // array.forEach(function(item) { /* etc etc */ })
                  result.forEach(function(image){
                    console.log(image['_id']);
                    req.io.emit('newphoto', {
                      photoid: image['_id'],
                      camid: 'xx'
                    });
                  })

                } else {
                  console.log('No document(s) found with defined "find" criteria!');
                }

                result.each

              });


              console.log('join to room camupdate');
              req.io.join('camupdate');
              req.io.room('camupdate').broadcast('announce', 
                {message: 'New client in the ' + 'camupdate' + ' room. '})
          })



          //Читаем фотку из базы по _id:
          //Для теста http://dev.hardev.ru:30030/photo/563bd016f245838248cf82eb
          app.get('/photo/:id', function  (req, res) {
            // body...
            console.log('/photo/'+req.params.id);
            res.set('Cache-Control', 'public, max-age=31557600');
            var readstream = gfs.createReadStream({
              _id: req.params.id
            });

            readstream.on('error', function (error) {console.log("Caught", error);res.writeHead(200, {'content-type': 'text/plain'});
                res.write('Error: not found\n\n');

});

            if ( readstream instanceof Error ) {
              // handle the error safely
              console.log('fack up', result)
            }
            readstream.pipe(res);
          })


          app.get('/', function(req, res) {
              console.log('/');
              res.sendfile(__dirname + '/index.html')
          })

          app.post('/upload', function(req, res) {
              var fstream;

              var camId    = req.headers['camid'];
              var token    = req.headers['token'];
              var datetime = req.headers['datetime'];
              console.log(req)
              console.log("camid: "  + camId);
              console.log("token: "  + token);
              console.log("date: "  + moment(datetime, "YYYY:MM:DD HH:mm:ss"));
              console.log(req.files);

             //  var a = req.pipe(req.busboy);
             req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                  console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
                  console.log("Uploading: " + filename); 
                  // fstream = fs.createWriteStream(__dirname + '/files/' + filename);
                  // console.log("createWriteStream " + filename); 

                  var writestream = gfs.createWriteStream({
                      filename: filename,
                      mode: "w",
                      chunkSize: 1024*4,
                      content_type: mimetype,
                      root: "fs",
                      metadata: {camid: camId, imagedate: moment(datetime, "YYYY:MM:DD HH:mm:ss").format()}
                  });

                  file.pipe(writestream);

                  writestream.on('close', function () {
                    res.redirect('back');
                  });





              });
                  app.io.room('camupdate').broadcast('announce', {message: 'New photo in the ' + 'camupdate' + ' room. '})
          });
      })
};