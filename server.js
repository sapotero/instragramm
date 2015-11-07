
var busboy = require('connect-busboy');
app = require('express.io')();

app.http().io();
app.use(busboy({ immediate: true }));

require('./vasya_io')(app,app.io);
module.exports = app;

app.listen(3001,'127.0.0.1')
