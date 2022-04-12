// stuff
var num_cols = 4;
var num_rows = 7;
var enter_auto = false;
var word = words_easy[Math.floor(Math.random() * words_easy.length)].toUpperCase();

function create_matrix() {
	let matrix = document.createDocumentFragment();
	let cell = 0;

	for (let i = 0; i < num_rows; i++) {
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

function handle_input(event) {
	if (current_cell > num_cols * num_rows || game_state > 0) return;

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

	for (let i = 0; i < guess.length; i++) {
		if (guess.charAt(i) == word.charAt(i)) {
			flip_cell("correct", guess.charAt(i), i);
		} else if (word.indexOf(guess.charAt(i)) > -1) {
			flip_cell("partial", guess.charAt(i), i);
		} else {
			flip_cell("incorrect", guess.charAt(i), i);
		}
	}

	if (guess == word) {
		game_state = 1;
		document.getElementById("answer-victory").innerText = word;
		document.getElementById("victory").classList.remove("hidden");
		setTimeout(victory, 250 * (num_cols + 1));
	} else if (current_cell >= num_cols * num_rows) {
		game_state = 2;
		document.getElementById("answer-loss").innerText = word;
		document.getElementById("loss").classList.remove("hidden");
	}

	guess = "";
	current_row++;
}

function flip_cell(result, key, i) {
	setTimeout(function() {
		document.getElementById("cell-" + (current_cell - num_cols + i)).classList.add(result, "flip");
		document.getElementById("key-" + key).classList.add(result);
	}, 250 * i);
}

function register_events() {
	document.addEventListener('keydown', handle_input);

	for (let key of document.querySelectorAll("#keyboard>div>button")) {
		key.addEventListener("click", function() {
			handle_input({
				key: key.innerText
			})
		});
	}
}

function victory() {
	var canvas = document.getElementById("canvas");
	canvas.confetti = canvas.confetti || confetti.create(canvas, {
		resize: false
	});

	for (let i = 0; i <= num_rows - current_row; i++) {
		setTimeout(function timer() {
			canvas.confetti({
				particleCount: (i + 1) ** 2,
				angle: Math.random() * (110 - 70) + 70,
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
	register_events();
}

var game_state = 0;
var current_row = 0;
var current_cell = 0;
var guess = "";
var enter_required = false;
var del_required = false;

document.addEventListener("DOMContentLoaded", main);
