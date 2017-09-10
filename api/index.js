/* eslint-disable no-console */
const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io');

const Board = require('../lib/Board');
const ai = require('./ai');

const app = http.createServer((req, res) => {
	let filename = null;
	let contentType = null;
	switch (req.url) {
	case '/':
	case '/index.html':
		filename = '../index.html';
		contentType = 'text/html';
		break;
	case '/index.css':
		filename = '../index.css';
		contentType = 'text/css';
		break;
	case '/index.js':
		filename = '../index.js';
		contentType = 'text/javascript';
		break;
	default:
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.end();
		return;
	}
	// eslint-disable-next-line no-sync
	const stat = fs.statSync(filename);
	res.writeHead(200, {
		'Content-Length': stat.size,
		'Content-Type': contentType,
	});
	fs.createReadStream(filename).pipe(res);
});
const io = socketIO(app);

let index = -1;
const board = new Board();

const move = (direction, player) => {
	board.moveTo(direction);
	io.emit('move', {
		direction,
		player,
	});
	if (board.activePlayer === 1) {
		const point = board.getCurrentPoint();
		if (point !== null && point.movableDirections.size !== 0) {
			setTimeout(() => {
				const data = board.trace.reduce((prev, curr) => prev.concat(curr), []);
				console.log(JSON.stringify(data));
				const aiDirection = ai(data);
				if (aiDirection === -1) {
					throw new Error('no available move!?!!?');
				}
				console.log('AI moves in:', aiDirection);
				move(aiDirection, 1);
			}, 600);
		}
	}
};

board.on('win', (winner) => {
	console.log(`${winner} won`);
});

io.on('connection', (client) => {
	index++;
	if (index === 1) {
		index++; // kuso
	}
	if (index === 0) {
		const index2 = index;
		client.on('move', (data) => {
			move(data.direction, index2);
		});
	}
	client.emit('login', {player: index});
	console.log(index);
});

app.listen(process.env.PORT || 3000);
