/*global URL,config*/

/* dependencies */
import $ from 'jquery';

import io from 'socket.io-client';
import blobToImage from './blob';
import fps from 'fps';
const ticker = fps({
  every: 10   // update every 10 frames
});
ticker.on('data', framerate => {
  $('.fps').text(Math.round(framerate));
});

// resize asap before loading other stuff
function resize(){
  if ($(window).width() <= 500) {
    $('#chat, #game').css('height', $(window).height() / 2);
    $('.input input').css('width', $(window).width() - 40);
    $('.messages').css('height', $(window).height() / 2 - 70);
  } else {
    $('#chat, #game').css('height', $(window).height());
    $('.input input').css('width', $('.input').width());
    $('.messages').css('height', $('#chat').height() - 70);
  }
  scrollMessages();
}
$(window).resize(resize);
resize();

// reset game img size for mobile now that we loaded
$('#game img').css('height', '100%');

const socket = io(config.io);
socket.on('connect', () => {
  $('body').addClass('ready');
  $('.messages').empty();
  $('.messages').removeClass('connecting');
  $('.messages').addClass('connected');
  $('.input').removeClass('connecting');
  $('.input').addClass('connected');
  $('.input form input').attr('placeholder', 'enter your name to play');
  $('.input form input').attr('disabled', false);
  message('Connected!');
  if (window.localStorage && localStorage.nick) {
    join(localStorage.nick);
  }
});

socket.on('disconnect', () => {
  message('Disconnected. Reconnecting.');
});

if ('ontouchstart' in window) {
  $('body').addClass('touch');
}

let joined = false;
const input = $('.input input');
let nick;
$('.input form').submit(ev => {
  ev.preventDefault();
  const data = input.val();
  if ('' === data) return;
  input.val('');
  if (joined) {
    message(data, nick);
    socket.emit('message', data);
  } else {
    join(data);
  }
});

function join(data){
  nick = data;
  // Try-catch necessary because Safari might have locked setItem causing
  // exception
  try {
    if (window.localStorage) localStorage.nick = data;
  } catch (e) {}
  socket.emit('join', data);
  $('body').addClass('joined');
  $('.input').addClass('joined');
  input
      .attr('placeholder', 'type in to chat')
      .blur();
  joined = true;
}

input.focus(() => {
  $('body').addClass('input_focus');
});

input.blur(() => {
  $('body').removeClass('input_focus');
});

socket.on('joined', () => {
  $('.messages').append(
      $('<p>').text('You have joined.').append($('<span class="key-info"> Keys are as follows: </span>'))
          .append(
              $('<table class="keys">').append(
                  $('<tr><td>left</td><td>←</td>'),
                  $('<tr><td>right</td><td>→</td>'),
                  $('<tr><td>up</td><td>↑</td>'),
                  $('<tr><td>down</td><td>↓</td>'),
                  $('<tr><td>A</td><td>a</td>'),
                  $('<tr><td>B</td><td>s</td>'),
                  $('<tr><td>select</td><td>o</td>'),
                  $('<tr><td>start</td><td>enter</td>')
              ))

          .append( '<br><span class="key-info">Chat text containing [ up | down | left | right | a | b | select | start]  is parsed as commands.</span><br>')
          .append('<br><span class="key-info">Make sure the chat input is not focused to perform moves with keys.</span><br> '
              + 'Input is throttled server side to prevent abuse. Catch \'em all!')
  );

  $('table.unjoined').removeClass('unjoined');
  scrollMessages();
});

const map = {
  37: 'left',
  39: 'right',
  65: 'a',
  83: 'b',
  66: 'b',
  38: 'up',
  40: 'down',
  79: 'select',
  13: 'start'
};

const reverseMap = {};
for (const i in map) reverseMap[map[i]] = i;

$(document).on('keydown', ev => {
  if (null == nick) return;
  const code = ev.keyCode;
  if ($('body').hasClass('input_focus')) return;
  if (map[code]) {
    ev.preventDefault();
    socket.emit('move', map[code]);
  }
});

// Listener to fire up keyboard events on mobile devices for control overlay
$('table.screen-keys td').mousedown(function() {
  const id = $(this).attr('id');
  const code = reverseMap[id];
  const e = $.Event('keydown');
  e.keyCode = code;
  $(document).trigger(e);

  $(this).addClass('pressed');
  const self = this;
  setTimeout(() => {
    $(self).removeClass('pressed');
  }, 1000);
});

socket.on('connections', total => {
  $('.count').text(total);
});

socket.on('join', (nick, loc) => {
  const p = $('<p>');
  p.append($('<span class="join-by">').text(nick));
  if (loc) {
    p.append(` (${loc})`);
  }
  p.append(' joined.');
  $('.messages').append(p);
  trimMessages();
  scrollMessages();
});

socket.on('move', (move, by) => {
  const p = $('<p class="move">').text(` pressed ${move}`);
  p.prepend($('<span class="move-by">').text(by));
  $('.messages').append(p);
  trimMessages();
  scrollMessages();
});

socket.on('message', (msg, by) => {
  message(msg, by);
});

socket.on('reload', () => {
  setTimeout(() => {
    location.reload();
  }, Math.floor(Math.random() * 10000) + 5000);
});

function message(msg, by){
  const p = $('<p>').text(msg);
  if (by) {
    p.prepend($('<span class="message-by">').text(`${by}: `));
  } else {
    p.addClass('server');
  }
  $('.messages').append(p);
  trimMessages();
  scrollMessages();
}

function trimMessages(){
  const messages = $('.messages');
  while (messages.children().length > 300) {
    $(messages.children()[0]).remove();
  }
}

function scrollMessages(){
  $('.messages')[0].scrollTop = 10000000;
}

const image = $('#game img')[0];


let lastImage;
socket.on('frame', data => {
  ticker.tick();
  if (lastImage && 'undefined' != typeof URL) {
    URL.revokeObjectURL(lastImage);
  }

  image.src = blobToImage(data);

  lastImage = image.src;
});

// Highlights controls when image or button pressed
function highlightControls() {
  $('table.screen-keys td:not(.empty-cell)').addClass('highlight');

  setTimeout(() => {
    $('table.screen-keys td').removeClass('highlight');
  }, 300);
}

$('img').mousedown(highlightControls);
$('table.screen-keys td').mousedown(highlightControls);
