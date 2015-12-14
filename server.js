var busboy = require('connect-busboy');
app = require('express.io')();
var express = require('express');
app.http().io();



var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html', 'css'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now());
  }
}



app.use(express.static('public', options));


app.use(busboy({ immediate: true }));

require('./vasya_io')(app,app.io);
module.exports = app;

app.listen(8080)

app.set('view engine', 'jade');

app.listen(8080);

console.log('Starting.....');

