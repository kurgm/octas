const dx = [0, 1, 1, 1, 0, -1, -1, -1];
const dy = [-1, -1, 0, 1, 1, 1, 0, -1];
const INF = 1000000;
let searchDepth = 4;
let startMs = null;

const detectTriangle = function(edge, nowX, nowY, nowDirection) {
	for (let i = 0; i < 8; i++) {
		if (i === nowDirection) {
			continue;
		}
		if (nowDirection !== (i + 1) % 8 && nowDirection !== (i + 2) % 8 && nowDirection !== (i - 1 + 8) % 8 && nowDirection !== (i - 2 + 8) % 8) {
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
			if (newX + dx[j] === nowX + dx[nowDirection] && newY + dy[j] === nowY + dy[nowDirection]) {
				if (edge[newX][newY][j] === true) {
					return true;
				}
			}
		}
	}
	return false;
};

const updateEdge = function(edge, nowX, nowY, nowDirection) {
	const ret = [];
	let newX = nowX + dx[nowDirection];
	let newY = nowY + dy[nowDirection];
	ret.push([nowX, nowY, nowDirection]);
	ret.push([newX, newY, (nowDirection + 4) % 8]);
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
				ret.push([preX, preY, i]);
				ret.push([newX, newY, (i + 4) % 8]);
				edge[preX][preY][i] = true;
				edge[newX][newY][(i + 4) % 8] = true;
				break;
			}
		}
		preX = newX;
		preY = newY;
	}
	return ret;
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
		if (newX === 5) {
			return [5, 0];
		} else if (nowDirection === 0) {
			return [-1, -1];
		} else if (nowX + dx[nowDirection] * 2 === 0) {
			return [1, 2];
		} else if (nowX + dx[nowDirection] * 2 === 10) {
			return [9, 2];
		}
		return [nowX + dx[nowDirection] * 2, nowY];
	}
	if (newY === 10) {
		if (newX === 5) {
			return [5, 10];
		} else if (nowDirection === 4) {
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
		if (toX !== -1 && toY !== -1) {
			return false;
		}
	}
	return true;
};

const movesToEdge = function(moveHistory) {
	const edge = new Array(11);
	for (let i = 0; i < 11; i++) {
		edge[i] = new Array(11);
		for (let j = 0; j < 11; j++) {
			edge[i][j] = new Array(8).fill(false);
		}
	}
	let x = 5;
	let y = 5;
	for (const direction of moveHistory) {
		edge[x][y][direction] = true;
		x += dx[direction];
		y += dy[direction];
		edge[x][y][(direction + 4) % 8] = true;
	}
	return {edge, x, y};
};

const distanceToGoal = function(edge, X, Y) {
	if (canNotMove(edge, X, Y) === true) {
		return INF;
	}
	return Y * 20 + Math.abs(X - 5) * (Y < 4 ? 1 : -1) + Math.floor(Math.random() * 4) - 2;
};

const depthSearch = function(depth, edge, nowX, nowY) {
	if (searchDepth === 4 && new Date().getTime() - startMs > 10000) {
		return {directions: [], score: -1};
	}
	let ret = INF;
	let retIndices = [];
	if (depth === searchDepth) {
		for (let i = 0; i < 8; i++) {
			const [toX, toY] = whereToMove(edge, nowX, nowY, i);
			if (toX === -1) {
				continue;
			}
			const repair = updateEdge(edge, nowX, nowY, i);
			const tmpVal = distanceToGoal(edge, toX, toY);
			if (ret > tmpVal) {
				ret = tmpVal;
				retIndices = [i];
			}
			for (let j = 0; j < repair.length; j++) {
				edge[repair[j][0]][repair[j][1]][repair[j][2]] = false;
			}
		}
		return {directions: retIndices, score: ret};
	}
	for (let i = 0; i < 8; i++) {
		const [toX, toY] = whereToMove(edge, nowX, nowY, i);
		if (toX === -1) {
			continue;
		}
		if (toY === 0) {
			if (depth % 2 === 0) {
				return {directions: [i], score: -INF};
			}
			continue;
		}
		if (toY === 10) {
			if (depth % 2 === 1) {
				return {directions: [i], score: -INF};
			}
			continue;
		}
		const repair = updateEdge(edge, nowX, nowY, i);
		if (canNotMove(edge, toX, toY) === false) {
			if (detectTriangle(edge, nowX, nowY, i) === true) {
				const {directions, score: tmpVal} = depthSearch(depth, edge, toX, toY);
				if (ret > tmpVal) {
					ret = tmpVal;
					retIndices = [i].concat(directions);
				}
			} else {
				const tmpVal = depthSearch(depth + 1, edge, toX, toY).score * -1;
				if (ret > tmpVal) {
					ret = tmpVal;
					retIndices = [i];
				}
			}
		}
		for (let j = 0; j < repair.length; j++) {
			edge[repair[j][0]][repair[j][1]][repair[j][2]] = false;
		}
	}
	return {directions: retIndices, score: ret};
};

const onlyOneWay = function(edge, nowX, nowY) {
	let counter = 0;
	for (let i = 0; i < 8; i++) {
		const [toX, toY] = whereToMove(edge, nowX, nowY, i);
		if (toX !== -1 && toY !== -1) {
			counter += 1;
		}
	}
	return counter === 1;
};

const aiLogic = function(moveHistory) {
	startMs = new Date().getTime();
	const {edge, x: nowX, y: nowY} = movesToEdge(moveHistory);

	if (onlyOneWay(edge, nowX, nowY) === true) {
		for (let i = 0; i < 8; i++) {
			const [toX, toY] = whereToMove(edge, nowX, nowY, i);
			if (toX !== -1 && toY !== -1) {
				return [i];
			}
		}
	}

	let ret = depthSearch(0, edge, nowX, nowY).directions;
	if (new Date().getTime() - startMs > 10000) {
		searchDepth = 2;
		ret = depthSearch(0, edge, nowX, nowY).directions;
		searchDepth = 4;
		// Next step may fit in 10 seconds...
		ret = ret.slice(0, 1);
	}

	if (ret.length === 0) {
		for (let i = 0; i < 8; i++) {
			const [toX, toY] = whereToMove(edge, nowX, nowY, i);
			if (toX !== -1 && toY !== -1) {
				return [i];
			}
		}
	}

	return ret;
};

module.exports = aiLogic;