from boggle import Boggle
from flask import Flask, request, render_template, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension
import pdb

app = Flask(__name__)
app.config['SECRET_KEY'] = "secretsecret"

boggle = Boggle()
debug = DebugToolbarExtension(app)


@app.route('/')
def home_page():
    """Renders the home page, where user can check current stats, change settings, and start game"""
    highscore = session.get("highscore", 0)
    gameCount = session.get("gameCount", 0)
    return render_template('home.html', highscore=highscore, gameCount=gameCount)


@app.route('/stats', methods = ['POST'])
def save_stats():
    """Saves game stats played thus far, returns said stats to be displayed"""
    score = request.args['score']
    highscore = session.get('highscore', 0)
    session['highscore'] = max(int(score), int(highscore))

    gameCount = session.get('gameCount', 0) + 1
    session['gameCount'] = gameCount

    return jsonify({'score': score, 'gamesPlayed': gameCount, 'highscore': session['highscore']}) 


@app.route('/board')
def game():
    """Makes new boggle board; renders current highscore and number of games played"""
    board = boggle.make_board()
    session['board'] = board
    session['highscore'] = session.get('highscore', 0)
    highscore = session['highscore']
    session['gameCount'] = session.get('gameCount', 0)
    gameCount = session['gameCount']

    return render_template('board.html', board=board, highscore=highscore, gameCount=gameCount)


@app.route('/check_word')
def check_word():
    """Checks if guessed word is in game dictionary, returns the result."""
    word = request.args['guess']
    board = session['board']
    res = boggle.check_valid_word(board, word)
    return jsonify({'result': res, 'length': len(word)})


