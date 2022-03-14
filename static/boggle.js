//this is the file I am working on refactoring the app.js as object-oriented.

class Boggle {
	constructor(board, time = 60) {
		this.time = time; // length the game is played
		this.score = 0; //beginning score of game
		this.words = new Set(); //word bank of valid guessed words
		this.board = board;
		$('#guessBtn', this.board).on('click', this.checkWord.bind(this));
	}

	//send the guess to the server to check validity ('/check_word')
	//if guess is valid word AND new word AND on board: "Nice Word!" and score is updated
	//if valid word BUT already guessed: "You already guessed that word!"
	//if valid word but not on the board: "Try again! That word is not on the Boggle Board."
	//if not a valid word: "That's not even a word!"
	async checkWord(evt) {
		evt.preventDefault();
		const $guess = $('.guess', this.board);
		let response = await axios.get('/check_word', { params: { guess: $guess.val() } });

		if (response.data.result === 'ok' && this.words.has($guess.val())) {
			$('#message', this.board)
				.text(`You already guessed that word! Score: ${this.score}`)
				.css('visibility', 'visible');
		} else if (response.data.result === 'ok' && !this.words.has($guess.val())) {
			this.words.add($guess.val());
			this.score += response.data.length;
			$('#message', this.board).text(`Nice Word! Score: ${this.score}`).css('visibility', 'visible');
		} else if (response.data.result === 'not-on-board') {
			$('#message', this.board)
				.text(`Try again! That word is not on the Boggle Board. Score: ${this.score}`)
				.css('visibility', 'visible');
		} else {
			$('#message', this.board).text(`That's not even a word! Score: ${this.score}`).css('visibility', 'visible');
		}
		$guess.val('');
	}

	//starts a countdown from 60. When countdown reaches 0, disables the guess button and displays the final score.
	timer() {
		if (window.location.href.match('/board') != null) {
			let gameTimer = setInterval(() => {
				if (this.time > 0) {
					this.time -= 1;
					$('.timer', this.board).text(`Time Left: ${this.time}`);
				} else {
					$('#guessBtn', this.board).attr('disabled', 'disabled');
					$('#message', this.board).text(`Final Score: ${this.score}`).css('visibility', 'visible');
					this.sendStats();
					clearInterval(gameTimer);
				}
			}, 1000);
		}
	}

	//sends the game stats to the server '/stats' to update number of games played and high score
	async sendStats() {
		let req = await axios({
			url: '/stats',
			method: 'POST',
			params: { score: this.score }
		});
		$('.game-counter', this.board).text(`Number of Games: ${req.data.gamesPlayed}`);
		$('.high-score', this.board).text(`My High Score: ${req.data.highscore}`);
	}
}

//start a new Boggle game and set the timer
let myBoggle = new Boggle();
window.onload = myBoggle.timer();
