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

var ac = new (window.AudioContext || window.webkitAudioContext)();
morse = new MorseNode(ac);
morse.connect(ac.destination);

var letters = ["C", "Q", "Z"];
var letterScores = {};
var paused = true;
var next_letter = "C";
var letter_timeout;
var i = 0;

function do_next_letter() {
	// Sets next_letter to be a random active letter, and calls do_letter()
	var active = $(".letter.active");
	var next_index = Math.floor(Math.random() * active.length);
	next_letter = $(active[next_index]).data("letter");
	do_letter();
}

function listen_for_letter() {
	key("A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z", function(event, handler) {
		if (next_letter == null) {
			return;
		}
		clearTimeout(letter_timeout);
		var letter_row = $("#letter_"+next_letter);
		if (handler.shortcut == next_letter) {
			console.log("Yes");
			letter_row.find("td").text(parseInt(letter_row.find("td").text()) - 1);
			letter_row.data("streak", parseInt(letter_row.data("streak")) + 1);
		} else {
			console.log("No");
			letter_row.find("td").text(parseInt(letter_row.find("td").text()) + 1);
			letter_row.find("td").text(Math.min(parseInt(letter_row.find("td").text()), 100));
			letter_row.data("streak", 0);
		}
		// update_board();
		next_letter=null;
		setTimeout(function(){do_next_letter();}, 500);
	});
}

function do_letter() {
	// Play the letter, and set a timeout
	console.log("Doing Letter ("+next_letter+") ("+i+")!");
	morse.playString(ac.currentTime, next_letter);
	letter_timeout = setTimeout(function() {
		console.log("No!");
		do_next_letter();
	},5000);

}

key("space", function() {
	if (paused) {
		console.log('start');
		do_letter();
		listen_for_letter();
	} else {
		clearTimeout(letter_timeout);
		console.log('pause');
	}
	paused = !paused;
});


