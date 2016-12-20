import io from 'socket.io-client';

const socket = io(config.io);

function subscribe(registrations) {
    registrations.forEach(function (registration) {
        socket.on(registration.route, registration.callback);
    });
}

function publish(route, data) {
    socket.emit(route, data);
}

function join(room) {
    socket.join(room);
}

module.exports.subscribe = subscribe;
module.exports.publish = publish;
module.exports.join = join;
