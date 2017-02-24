import React, { Component } from 'react';

import Game from './Game';
import Chat from './Chat';
import bus from '../EventService';
import $ from 'jquery';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {data: {}};
        this.socket = props.socket;

    }

    componentDidMount() {
        this.socket.on('reload', this.onReload.bind(this));
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    onReload() {
        console.log('onReload');

        setTimeout(() => {
            location.reload();
        }, Math.floor(Math.random() * 10000) + 5000);
    }

    handleResize() {
        console.log('handleResize');

        const windowHeight = $(window).height();
        const windowWidth = $(window).width();
        if (windowWidth <= 500) {
            $('#chat, #game').css('height', windowHeight / 2);
            $('.input input').css('width', windowWidth - 40);
            $('.messages').css('height', windowHeight / 2 - 70);
        } else {
            $('#chat, #game').css('height', windowHeight);
            $('.input input').css('width', $('.input').width());
            $('.messages').css('height', $('#chat').height() - 70);
        }
        bus.emit('scrollMessages');
    };

    render() {

        return (
            <div id="app">
                <Game socket={ this.socket }/>
                <Chat socket={ this.socket }/>
            </div>
        );
    }
}