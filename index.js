var busboy = require('connect-busboy');
app = require('express.io')();  
app.http().io();
app.use(busboy({ immediate: true }));

require('./ext')(app,app.io);

module.exports = app;

app.listen(30030,'85.143.218.29')