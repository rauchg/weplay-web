import mustache from 'mustache-express';
import express from 'express';
const app = express();

import webpack from 'webpack';
import webpackConfig from './webpack.config.dev';
const port = process.env.WEPLAY_PORT || 3000;

import Redis from './redis';
const redis = Redis();

process.title = 'weplay-web';

app.listen(port);
console.log(`listening on *:${port}`);

app.engine('mustache', mustache());
app.set('views', `${__dirname}/views`);

if ('PRODUCTION' !== process.env.NODE_ENV) {

    const compiler = webpack(webpackConfig);

    app.use(require('webpack-dev-middleware')(compiler, {
        noInfo: true,
        publicPath: webpackConfig.output.publicPath
    }));
    app.use(require('webpack-hot-middleware')(compiler));
}
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    req.socket.on('error', err => {
        console.error(err.stack);
    });
    next();
});

const url = process.env.WEPLAY_IO_URL || 'http://localhost:3001';

app.get('/', (req, res, next) => {
    redis.get('weplay:frame', (err, image) => {
        if (err) return next(err);
        redis.get('weplay:connections-total', (err, count) => {
            if (err) return next(err);
            console.log(`io url config${url}`);
            res.render('index.mustache', {
                img: image.toString('base64'),
                io: url,
                connections: count
            });
        });
    });
});

app.get('/screenshot.png', (req, res, next) => {
    redis.get('weplay:frame', (err, image) => {
        if (err) return next(err);
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': image.length
        });
        res.end(image);
    });
});
