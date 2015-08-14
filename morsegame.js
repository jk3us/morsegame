//$(function() {
//	$("#graph").highcharts({
//data: {
//            table: 'datatable'
//        },
//        chart: {
//            type: 'column'
//        },
//        title: {
//            text: 'Data extracted from a HTML table in the page'
//        },
//        yAxis: {
//            allowDecimals: false,
//            min: 0,
//            max: 100,
//            title: {
//                text: 'Score'
//            }
//        }
//	});
//
//});



function MorseGame() {
	this.letters = ["Q","Z","G","O","J","P","W","L","R","A","M","B","X","D","Y","C","K","N","F","U","V","H","S","I","T","E"];
	this.letterScores = {};
	this.paused = true;
	this.letter_timeout;
	this.streak = 0;

	this.ac = new (window.AudioContext || window.webkitAudioContext)();
	this.morse = new MorseNode(this.ac);
	this.morse.connect(this.ac.destination);

	this.setUpBoard();
	this.next_letter = $(".letter.active").first().data("letter");

	key("space", this.togglePause.bind(this));
}
MorseGame.prototype.togglePause = function() {
	if (this.paused) {
		console.log('start');
		this.doLetter();
		this.listenForLetter();
	} else {
		clearTimeout(this.letter_timeout);
		console.log('pause');
	}
	this.paused = !this.paused;
}

MorseGame.prototype.letterPressed = function(letter) {
	var letter_row = $("#letter_"+this.next_letter);
	var streak = 0;
	if (letter == this.next_letter) {
		console.log("Yes");
		letter_row.find("td").text(parseInt(letter_row.find("td").text()) - 1);
		streak = parseInt(letter_row.data("streak")) + 1;
		this.streak++;
		letter_row.data("streak", streak);
	} else {
		console.log("No");
		letter_row.find("td").text(parseInt(letter_row.find("td").text()) + 1);
		letter_row.find("td").text(Math.min(parseInt(letter_row.find("td").text()), 100));
		this.streak = 0;
	}
	letter_row.data("streak", streak);
	if (this.streak > 0 && this.streak % 10 == 0) {
		this.activateLetter($(".letter").not(".active").first().data("letter"));
	}
	// update_board();
	this.next_letter=null;
	setTimeout(this.doNextLetter.bind(this), 500);
}

MorseGame.prototype.doNextLetter = function() {
	// Sets next_letter to be a random active letter, and calls doLetter()
	var active = $(".letter.active");
	var next_index = Math.floor(Math.random() * active.length);
	this.next_letter = $(active[next_index]).data("letter");
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
	console.log("Doing Letter ("+this.next_letter+")!");
	this.morse.playString(this.ac.currentTime, this.next_letter);
	this.letter_timeout = setTimeout(this.letterPressed.bind(this,null), 5000);
}

MorseGame.prototype.activateLetter = function(letter) {
	var letter_row = $("#letter_"+letter);
	letter_row.addClass("active");
	letter_row.find("td").text(100);
	letter_row.data("streak", 0);
}

MorseGame.prototype.setUpBoard = function() {
	for (var i = 0; i < this.letters.length; i++) {
		$("#letter-board").append('<tr id="letter_'+this.letters[i]+'" class="letter" data-letter="'+this.letters[i]+'"><th>'+this.letters[i]+'</th><td></td></tr>');
	}
	this.activateLetter("Q");
	this.activateLetter("Z");
}

$(function() {
	game = new MorseGame();
});
