function MorseGame() {
	this.paused = true;
	this.letter_timeout;
	this.streak = 0;
	this.letters = [ // {{{
		{letter: 'Q', score: 100, streak: 0, active: false},
		{letter: 'Z', score: 100, streak: 0, active: false},
		{letter: 'G', score: 100, streak: 0, active: false},
		{letter: 'O', score: 100, streak: 0, active: false},
		{letter: 'J', score: 100, streak: 0, active: false},
		{letter: 'P', score: 100, streak: 0, active: false},
		{letter: 'W', score: 100, streak: 0, active: false},
		{letter: 'L', score: 100, streak: 0, active: false},
		{letter: 'R', score: 100, streak: 0, active: false},
		{letter: 'A', score: 100, streak: 0, active: false},
		{letter: 'M', score: 100, streak: 0, active: false},
		{letter: 'B', score: 100, streak: 0, active: false},
		{letter: 'X', score: 100, streak: 0, active: false},
		{letter: 'D', score: 100, streak: 0, active: false},
		{letter: 'Y', score: 100, streak: 0, active: false},
		{letter: 'C', score: 100, streak: 0, active: false},
		{letter: 'K', score: 100, streak: 0, active: false},
		{letter: 'N', score: 100, streak: 0, active: false},
		{letter: 'F', score: 100, streak: 0, active: false},
		{letter: 'U', score: 100, streak: 0, active: false},
		{letter: 'V', score: 100, streak: 0, active: false},
		{letter: 'H', score: 100, streak: 0, active: false},
		{letter: 'S', score: 100, streak: 0, active: false},
		{letter: 'I', score: 100, streak: 0, active: false},
		{letter: 'T', score: 100, streak: 0, active: false},
		{letter: 'E', score: 100, streak: 0, active: false}
	]; //}}}

	this.ac = new (window.AudioContext || window.webkitAudioContext)();
	this.morse = new MorseNode(this.ac, 12);
	this.morse.connect(this.ac.destination);

	this.setUpBoard();
	this.next_letter = $(".letter.active").first().data("letter");

	key("space", this.togglePause.bind(this));
}

MorseGame.prototype.getLetterIndex = function(letter) {
	for (i = 0; i < this.letters.length; i++) {
		if (this.letters[i].letter == letter) {
			return i;
		}
	}
	console.log("Didn't find " + letter);
	return -1;
}

MorseGame.prototype.getActiveLetters = function() {
	var active = [];
	for (i = 0; i < this.letters.length; i++) {
		if (this.letters[i].active) {
			active.push(this.letters[i]);
		}
	}
	return active;
}

MorseGame.prototype.togglePause = function(event, handler) {
	event.preventDefault();
	if (this.paused) {
		console.log('start');
		$("#message").text("Good Luck! Press Space to Pause.");
		this.doLetter();
		this.listenForLetter();
	} else {
		clearTimeout(this.letter_timeout);
		$("#message").text("PAUSED");
		console.log('pause');
	}
	this.paused = !this.paused;
	return false;
}

MorseGame.prototype.letterPressed = function(letter) {
	var letter_index = this.getLetterIndex(this.next_letter);
	var streak = 0;
	if (letter == this.next_letter) {
		this.letters[letter_index].score -= 5; // Decrement score
		this.letters[letter_index].streak += 1; // Increment streak
		this.streak++;
		console.log("Yes: " + this.letters[letter_index].score );

		if (this.letters[letter_index].score <= 0) {
			this.letters[letter_index].active = false;
			this.letters[letter_index].score  = 0;
		}
	} else {
		console.log("No");
		this.letters[letter_index].score += 7; // Increment score
		if (this.letters[letter_index].score > 100) {
			this.letters[letter_index].score = 100;
		}
		this.letters[letter_index].streak = 0; // Reset streak
		this.streak = 0;
	}
	$("#graph").highcharts().series[0].data[letter_index].update({y:this.letters[letter_index].score});
	if (this.streak > 0 && this.streak % 10 == 0) {
		this.activateLetter();
		//this.next_letter = $(".letter").not(".active").first().data("letter")
		//this.activateLetter(this.next_letter);
		this.letter_timeout = setTimeout(this.doLetter.bind(this), 500);
		return;
	}
	// update_board();
	//$('#graph').highcharts(this.chartOptions);
	$('#graph').highcharts().series[0].isDirty = true;
	$('#graph').highcharts().redraw();
	this.next_letter=null;
	this.letter_timeout = setTimeout(this.doNextLetter.bind(this), 500);
}

MorseGame.prototype.doNextLetter = function() {
	// Sets next_letter to be a random active letter, and calls doLetter()
	var active = this.getActiveLetters();
	var next_index = Math.floor(Math.random() * active.length);
	this.next_letter = active[next_index].letter;
	this.doLetter();
}

MorseGame.prototype.listenForLetter = function() {
	var mg = this;
	key("A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z", function(event, handler) {
		if (mg.next_letter == null) {
			return;
		}
		clearTimeout(mg.letter_timeout);
		mg.letterPressed(handler.shortcut);
	});
}

MorseGame.prototype.doLetter = function() {
	// Play the letter, and set a timeout
	if (this.next_letter == null) {
		this.doNextLetter();
		return;
	}
	console.log("Doing Letter ("+this.next_letter+")!");
	this.morse.playString(this.ac.currentTime, this.next_letter);
	this.letter_timeout = setTimeout(this.letterPressed.bind(this,null), 5000);
}

MorseGame.prototype.activateLetter = function(letter) {
	if (letter === undefined) {
		for (i = 0; i < this.letters.length; i++) {
			if (!this.letters[i].active && this.letters[i].score == 100) {
				letter = this.letters[i].letter;
				console.log(letter);
				break;
			}
		}
	}

	var letter_index = this.getLetterIndex(letter);
	this.next_letter = letter;
	this.letters[letter_index].active = true;
	$("#graph").highcharts().series[0].data[letter_index].graphic.attr("fill", "blue");
	$("#graph").highcharts().series[0].data[letter_index].update({color: "blue"});
	//var letter_row = $(".letter").filter("[data-letter='"+letter+"']");
	//letter_row.addClass("active");
	//letter_row.find("td").text(100);
	//letter_row.data("streak", 0);
}

MorseGame.prototype.setUpBoard = function() {

	data = [];
	categories = [];

	for (i = 0; i < this.letters.length; i++) {
		categories[i] = this.letters[i].letter;
		data[i] = this.letters[i].score;
	}

	this.chartOptions = {
		series:[{
				name: "Letter",
				data: data,
				color: "#cecece"
		}],
		title: {text: null},
		exporting: {enabled: false},
		credits: {enabled: false},
		tooltip: {enabled: false},
		chart: {
			type: 'column',
		},
		xAxis: {
			categories: categories,
			tickLength: 0,
			minorTickLength: 0
		},
		yAxis: {
			allowDecimals: false,
			max: 100,
			labels: { enabled: false },
			title: {text: null}
		},
		legend: { enabled: false }
	};
    this.chart = $('#graph').highcharts(this.chartOptions);
    this.activateLetter("Q");
    this.activateLetter("Z");
}

$(function() {
	game = new MorseGame();
});
