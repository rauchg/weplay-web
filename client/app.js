/*global URL, config*/

/* dependencies */
// var $ = require('jquery'); Added manually
var io = require('socket.io-client');
var blobToImage = require('./blob');

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
$('#layout-trigger').click(function () {
    if ($('body').hasClass('danmu')) {
    $('body').removeClass('danmu');
    } else {
    $('body').addClass('danmu');
    }
});

    if ($('body').hasClass('danmu')) {
      var gameTop = $(window).height()*0.05;  // margin-top: 7vh;
      var gameLeft = $(window).width()*.275;     // width: 45%; text-align: center;
      var gameWidth = $(window).width()*.45;     // width: 45%; text-align: center;
      var gameHeight = gameWidth * 0.9;  // gameWidth:gameHeight = 10:9
    } else {
      var gameTop = $(window).height()*0;  // margin-top: 7vh;
      var gameLeft = $(window).width()*0;     // width: 45%; text-align: center;
      var gameWidth = $(window).width()*.50;     // width: 45%; text-align: center;
      var gameHeight = $(window).height() ;  // gameWidth:gameHeight = 10:9
    }

  $("#game").danmu({
      top: gameTop,
      left: gameLeft,
      height: gameHeight,  //弹幕区高度
      width: gameWidth,   //弹幕区宽度
      zindex :99999,   //弹幕区域z-index属性
      speed:7000,      //滚动弹幕的默认速度，这是数值值得是弹幕滚过每672像素所需要的时间（毫秒）
      sumTime:65535,   //弹幕流的总时间
      danmuLoop:false,   //是否循环播放弹幕
      defaultFontColor:"#000",   //弹幕的默认颜色
      fontSizeSmall:40,     //小弹幕的字号大小
      FontSizeBig:40,       //大弹幕的字号大小
      opacity:"0.8",            //默认弹幕透明度
      topBottonDanmuTime:6000,   // 顶部底部弹幕持续时间（毫秒）
      SubtitleProtection:false,     //是否字幕保护
      positionOptimize:false,         //是否位置优化，位置优化是指像AB站那样弹幕主要漂浮于区域上半部分

      maxCountInScreen: 40,   //屏幕上的最大的显示弹幕数目,弹幕数量过多时,优先加载最新的。
      maxCountPerSec: 10      //每分秒钟最多的弹幕数目,弹幕数量过多时,优先加载最新的。
  });
$(window).resize(resize);
resize();
// reset game img size for mobile now that we loaded
 // $('#game img').css('height', '100%');

var socket = io(config.io);
socket.on('connect', function(){
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

socket.on('disconnect', function(){
  message('弹幕服务器已失联。。。试试看刷新页面吧！');
});

if ('ontouchstart' in window) {
  $('body').addClass('touch');
}

var joined = false;
var input = $('.input input');
var nick;
$('.input form').submit(function(ev){
  ev.preventDefault();
  var data = input.val();
  if ('' === data) return;
  input.val('');
  if (joined) {
      var text = 'bbq';
        var text_obj='{ "text":"'+text+'","color":"'+'white'+'","size":"'+1+'","position":"'+0+'","isnew":""}';
          var new_obj=eval('('+text_obj+')');

    $("#game").danmu("addDanmu", new_obj);
    $("#game").danmu("addDanmu", JSON.parse(composeDanmu(data)));
    $("#game").danmu("addDanmu", { text:"这是滚动弹幕" ,color:"white",size:1,position:0,time:2});
  console.log(composeDanmu(data));
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
  .attr('placeholder', '吹比，吹比，我是吹X的小能手！')
  .blur();
  joined = true;
}

input.focus(function(){
  $('body').addClass('input_focus');
});

input.blur(function(){
  $('body').removeClass('input_focus');
});

socket.on('joined', function(){
  $('.messages').append(
    $('<p>').text('Key binding:')
    .append(
    $('<table class="keys">').append(
      $('<tr><td class="empty-cell" ></td><td>⇧</td><td class="empty-cell" ></td>    <td class="empty-cell"></td><td>Select</td></tr>'),
      $('<tr><td>⇦</td><td class="empty-cell"></td><td>⇨</td>    <td class="empty-cell"></td><td class="pty-cell">&nbsp;</td><td>A</td></tr>'),
      $('<tr><td class="empty-cell"></td><td>↓</td><td class="empty-cell"></td>     <td class="empty-cell"></td><td>Start</td><td class="empty-cell"></td><td class="round">B</td></tr>')
    ))
    .append(
        $('<span>').text('To:'))
    .append(
    $('<table class="keys">').append(
      $('<tr><td class="empty-cell" ></td><td>↑</td><td class="empty-cell" ></td>    <td class="empty-cell"></td><td>&lt;BackSpac&gt;</td></tr>'),
      $('<tr><td>←</td><td class="empty-cell"></td><td>→</td>    <td class="empty-cell"></td><td class="pty-cell">&nbsp;</td><td>&lt;A&gt;</td></tr>'),
      $('<tr><td class="empty-cell"></td><td>↓</td><td class="empty-cell"></td>     <td class="empty-cell"></td><td>&lt;Enter&gt;</td><td class="empty-cell"></td><td class="round">&lt;S&gt;</td></tr>')
    ))
    .append(
        $('<span>').text('/ or:'))
    .append(
    $('<table class="keys">').append(
      $('<tr><td class="empty-cell" ></td><td>↑</td><td class="empty-cell" ></td>    <td class="empty-cell"></td><td>&lt;Delete&gt;</td></tr>'),
      $('<tr><td>←</td><td class="empty-cell"></td><td>→</td>    <td class="empty-cell"></td><td class="pty-cell">&nbsp;</td><td>&lt;Z&gt;</td></tr>'),
      $('<tr><td class="empty-cell"></td><td>↓</td><td class="empty-cell"></td>     <td class="empty-cell"></td><td>&lt;Enter&gt;</td><td class="empty-cell"></td><td class="round">&lt;X&gt;</td></tr>')
    ))
    .append('<br><span class="key-info">Make sure the chat input is not focused to perform moves.</span><br> '
      + 'Input is throttled server side to prevent abuse. Catch \'em all!')
  );

  $('table.unjoined').removeClass('unjoined');
  scrollMessages();
});

var map = {
  37: 'left',
  39: 'right',
  65: 'a',
  90: 'a',
  83: 'b',
  88: 'b',
  32: 'b',
  38: 'up',
  40: 'down',
  8: 'select',
  46: 'select',
  13: 'start'
};

var reverseMap = {};
for (var i in map) reverseMap[map[i]] = i;

$(document).on('keydown', function(ev){
  if (null == nick) return;
  var code = ev.keyCode;
  if ($('body').hasClass('input_focus')) return;
  if (map[code]) {
    ev.preventDefault();
    socket.emit('move', map[code]);
  }
});

// Listener to fire up keyboard events on mobile devices for control overlay
$('table.screen-keys td').mousedown(function() {
  var id = $(this).attr('id');
  var code = reverseMap[id];
  var e = $.Event('keydown');
  e.keyCode = code;
  $(document).trigger(e);

  $(this).addClass('pressed');
  var self = this;
  setTimeout(function() {
    $(self).removeClass('pressed');
  }, 1000);
});

socket.on('connections', function(total){
  $('.count').text(total);
});

socket.on('join', function(nick, loc){
  var p = $('<p>');
  p.append($('<span class="join-by">').text(nick));
  if (loc) {
    p.append(' (' + loc + ')');
  }
  p.append(' joined.');
  $('.messages').append(p);
  trimMessages();
  scrollMessages();
});

    keymap2zh = {
        'select': '选择 按键',
        'start': '开始 按键',
        'left': '左 按键',
        'right': '右 按键',
        'up': '上 按键',
        'down': '下 按键',
        'a': 'A 按键',
        'b': 'B 按键'
    }
socket.on('move', function(move, by){
    clearTimeout(window.IntervalHideMoveMsg)
    $('#move-wrapper').css('visibility', 'visible');
    $('#move-wrapper').text(by + ' 使用了: ' + keymap2zh[move] + '!');
    window.IntervalHideMoveMsg = setTimeout(doHide, 1800);
});

function doHide() {
    setTimeout(hideMoveMsg, 500);
}
function hideMoveMsg () {
    $('#move-wrapper').css('visibility', 'hidden');
}

socket.on('message', function(msg, by){
  $("#game").danmu("addDanmu", JSON.parse(composeDanmu(msg)));
  message(msg, by);
});

socket.on('reload', function(){
  setTimeout(function(){
    location.reload();
  }, Math.floor(Math.random() * 1000) + 2000);
});

function message(msg, by){
  var p = $('<p id="last-message">').text(msg);
  if (by) {
    p.prepend($('<span class="message-by">').text(by + ': '));
  } else {
    p.addClass('server');
  }
  if ( $('#last-message').text() == by + ': ' + msg ) { // mark redundancy
      // $('#last-message').text(msg + 'again'); // broken, redunce redundancy for now
  } else {
      $('#last-message').removeAttr("id");
    $('.messages').append(p);
  }
  trimMessages();
  scrollMessages();
}

function trimMessages(){
  var messages = $('.messages');
  while (messages.children().length > 300) {
    $(messages.children()[0]).remove();
  }
}

function scrollMessages(){
  $('.messages')[0].scrollTop = 10000000;
}

var image = $('#game img')[0];
var lastImage;
window.framecount = 0;
socket.on('frame', function(data){
  if (lastImage && 'undefined' != typeof URL) {
    URL.revokeObjectURL(lastImage);
  }
  image.src = blobToImage(data);
  lastImage = image.src;
  ++window.framecount;
});

function countFPS () {
  $('#fps').text(window.framecount);
    window.framecount = 0;
}
var intervalFPSCount = setInterval(countFPS, 1000);

// Highlights controls when image or button pressed
function highlightControls() {
  $('table.screen-keys td:not(.empty-cell)').addClass('highlight');

  setTimeout(function() {
    $('table.screen-keys td').removeClass('highlight');
  }, 300);
}

$('img').mousedown(highlightControls);
$('table.screen-keys td').mousedown(highlightControls);

$('#game').danmu('danmuStart');
function composeDanmu (text) {
    var struText = {};
      struText ={ "text":text,"color":'white',"size":1,"position":0,"time":$('#game').data("nowTime"),"isnew":""};

    return JSON.stringify(struText);
}
function addmyname () {$("#game").danmu("addDanmu", [JSON.parse(composeDanmu('djh'))])}
// setInterval(addmyname, 86);
