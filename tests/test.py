from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle


class FlaskTests(TestCase):
    def setUp(self):
        """Before each test."""
        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_home(self):
        """Tests that '/' renders the home.html page
        Tests that the status code is 200
        Tests that the '/' route sets the highscore and gameCount in session"""
        with self.client:
            res = self.client.get('/')
            html = res.get_data(as_text=True)
            self.assertIn('<h1>Welcome to Boggle.</h1>', html)
            self.assertEqual(res.status_code, 200)
            self.assertIsNone(session.get('gameCount'))
            self.assertIsNone(session.get('highscore'))
    
    def test_check_word(self):
        """Checks that guess submitted, if invalid, returns 'not-word' or 'not-on-board'"""
        self.client.get('/board')
        res = self.client.get('/check_word?guess=ashjfdalakeie')
        self.assertEqual(res.json['result'], 'not-word')
        res2 = self.client.get('check_word?guess=abalienation')
        self.assertEqual(res2.json['result'], 'not-on-board')

    
    def test_board(self):
        """Checks that the /board route renders board.html"""
        res = self.client.get('/board')
        html = res.get_data(as_text=True)
        self.assertIn('<table class = "board">', html)
        self.assertEqual(res.status_code, 200)



