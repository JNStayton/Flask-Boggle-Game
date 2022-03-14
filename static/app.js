//selects the text input for guesses
let $guess = $('input:text');
//stores the guessed words that have been checked and are valid words
const words = new Set();
//initiates the score at 0
let score = 0;
//sets the initial time limit for the game
let time = 60;

//start game timer
window.onload = timer();

//handle guess button click, run checkWord()
$('#guessBtn').on('click', function(evt) {
	evt.preventDefault();
	checkWord();
});

//send the guess to the server to check validity ('/check_word')
//if guess is valid word AND new word AND on board: "Nice Word!" and score is updated
//if valid word BUT already guessed: "You already guessed that word!"
//if valid word but not on the board: "Try again! That word is not on the Boggle Board."
//if not a valid word: "That's not even a word!"
async function checkWord() {
	let response = await axios.get('/check_word', { params: { guess: $guess.val() } });

	if (response.data.result === 'ok' && words.has($guess.val())) {
		$('#message').text('You already guessed that word!');
	} else if (response.data.result === 'ok' && !words.has($guess.val())) {
		$('#message').text('Nice Word!');
		words.add($guess.val());
		score += response.data.length;
		$('#score').text(score);
	} else if (response.data.result === 'not-on-board') {
		$('#message').text('Try again! That word is not on the Boggle Board.');
	} else {
		$('#message').text("That's not even a word!");
	}
	$guess.val('');
}

//starts a countdown from 60. When countdown reaches 0, disables the guess button and displays the final score.

function timer() {
	if (window.location.href.match('/board') != null) {
		gameTimer = setInterval(() => {
			if (time > 0) {
				time -= 1;
				$('.timer').text(`Time Left: ${time}`);
			} else {
				$('#guessBtn').attr('disabled', 'disabled');
				$('#message').text(`Final Score: ${score}`).css('visibility', 'visible');
				sendStats();
				clearInterval(gameTimer);
			}
		}, 1000);
	}
}

//sends the game stats to the server '/stats' to update number of games played and high score
async function sendStats() {
	let req = await axios({
		url: '/stats',
		method: 'POST',
		params: { score: score }
	});
	$('.game-counter').text(`Number of Games: ${req.data.gamesPlayed}`);
	$('.high-score').text(`My High Score: ${req.data.highscore}`);
}
