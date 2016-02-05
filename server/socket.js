var hat = require('hat');
var WebSocketServer = require('websocket').server;
var _ = require('underscore');

var baseUrl = process.env.BASE_URL || "http://localhost:3000";

var websocket;
var subscriptions = {};
var connections = {};
var socketOriginAllowed = function(origin) {
  return origin === baseUrl;
};

module.exports = {
  updateVote: function(pollId, value, count) {
    if (!websocket || !subscriptions[pollId]) return;
    for (var i = 0; i < subscriptions[pollId].length; i++) {
      var id = subscriptions[pollId][i];
      connections[id].sendUTF(JSON.stringify({
        type: 'update',
        id: pollId,
        value,
        count
      }));
    }
  },

  addRecord: function(record, type) {
    if (!websocket) return;
    _.values(connections).forEach(function(connection) {
      connection.sendUTF(JSON.stringify({
        type: 'add',
        entity: type,
        record
      }));
    });
  },

  removeRecord: function(id, type) {
    if (!websocket) return;
    _.values(connections).forEach(function(connection) {
      connection.sendUTF(JSON.stringify({
        type: 'remove',
        entity: type,
        id
      }));
    });
  },

  createSocket: function(app) {
    if (!!websocket) return;

    websocket = new WebSocketServer({
      httpServer: app,
      fragmentOutgoingMessages: false,
      autoAcceptConnections: false
    });

    websocket.on('request', function(request) {
      if (!socketOriginAllowed(request.origin)) return request.reject();
      var connection = request.accept('voting', request.origin);
      var id = hat();
      connections[id] = connection;
      connection.on('close', function() {
        delete connections[id]
        for (var subscription in subscriptions) {
          var index = subscriptions[subscription].indexOf(id);
          if (index > -1) subscriptions[subscription].splice(index, 1);
        }
      });

      connection.on('message', function(message) {
        if (message.type === 'utf8') {
          try {
            var command = JSON.parse(message.utf8Data);

            if (command.type === 'subscribe') {
              subscriptions[command.id] = subscriptions[command.id] || [];
              if (subscriptions[command.id].indexOf(id) === -1) subscriptions[command.id].push(id);
            }
          }
          catch(e) {
            console.log("Unable to parse JSON: " + message.utf8Data);
          }
        }
      });
    });
  }
}
