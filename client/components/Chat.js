import React, { Component } from "react";
import bus from '../EventService';
import $ from 'jquery';

export default class Chat extends Component {

    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.socket = props.socket;
        this.joined;

        this.nick;
        if (window.localStorage && localStorage.nick) {
            this.nick = localStorage.nick;
            bus.emit('nick', this.nick);
        }

    }

    componentDidMount() {
        bus.on('scrollMessages', this.scrollMessages);
        bus.on('message', this.message.bind(this));
        bus.on('onConnect', this.onConnect.bind(this));

        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('connections', this.onConnections.bind(this));
        this.socket.on('joined', this.onJoined.bind(this));
        this.socket.on('join', this.onJoin.bind(this));
        this.socket.on('move', this.onMove.bind(this));
        this.socket.on('message', this.onMessage.bind(this));
        this.socket.on('disconnected', this.onDisconnected.bind(this));
        this.socket.on('disconnect', this.onDisconnect.bind(this));
    }


    componentWillUnmount() {

    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();

        const data = this.state.value;
        if ('' === data) return;

        if (this.joined) {
            //this.message(data, this.nick);
            this.socket.emit('message', data);
        } else {
            this.join(data);
        }
        $('.input form input').val('');
    }

    onFocus() {
        $('body').addClass('input_focus');
    }

    onBlur() {
        $('body').removeClass('input_focus');
    }

    trimMessages() {
        const messages = $('.messages');
        while (messages.children().length > 300) {
            $(messages.children()[0]).remove();
        }
    }

    scrollMessages() {
        $('.messages')[0].scrollTop = 10000000;
    }

    message(msg, by) {
        const p = $('<p>').text(msg);
        if (by) {
            p.prepend($('<span class="message-by">').text(`${by}: `));
        } else {
            p.addClass('server');
        }
        $('.messages').append(p);
        this.trimMessages();
        this.scrollMessages();
    }

    onDisconnected(nick, loc) {
        console.log('onDisconnected');
        const p = $('<p>');
        p.append($('<span class="join-by">').text(nick));
        if (loc) {
            p.append(` (${loc})`);
        }
        p.append(' disconnected.');
        $('.messages').append(p);
        this.trimMessages();
        this.scrollMessages();
    }

    onConnect() {
        $('body').addClass('ready');
        $('.messages').empty();
        $('.messages').removeClass('connecting');
        $('.messages').addClass('connected');
        $('.input').removeClass('connecting');
        $('.input').addClass('connected');
        $('.input form input').attr('placeholder', 'enter your name to play');
        $('.input form input').attr('disabled', false);
        this.message('Connected!');
        if (this.nick) {
            this.join(this.nick);
        }
    }

    onDisconnect() {
        this.message('Disconnected. Reconnecting.');
    }

    onJoined() {
        console.log('onJoined');
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

                .append('<br><span class="key-info">Numeric keys [1-4] changes game.</span><br>')
                .append('<br><span class="key-info">Chat text containing [ UP | DOWN | LEFT | RIGHT | A | B | SELECT | START]  is parsed as commands.</span><br>')
                .append('<br><span class="key-info">Make sure the chat input is not focused to perform moves with keys.</span><br> '
                    + 'Input is throttled server side to prevent abuse. Catch \'em all!')
        );

        $('table.unjoined').removeClass('unjoined');
        this.scrollMessages();
    }

    onMove(move, by) {
        const p = $('<p class="move">').text(` pressed ${move}`);
        p.prepend($('<span class="move-by">').text(by));
        $('.messages').append(p);
        this.trimMessages();
        this.scrollMessages();
    }

    onMessage(msg, by) {
        this.message(msg, by);
    }

    onJoin(nick, loc) {
        console.log('onJoin');
        const p = $('<p>');
        p.append($('<span class="join-by">').text(nick));
        if (loc) {
            p.append(` (${loc})`);
        }
        p.append(' joined.');
        $('.messages').append(p);
        this.trimMessages();
        this.scrollMessages();
    }

    join(data) {
        this.nick = data;
        bus.emit('nick', this.nick);
        // Try-catch necessary because Safari might have locked setItem causing
        // exception
        try {
            if (window.localStorage) localStorage.nick = data;
        } catch (e) {
        }
        this.socket.emit('join', data);
        $('body').addClass('joined');
        $('.input').addClass('joined');
        $('.input form input')
            .attr('placeholder', 'type in to chat')
            .blur();
        this.joined = true;
        console.log('joined');
    }

    onConnections(total) {
        $('.count').text(total);
    }

    render() {

        return (
            <div id="chat">
                <div className="connecting messages">
                </div>
                <div className="input connecting">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <input type="text" disabled value={this.state.value}
                               onChange={this.handleChange.bind(this)}
                               onFocus={ this.onFocus }
                               onBlur={ this.onBlur }
                               placeholder="connecting..."/>
                    </form>
                </div>
            </div>
        );
    }
}