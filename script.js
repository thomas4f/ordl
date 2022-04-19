// stuff
var num_cols = 4;
var num_rows = 7;
var enter_auto = false;
var word = words_easy[Math.floor(Math.random() * words_easy.length)].toUpperCase();

function create_matrix() {
	let matrix = document.createDocumentFragment();
	let cell = 0;

	for (let i = 1; i <= num_rows; i++) {
		let row = document.createElement("div");
		row.setAttribute("id", "row-" + i);
		for (let i = 0; i < num_cols; i++) {
			let col = document.createElement("span");
			col.setAttribute("id", "cell-" + cell);
			row.append(col);
			cell++;
		}
		matrix.append(row);
	}

	document.getElementById("matrix").replaceChildren(matrix);
}

function create_keyboard() {
	let key_rows = [
		["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "å"],
		["a", "s", "d", "f", "g", "h", "j", "k", "l", "ö", "ä"],
		["enter", "z", "x", "c", "v", "b", "n", "m", "del"]
	]

	for (let row = 0; row < key_rows.length; row++) {
		let el_row = document.createElement("div");
		for (let key = 0; key < key_rows[row].length; key++) {
			let el_key = document.createElement("button");
			el_key.innerText = key_rows[row][key];
			el_key.setAttribute("id", "key-" + key_rows[row][key].toUpperCase());
			el_row.append(el_key);
		}

		document.getElementById("keyboard").append(el_row);
	}
}

function create_stats() {
	let stats = document.createElement("div");

	for (let i = 1; i <= num_rows; i++) {
		let el = document.createElement("div");
		let el2 = document.createElement("div");
		el.innerText = i;
		el2.setAttribute("id", "graph-" + i);
		el2.style.width = game_stats.scores[i] / game_stats.total * 100 + "%";
		el2.innerText = game_stats.scores[i] || 0;
		el.append(el2);
		stats.append(el);
	}

	document.getElementById("stats-graph").append(stats);

}

function handle_input(event) {
	if (current_cell > num_cols * num_rows || game_state > 0 || !can_interact) return;

	if (guess.length > 0 && (event.key == "Backspace" || event.key == "DEL")) {
		guess = guess.slice(0, -1);
		current_cell--;
		enter_required = false;
		del_required = false;
		document.getElementById("cell-" + current_cell).innerText = "";
	}

	if (/^[a-zåäö]$/i.test(event.key) && !enter_required && !del_required) {
		document.getElementById("cell-" + current_cell).innerText = event.key;
		guess += event.key.toUpperCase();
		current_cell++;
	}

	if (guess.length == num_cols) {
		if (event.key.toUpperCase() == "ENTER" || enter_auto) {
			check_guess();
			enter_required = false;
		} else {
			enter_required = true;
		}
	}
}

function check_guess() {
	if (!words_all.includes(guess)) {
		document.getElementById("row-" + current_row).classList.add("invalid");
		setTimeout(function() {
			document.getElementById("row-" + current_row).classList.remove('invalid');
		}, 500);
		del_required = true;
		return;
	}

	can_interact = false;
	for (let i = 0; i < guess.length; i++) {
		if (guess.charAt(i) == word.charAt(i)) {
			flip_cell("correct", guess.charAt(i), i);
		} else if (word.indexOf(guess.charAt(i)) > -1) {
			flip_cell("partial", guess.charAt(i), i);
		} else {
			flip_cell("incorrect", guess.charAt(i), i);
		}
	}

	setTimeout(function() {
		if (guess == word) {
			game_state = 1;
			game_end();
		} else if (current_cell >= num_cols * num_rows) {
			game_state = 2;
			game_end();
		}

		guess = "";
		current_row++;
		can_interact = true;
	}, num_cols * 250);
}

function flip_cell(result, key, i) {
	setTimeout(function() {
		document.getElementById("cell-" + (current_cell - num_cols + i)).classList.add(result, "flip");
		document.getElementById("key-" + key).classList.add(result);
	}, 250 * i);
}

function register_events() {
	document.addEventListener('keydown', handle_input);
	document.getElementById("new_game").addEventListener("click", function() { location.reload() });
	
	document.addEventListener('touchmove', function (event) {
		if (event.scale !== 1) { event.preventDefault(); }
	}, false);

	for (let key of document.querySelectorAll("#keyboard>div>button")) {
		key.addEventListener("click", function() {
			handle_input({
				key: key.innerText
			})
		});
	}
}

function game_end() {
	document.getElementById("modal").style.display = "block";
	game_stats.total++;

	if (game_state == 1) {
		game_stats.scores[current_row] = game_stats.scores[current_row] + 1 || 1;
		game_stats.streak = game_stats.streak + 1 || 1;
		if (game_stats.streak > game_stats.longest_streak) game_stats.longest_streak = game_stats.streak;
		document.getElementById("graph-" + current_row).classList.add("correct");
		document.getElementById("stats-game_result").innerText = "Hurra!";
		draw_confetti();
	} else {
		game_stats.streak = 0;
		document.getElementById("stats-game_result").innerText = "Tyvärr ...";
	}

	setTimeout(function() {
		for (let i = 1; i <= num_rows; i++) {
			document.getElementById("graph-" + i).style.width = game_stats.scores[i] / game_stats.total * 100 + "%";
			document.getElementById("graph-" + i).innerText = game_stats.scores[i] || 0;
		}
	}, 250);


	document.getElementById("stat-rounds").innerText = game_stats.total;
	document.getElementById("stat-wins").innerText = Object.values(game_stats.scores).reduce((a, b) => a + b, 0);
	document.getElementById("stat-streak").innerText = game_stats.streak;
	document.getElementById("stat-longest_streak").innerText = game_stats.longest_streak;

	localStorage.setItem('game_stats', JSON.stringify(game_stats));
}

function draw_confetti() {
	var canvas = document.getElementById("canvas");
	canvas.confetti = canvas.confetti || confetti.create(canvas, {
		resize: false
	});

	for (let i = 0; i <= num_rows - current_row; i++) {
		setTimeout(function() {
			canvas.confetti({
				particleCount: (i + 2) ** 2,
				angle: Math.random() * (105 - 75) + 75,
				spread: 50,
				startVelocity: 25,
				gravity: 0.5,
				ticks: 250,
				spread: 90,
				origin: {
					y: 1
				}
			});
		}, i * 500);
	}
}
function main() {
	create_matrix();
	create_keyboard();
	create_stats();
	register_events();
}

var game_state = 0;
var current_row = 1;
var current_cell = 0;
var guess = "";
var enter_required = false;
var del_required = false;
var can_interact = true;
var game_stats = JSON.parse(localStorage.getItem('game_stats')) || {
	"scores": {},
	"total": 0,
	"streak": 0,
	"longest_streak": 0
};

document.addEventListener("DOMContentLoaded", main);
