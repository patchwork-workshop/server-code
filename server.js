/****
 * In terminal, run:
 *   $ node app.js     (to launch this node app)
 */
var express = require('express');
var colors = require('colors');
var http = require('http');
var fs = require('fs');
var com = require('serialport');

var message = new Buffer('1');

var XbeeReady = false;
var clientConnected = false;
var handshakeState = 0;
var port = 9090;
var portHandler;
var requests = [];
var latestIDInQueue = -1;
var latestPerformedRequestID;
var latestInsertedRequestID;
var IDWaitingForInsertion = -1;
var uniqueId = 0;
var MODES = {
    rotate: 0,
    Vline: 1,
    Hline: 2,
    inout: 3,
    snake: 4,
    random: 5,
    blink: 6
};
/*
 *CONFIGURING THE SERIAL CONNECTION TO XBEE
 */

var serialPort = new com.SerialPort("/dev/cu.usbserial-DA01MCXK", {
    baudrate: 9600,
    parser: com.parsers.byteLength(5),
    autoOpen: true
}, function(error) {
    console.log(error);
});

function openXbeePort() {
    console.log("a");
    serialPort.open(function(error) {
        console.log(error);
    });
}
serialPort.on('open', function() {
    console.log('XBEE CONNECTED!!');
    XbeeReady = true;
    // Start Handshaking 
    serialPort.write(new Buffer('INITIATE'), function() {
        //hand shake 
        console.log("HANDSHAKING PING SENT!");
        handshakeState = 1; // server sent the req, waiting for ack.
    });

});
serialPort.on('data', function(data) {
    var incomingBuffer = data.toString();
    console.log(incomingBuffer);
    if (handshakeState < 2) {
        if (incomingBuffer[0] == 'H') {
            if (handshakeState == 1) {
                console.log("HANDSHAKING =>");
                switch (incomingBuffer[1]) {
                    case 'R':
                        console.log("PING RECEIVED! PREPARING THE BOARD!");
                        break;
                    case 'A':
                        console.log("HANDSHAKECOMPELETE! BOARD READY! START COMMUNICATION!");
                        handshakeState = 2;
                        latestPerformedRequestID = -1;
                        latestInsertedRequestID = -1;
                        clientConnected = true;
                        //setInterval(serverMessageSender, 1000);
                        break;
                    default:
                        console.log("UNKNOWN HANDSHAKING MESSAGE!!");
                        break;
                }
            } else {
                console.log("SERVER IS NOT READY YET! NO PING SENT!NOT WAITING FOR ACK!");
            }
        } else {
            console.log("HANDSHAKING NOT COMPLETE!");
        }
    } else {
        switch (incomingBuffer[0]) {
            case 'I':
                var insertedID = parseInt(incomingBuffer.slice(1, 5));
                if (insertedID == IDWaitingForInsertion) {
                    console.log("ID " + IDWaitingForInsertion + " WAS INERTED!");
                    for (var i = requests.length - 1; i >= 0; i--) {
                        if (requests[i].ID == IDWaitingForInsertion) {
                            io.emit('insert', requests[i]);
                        }
                    }

                    IDWaitingForInsertion = -1;
                    latestInsertedRequestID++;

                }
                break;
            case 'U':
                var upcomingMode = parseInt(incomingBuffer.slice(1, 5));
                console.log("UPCOMING Mode IS: " + upcomingMode);
                io.emit('upcoming', upcomingMode);
                break;
            default:
                console.log('UNKNOWN MESSAGE FROM CLIENT!');
                break;
        }
    }

});
serialPort.on('close', function() {
    console.log('Port closed! Please restart the server!');
    XbeeReady = false;
});
/****
 * CONFIGURE the express application
 */
var app = express();
app.use(express.static(__dirname + '/www'));
/****
 * START THE HTTP SERVER
 */
var server = http.createServer(app).listen(port, function() {
    console.log('  HTTP Express Server Running!  '.white.inverse);
    var listeningString = ' Magic happening on port: ' + port + "  ";
    console.log(listeningString.cyan.inverse);
});

var io = require('socket.io')(server);

io.on('connection', function(websocket) {
    console.log("NEW WEB CLIENT CONNECTED".green);

    websocket.on('newMessageReceived', function(data) {
        console.log('NEW MESSAGE FROM SMS SERVER!! new mode ==> ' + data);
        if (XbeeReady == false) {
            console.log('XBEE IS NOT READY/CONNECTED!');
            io.emit('error', "Xbee is not connected! Please connect the Xbee to the computers port and refresh the page!");
        } else {
            console.log('XBEE CONNECTED!');
            io.emit('error', "Xbee connected!");
            serverMessageSender(data);
        }
    });
    websocket.on('disconnect', function(data) {
        console.log("websocket DISCONNECTED: ".red + data.toString());
    });
});

function serverMessageSender(data) {
    console.log(data);
    if (XbeeReady == true && clientConnected == true) {
        serialPort.write(new Buffer('H' + ++uniqueId + 'M' + MODES[data] + 'E'), function() {
            console.log("==>    " + 'H' + uniqueId + 'M' + MODES[data] + 'E');

        });
    } else if (!XbeeReady && !clientConnected) {
        console.log('NEITHER THE CLIENT AND THE XBEE ARE CONNECTED!');
    } else if (!XbeeReady) {
        console.log('XBEE IS NOT CONNECTED!');
    } else {
        console.log('CLIENT IS NOT CONNECTED!');
    }
}