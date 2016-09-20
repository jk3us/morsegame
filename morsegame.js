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
	this.wpm = 13;
	this.guessLimit = 5;
	this.morse = new MorseNode(this.ac, this.wpm);
	this.morse.connect(this.ac.destination);

	this.setupBoard();
	this.activateLetter("Q");
	this.activateLetter("Z");
	this.next_letter = "Q"; // always start with Q
	//this.showBoard();
	this.next_letter = $(".letter.active").first().data("letter");

	key("space", this.togglePause.bind(this));
}

MorseGame.prototype.getLetterIndex = function(letter) {
	for (i = 0; i < this.letters.length; i++) {
		if (this.letters[i].letter == letter) {
			return i;
		}
	}
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

MorseGame.prototype.togglePause = function(event) {
	console.log("togglePause");
	if (event)
		event.preventDefault();
	if (this.paused) {
		this.doLetter();
		this.listenForLetter();
	} else {
		clearTimeout(this.letter_timeout);
	}
	this.paused = !this.paused;
	$("#begin-modal").modal("hide");
	$("#options-modal").modal(this.paused?"show":"hide");
	return false;
}

MorseGame.prototype.letterPressed = function(letter) {
	var letter_index = this.getLetterIndex(this.next_letter);
	var streak = 0;
	if (letter == this.next_letter) {
		this.letters[letter_index].score -= 5; // Decrement score
		this.letters[letter_index].streak += 1; // Increment streak
		this.streak++;

		if (this.letters[letter_index].score <= 0) {
			this.letters[letter_index].active = false;
			this.letters[letter_index].score  = 0;
		}
	} else {
		this.letters[letter_index].score += 7; // Increment score
		if (this.letters[letter_index].score > 100) {
		}
		this.letters[letter_index].streak = 0; // Reset streak
		this.streak = 0;
	}

	if (this.streak > 0 && this.streak % 10 == 0) {
		this.activateLetter();
		//this.next_letter = $(".letter").not(".active").first().data("letter")
		//this.activateLetter(this.next_letter);
		this.letter_timeout = setTimeout(this.doLetter.bind(this), 500);
		return;
	}
	// update_board();
	this.showBoard();
	this.next_letter=null;
	this.letter_timeout = setTimeout(this.doNextLetter.bind(this), 500);
}

MorseGame.prototype.doNextLetter = function() {
	// Sets next_letter to be a random active letter, and calls doLetter()
	var active = this.getActiveLetters();
	if (active.length < 2) {
		this.activateLetter();
		active = this.getActiveLetters();
	}
	if (active.length == 0) {
		// You won!
		this.win();
		return;
	}
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
	this.morse.playString(this.ac.currentTime, this.next_letter);
	if (this.guessLimit > 0) {
		this.letter_timeout = setTimeout(this.letterPressed.bind(this,null), this.guessLimit * 1000);
	}
}

MorseGame.prototype.activateLetter = function(letter) {
	if (letter === undefined) {
		for (i = 0; i < this.letters.length; i++) {
			if (!this.letters[i].active && this.letters[i].score == 100) {
				letter = this.letters[i].letter;
				break;
			}
		}
	}
	if (letter === undefined) {
		// No more letters to activate
		return false;
	}

	var letter_index = this.getLetterIndex(letter);
	this.next_letter = letter;
	this.letters[letter_index].active = true;
	this.letters[letter_index].score = 100;
	console.log(this.letters[letter_index]);
	this.showBoard();
}

MorseGame.prototype.setupBoard = function() {
	this.svg = d3.select("#graph")
		.append("svg")
		.attr("width", d3.select("#graph").node().offsetWidth)
		.attr("height", 400);

	var margin = {top:40, right: 0, bottom: 30, left: 0};
	this.graph = {
		width: +this.svg.attr("width") - margin.left - margin.right,
		height: +this.svg.attr("height") - margin.top - margin.bottom
	};

	this.graph.x = d3.scaleBand()
		.rangeRound([0, this.graph.width])
		.padding(0.4)
		.domain(this.letters.map(function(i){return i.letter})) ;
	this.graph.y = d3.scaleLinear()
		.rangeRound([this.graph.height, 0])
		.domain([0,1]);

	this.graph.g = this.svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	this.graph.g.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + this.graph.height + ")")
		.call(d3.axisBottom(this.graph.x).tickSize(0));

	this.graph.g.append("g")
		.attr("class", "axis axis--y")
		.call(d3.axisLeft(this.graph.y).ticks(4, "%").tickSize(-this.graph.width).tickFormat(""));
}

MorseGame.prototype.showBoard = function() {

	var t = d3.transition()
	    .duration(1000)
	    .ease(d3.easePolyOut);
	bars = this.graph.g.selectAll("rect")
		.data(this.letters);

	bars.enter()
		.append("rect")
		.attr("x", function(d) { return this.graph.x(d.letter); }.bind(this))
		.attr("data-letter", function(d) { return d.letter } )
		.attr("width", this.graph.x.bandwidth())
		.attr("height", 0)
		.attr("y", this.graph.y(0));
	bars
		.attr("class", function(d) { return d.active? "active" : "inactive"} )
		.transition(t)
		.attr("y", function(d) { return this.graph.y(d.score / 100); }.bind(this))
		.attr("height", function(d) { return this.graph.height - this.graph.y(d.score / 100); }.bind(this));
}

MorseGame.prototype.win = function() {
	alert("Congratulations: you won");
}

MorseGame.prototype.setWPM = function(wpm) {
	this.wpm = wpm;
	this.morse.setRate(this.wpm);
}

$(function() {
	game = new MorseGame();

	$("#begin-modal").modal({keyboard: false,backdrop:"static"}).modal("show");
	$("#begin-modal").on("hidden.bs.modal", function() {
		console.log("closing modal");
		if (game.paused) {
			game.togglePause();
		}
	});

	$("#options-modal").on("shown.bs.modal", function() {
		console.log("opening modal");
		if (!game.paused) {
			game.togglePause();
		}
		$("input[name=input-wpm]").parent("label").removeClass("active");
		$("input[name=input-wpm][value="+game.wpm+"]").prop("checked", true).parent("label").addClass("active");
		$("input[name=input-wait]").parent("label").removeClass("active");
		$("input[name=input-wait][value="+game.guessLimit+"]").prop("checked", true).parent("label").addClass("active");
	});
	$("#options-modal").on("hide.bs.modal", function() {
		if (game.paused) {
			game.togglePause();
		}
	});
	$("#save-options-button").on("click", function(event) {
		game.setWPM($("input[name=input-wpm]:checked").val());
		game.guessLimit = $("input[name=input-wait]:checked").val();
	});
});
