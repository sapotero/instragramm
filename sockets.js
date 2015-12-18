var ws = require("nodejs-websocket"),
  eventum = require("eventum-machinius");

  var machineArray = [];

// https://github.com/sitegui/nodejs-websocket
// Scream server example: "hi" -> "HI!!!"
var server = ws.createServer(function (ws) {
    console.log("New wsection")

    var machine = eventum.init({
      initial: 'init',
      events: [
        { event: 'init',      from: 'init',  to: 'check' },
        { event: 'tryAuth',   from: 'check', to: 'auth'  },
     
        { event: 'auth',      from: 'auth',  to: 'ready' },
        { event: 'authError', from: ['auth', 'error'],  to: 'init' },

        { event: 'photo',      from: 'ready',     to: 'makePhoto' },
        { event: 'photo',      from: 'makePhoto', to: 'ready'     },
        { event: 'photoError', from: 'makePhoto', to: 'mainError' },

        { event: 'ping',      from: 'ready', to: 'ping'      },
        { event: 'pong',      from: 'ping',  to: 'ready'     },
        { event: 'pingError', from: 'ping',  to: 'mainError' },

        { event: 'mainError', from: 'mainError',  to: 'ready' },

        { event: 'exit', from: [ 'init','auth', 'check', 'ready'], to: 'terminal' },
      ],
      final: 'terminal',
      callbacks: {
        oninit        : function( event, from, to, ws, data ) {
          console.log( '[*] onInit', event, from, to, data );
        },
        ontryAuth     : function( event, from, to, ws, data ) { },
        onmainError   : function( event, from, to, ws, data ) { },
        onauthError   : function( event, from, to, ws, data ) { },
        onphotoError  : function( event, from, to, ws, data ) { },
        onpingError   : function( event, from, to, ws, data ) { },
        onping        : function( event, from, to, ws, data ) { },
        onpong        : function( event, from, to, ws, data ) { },
        onphoto       : function( event, from, to, ws, data ) { },
        onexit        : function( event, from, to, ws, data ) { },
        onauth        : function( event, from, to, ws, data ) { },
        onafterevent : function( event, from, to, ws, data ) { 
          // console.log( '[*] calback', event, from, to, data );
          console.log( '[*] state', this.current );
        }
      }
    });
    machineArray.push(machine);
    setTimeout( function(){ ws.sendText("PING") }, 3000 );
    
    ws.on("text", function ( data ) {
        console.log( "<- ", data );
        
        // check
        switch( data ){
          case 'init':
            break;
          case 'PONG':
            setTimeout( function(){ ws.sendText("PING") }, 3000 );
            break;
          default:
            // ping
            break;
        }
    })
    
    ws.on("close", function (code, reason) {
      console.log("Connection closed")
      machine.exit(ws, 'EXIT');

    })
}).listen(8082)