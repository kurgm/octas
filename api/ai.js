const dx = [0, 1, 1, 1, 0, -1, -1, -1];
const dy = [-1, -1, 0, 1, 1, 1, 0, -1];
const INF = 1000000;

const distanceToGoal = function(X, Y) {
	return Y * 10 + Math.abs(X - 5) * (Y < 4 ? 1 : -1);
};

const detectTriangle = function(edge, nowX, nowY, nowDirection) {
	for (let i = 0; i < 8; i++) {
		if (i === nowDirection) {
			continue;
		}
		if (nowDirection !== (i + 1) % 8 && nowDirection !== (i + 2) % 8 && nowDirection !== (i - 1) % 8 && nowDirection !== (i - 2) % 8) {
			continue;
		}
		if (edge[nowX][nowY][i] === false) {
			continue;
		}
		const newX = nowX + dx[i];
		const newY = nowY + dy[i];
		if (newX < 0 || newX >= 11 || newY < 0 || newY >= 11) {
			continue;
		}
		for (let j = 0; j < 8; j++) {
			if (newX + dx[j] === nowX && newY + dy[j] === nowY) {
				if (edge[newX][newY][j] === true) {
					return true;
				}
			}
		}
	}
	return false;
};

const updateEdge = function(edge, nowX, nowY, nowDirection) {
	let newX = nowX + dx[nowDirection];
	let newY = nowY + dy[nowDirection];
	edge[nowX][nowY][nowDirection] = true;
	edge[newX][newY][(nowDirection + 4) % 8] = true;

	let nowDX = dx[nowDirection];
	let nowDY = dy[nowDirection];
	let preX = newX;
	let preY = newY;

	while (preX === 0 || preX === 10 || preY === 0 || preY === 10) {
		if (preX === 0 || preX === 10) {
			nowDX *= -1;
		} else {
			nowDY *= -1;
		}
		newX = preX + nowDX;
		newY = preY + nowDY;
		for (let i = 0; i < 8; i++) {
			if (dx[i] === nowDX && dy[i] === nowDY) {
				edge[preX][preY][i] = true;
				edge[newX][newY][(i + 4) % 8] = true;
				break;
			}
		}
		preX = newX;
		preY = newY;
	}
	return edge;
};

const whereToMove = function(edge, nowX, nowY, nowDirection) {
	const newX = nowX + dx[nowDirection];
	const newY = nowY + dy[nowDirection];
	if (newX < 0 || newX >= 11 || newY < 0 || newY >= 11) {
		return [-1, -1];
	}
	if (edge[nowX][nowY][nowDirection] === true) {
		return [-1, -1];
	}
	if (newX > 0 && newX < 10 && newY > 0 && newY < 10) {
		return [newX, newY];
	}
	if ((newX === 0 && newY === 0) || (newX === 10 && newY === 10)) {
		return [-1, -1];
	}
	if ((newX === 10 && newY === 0) || (newX === 0 && newY === 10)) {
		return [-1, -1];
	}
	if (newX === 0) {
		if (nowDirection === 6) {
			return [-1, -1];
		} else if (nowY + dy[nowDirection] * 2 === 0) {
			return [2, 1];
		} else if (nowY + dy[nowDirection] * 2 === 10) {
			return [2, 9];
		}
		return [nowX, nowY + dy[nowDirection] * 2];
	}
	if (newX === 10) {
		if (nowDirection === 2) {
			return [-1, -1];
		} else if (nowY + dy[nowDirection] * 2 === 0) {
			return [8, 1];
		} else if (nowY + dy[nowDirection] * 2 === 10) {
			return [8, 9];
		}
		return [nowX, nowY + dy[nowDirection] * 2];
	}
	if (newY === 0) {
		if (nowDirection === 0) {
			if (newX === 4) {
				return [4, 0];
			}
			return [-1, -1];
		} else if (nowX + dx[nowDirection] * 2 === 0) {
			return [1, 2];
		} else if (nowX + dx[nowDirection] * 2 === 10) {
			return [9, 2];
		}
		return [nowX + dx[nowDirection] * 2, nowY];
	}
	if (newY === 10) {
		if (nowDirection === 4) {
			if (newX === 4) {
				return [4, 10];
			}
			return [-1, -1];
		} else if (nowX + dx[nowDirection] * 2 === 0) {
			return [1, 8];
		} else if (nowX + dx[nowDirection] * 2 === 10) {
			return [9, 8];
		}
		return [nowX + dx[nowDirection] * 2, nowY];
	}
	return [-1, -1];
};

const canNotMove = function(edge, nowX, nowY) {
	for (let i = 0; i < 8; i++) {
		const [toX, toY] = whereToMove(edge, nowX, nowY, i);
		if (toX === -1 && toY === -1) {
			return false;
		}
	}
	return true;
};

const aiLogic = function(vertexHistory) {
	const arrayLength = vertexHistory.length;
	for (let i = 0; i < arrayLength; i++) {
		vertexHistory[i] = [vertexHistory[i][0] + 1, vertexHistory[i][1] + 1];
	}
	// let edge = new Array(11);
	const edge = new Array(11);
	for (let i = 0; i < 11; i++) {
		edge[i] = new Array(11);
		for (let j = 0; j < 11; j++) {
			edge[i][j] = new Array(8).fill(false);
		}
	}
	for (let i = 1; i < arrayLength; i++) {
		const [preX, preY] = vertexHistory[i - 1];
		const [nowX, nowY] = vertexHistory[i];
		for (let j = 0; j < 8; j++) {
			if (preX + dx[j] === nowX && preY + dy[j] === nowY) {
				edge[preX][preY][j] = true;
				edge[nowX][nowY][(j + 4) % 8] = true;
			}
		}
	}
	const [nowX, nowY] = vertexHistory[arrayLength - 1];

	const moveQueue = [[], []];
	moveQueue[0].push([edge, nowX, nowY, 0, 0]);

	for (let depth = 0; depth < 10; depth++) {
		const me = depth % 2;
		const op = (depth % 2) ^ 1;
		moveQueue[op] = [];
		for (let i = 0; i < moveQueue[me].length; i++) {
			if (moveQueue[me][4] === INF || moveQueue[me][4] === -1 * INF) {
				moveQueue[op].push([moveQueue[me][0], moveQueue[me][1], moveQueue[me][2], moveQueue[me][3], moveQueue[me][4] * -1]);
				continue;
			}
			for (let j = 0; j < 8; j++) {
				const [toX, toY] = whereToMove(moveQueue[me][0], moveQueue[me][1], moveQueue[me][2], j);
				if (toX === -1) {
					continue;
				}
				if (toY === 0 || toY === 10) {
					moveQueue[op].push([edge, toX, toY, j, -1 * INF]);
				}
				const newEdge = updateEdge(moveQueue[me][0], moveQueue[me][1], moveQueue[me][2], j);
				if (detectTriangle(newEdge, moveQueue[me][1], moveQueue[me][2], j)) {
					if (canNotMove(newEdge, toX, toY) === true) {
						moveQueue[op].push([newEdge, toX, toY, j, INF]);
					} else {
						moveQueue[me].push([newEdge, toX, toY, moveQueue[me][3], distanceToGoal(toX, toY)]);
					}
				} else if (canNotMove(newEdge, toX, toY) === false) {
					if (depth === 0) {
						moveQueue[op].push([newEdge, toX, toY, j, distanceToGoal(toX, toY)]);
					} else {
						moveQueue[op].push([newEdge, toX, toY, moveQueue[me][3], distanceToGoal(toX, toY)]);
					}
				} else {
					moveQueue[op].push([newEdge, toX, toY, j, INF]);
				}
			}
		}
	}
	const finalValue = new Array(10).fill(INF);
	for (let i = 0; i < moveQueue[0].length; i++) {
		finalValue[moveQueue[0][i][3]] = Math.min(finalValue[moveQueue[0][i][3]], moveQueue[0][i][4]);
	}
	let bestDirection = -1;
	let bestValue = INF;
	for (let i = 0; i < 8; i++) {
		if (bestValue > finalValue[i]) {
			bestValue = finalValue[i];
			bestDirection = i;
		}
	}
	return bestDirection;
};

module.exports = aiLogic;
