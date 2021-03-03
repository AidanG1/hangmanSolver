import Vue from 'vue'

const axios = require('axios');


window.onload = function () {
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })
  var app = new Vue({
    el: '#app',
    data: {
      message: 'Welcome to Hangman Solver',
      user_word_input: '',
      showing_word: false,
      guessed_letters: [],
      current_guess: '',
      full_potential_words: [],
      number_of_guesses_remaining: 6,
      complete: false,
      result: '',
      autofill_optimal_guess: false,
    },
    watch: {
      guessed_letters: function () {
        this.get_potential_words();
        this.check_completion();
      },
      autofill_optimal_guess: function () {
        if (this.autofill_optimal_guess) {
          this.current_guess = this.optimal_guess;
        } else {
          this.current_guess = '';
        }
      },
      number_of_guesses_remaining: function () {
        this.draw_state();
      }
    },
    created: function () {
      this.draw_state();
    },
    computed: {
      potential_words: function () {
        let word_possible = true
        let word
        let letter
        let potential = []
        for (word of this.full_potential_words) {
          word_possible = true
          for (letter of this.guessed_letters) {
            if ((word.includes(letter) && !this.word_for_url.includes(letter)) || word.includes(' ') || word.includes('-')) {
              word_possible = false
              {
                break
              }
            }
          }
          if (word_possible) {
            potential.push(word)
          }
        }
        return potential
      },
      user_word: function () {
        return this.user_word_input.toLowerCase()
      },
      word_to_show: function () {
        let character;
        let word_to_show = '';
        for (character of this.user_word) {
          if (!this.guessed_letters.includes(character)) {
            word_to_show += '_ ';
          } else {
            word_to_show += character;
          }
        }
        return word_to_show;
      },
      word_for_url: function () {
        let character;
        let word_for_url = '';
        for (character of this.user_word) {
          if (!this.guessed_letters.includes(character)) {
            word_for_url += '?';
          } else {
            word_for_url += character;
          }
        }
        return word_for_url;
      },
      optimal_guess: function () {
        const letters_in_order = ['e', 'a', 'r', 'i', 'o', 't', 'n', 's', 'l', 'c', 'u', 'd', 'p', 'm', 'h', 'g', 'b', 'f', 'y', 'w', 'k', 'v', 'x', 'z', 'j', 'q']
        if (this.guessed_letters.length < 1) {
          // https://www3.nd.edu/~busiforc/handouts/cryptography/letterfrequencies.html
          let letter;
          for (letter of letters_in_order) {
            if (!this.guessed_letters.includes(letter)) {
              return letter.trim()
            }
          }
        } else {
          let all_words_one_string = '';
          let word;
          let letter;
          let potential = this.potential_words
          let i = potential.length * 2
          for (word of potential) {
            for (let index = 0; index < i; index++) {
              all_words_one_string += word;
            } // add word multiple times if it is higher up because those words have a higher score from the api
            i -= 2
          }
          let alphabet = {
            'a': 0,
            'b': 0,
            'c': 0,
            'd': 0,
            'e': 0,
            'f': 0,
            'g': 0,
            'h': 0,
            'i': 0,
            'j': 0,
            'k': 0,
            'l': 0,
            'm': 0,
            'n': 0,
            'o': 0,
            'p': 0,
            'q': 0,
            'r': 0,
            's': 0,
            't': 0,
            'u': 0,
            'v': 0,
            'w': 0,
            'x': 0,
            'y': 0,
            'z': 0,
          };
          for (letter of all_words_one_string) {
            if (letters_in_order.includes(letter)) {
              alphabet[letter] += 1
            }
          }
          const sortable = Object.entries(alphabet).sort(([, a], [, b]) => a - b).reverse()
          for (letter of sortable) {
            if (!this.guessed_letters.includes(letter[0])) {
              return letter[0]
            }
          }
        }
      }
    },
    methods: {
      get_potential_words: function () {
        this.full_potential_words = []
        let ref = this
        // const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
        const PROXY_URL = '';
        const API_URL = 'https://api.datamuse.com/words?max=200&sp=' + this.word_for_url
        axios.get(PROXY_URL + API_URL)
          .then(function (response) {
            let word
            for (word of response.data) {
              ref.full_potential_words.push(word.word)
            }
            if (ref.autofill_optimal_guess) {
              ref.current_guess = ref.optimal_guess
            }
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
      },
      submit_guess: function () {
        if (this.current_guess.length === 1 && this.number_of_guesses_remaining > 0 && this.word_for_url.includes('?')) {
          this.guessed_letters.push(this.current_guess)
          if (!this.user_word.includes(this.current_guess)) {
            this.number_of_guesses_remaining -= 1
          }
          if (this.autofill_optimal_guess) {
            this.current_guess = this.optimal_guess
          } else {
            this.current_guess = ''
          }
        }
      },
      check_completion: function () {
        if ((!this.word_for_url.includes('?') && this.word_for_url.length >= 1) || this.number_of_guesses_remaining === 0) {
          this.complete = true
          if (this.number_of_guesses_remaining === 0) {
            this.result = 'Fail'
          } else {
            this.result = 'Success!'
          }
        }
      },
      get_random_word: function () {
        let ref = this
        const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
        const API_URL = 'https://random-word-api.herokuapp.com/word?number=1'
        axios.get(PROXY_URL + API_URL, {headers: {'Access-Control-Allow-Origin': '*'}})
          .then(function (response) {
            console.log(response.data[0])
            ref.user_word_input = response.data[0]
            ref.result = 'Successful generation'
            ref.complete = true
            setTimeout(function () {
              ref.complete = false
            }, 2500)
            ref.get_potential_words()
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
      },
      restart: function () {
        this.number_of_guesses_remaining = 6;
        this.user_word_input = '';
        this.guessed_letters = [];
        this.current_guess = '';
        this.full_potential_words = [];
        this.complete = false;
        if (this.autofill_optimal_guess) {
          this.current_guess = this.optimal_guess
        }
      },
      draw_state: function () {
        let canvas = document.getElementById("hangmanCanvas");
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.beginPath();
        ctx.moveTo(10, 240);
        ctx.lineTo(310, 240);
        ctx.lineTo(100, 60);
        ctx.lineTo(50, 80);
      },
    }
  })
}
