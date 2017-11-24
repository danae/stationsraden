//-----------------------------------------------------------------------------

// CTANVAS.JS created by DENGSN
// A simple JavaScript library to draw CTAs (Centraal Bediende Treinaanwijzers) 
// on the HTML5 canvas element

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

//-----------------------------------------------------------------------------

// Utility functions

// Remove an element from an array
Array.prototype.remove = function(element)
{
  var index = this.indexOf(element);
  if (index > -1)
    this.splice(index,1);
};

// Shuffles an array
Array.prototype.shuffle = function() 
{
  for (var i = this.length - 1; i > 0; i--) 
  {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }
};

//-----------------------------------------------------------------------------

// Question class
var Question = function(station)
{
  if (typeof station === 'undefined')
    station = Station.random();
  
  this.answers = [station];
  for (var n = 0; n < 3; n ++)
    this.answers.push(Station.random());
  this.answers.shuffle();
  
  this.solution = station;
  
  $(document).trigger('guesser-question-ready',this);
};

// Checks if the answer is correct
Question.prototype.check = function(code)
{
  return code === this.solution.code;
};

//-----------------------------------------------------------------------------

// Guesser class
var Guesser = function()
{
  this.question = new Question();
  this.state = 'answering';
  this.score = 0;
};

// Change the state
Guesser.prototype.changeState = function(newState)
{
  // Handle new states
  if (newState === 'answering')
  {
    var self = this;
    $('main').fadeOut(200,function()
    {
      // New question
      Display.clear();
      self.question = new Question();
      
      $('main')
        .fadeIn(200);
    });
  }
  else if (newState === 'right')
  {
    // Correct answer
    this.score ++;
    
    // Add next button
    var next = $(document.createElement('button'))
      .on('click',function() { guesser.changeState('answering'); })
      .text('Volgende');
    $('.info').append('<p>').append(next).append('</p>');
  }
  else if (newState === 'wrong')
  {
    // Add game over button
    var gameOver = $(document.createElement('button'))
      .on('click',Display.newGame)
      .text('Opnieuw proberen?');
    $('.info').append('<p>Game over! ').append(gameOver).append('</p>');
  }
  
  // Set the new state
  this.state = newState;
  Display.update();
};

//-----------------------------------------------------------------------------

// Display class
var Display = function(){};

// Creates a loading bar
Display.createLoading = function(progress, text)
{
  var loadingBarInner = $(document.createElement('div'))
    .addClass('loading-inner');
  var loadingBar = $(document.createElement('div'))
    .addClass('loading')
    .append(loadingBarInner);
 
  $('main')
    .append('<p class="loading-text lead">' + text + '</p>')
    .append(loadingBar);
  
  Display.updateLoading(progress,text);
};

// Updates the loading bar
Display.updateLoading = function(progress, text)
{
  $('.loading .loading-inner').width($('.loading').width() * progress);
  if (typeof text !== 'undefined')
    $('.loading-text').text(text);
};

// Create a new game
Display.newGame = function()
{
  // Create a new game
  $('main').fadeOut(200,function()
  {
    // Create divs
    $('main')
      .html('')
      .append('<p class="lead">Welk van deze stations...</p>')
      .append('<div class="answers"></div>')
      .append('<p class="lead">...representeren deze treinaanwijzers?</p>')
      .append('<div class="ctas"></div>')
      .append('<p class="lead">Je huidige score</p>')
      .append('<div class="score">0</div>')
      .append('<div class="info"></div>')
      .fadeIn(200);
      
    // Create guesser
    guesser = new Guesser();
  });
};

// Update the display
Display.update = function()
{
  $('.score').html(guesser.score);
};

// Clear the display
Display.clear = function()
{
  //$('.ctas').slick('unslick');
  $('.ctas').html('');
  $('.answers').html('');
  $('.info').html('');
};

// Event handler for a clicked answer
Display.answered = function(event)
{
  if (guesser.state !== 'answering')
    return;
  
  var answer = event.target.getAttribute('data-answer');
  if (guesser.question.check(answer))
  {
    $(event.target)
      .addClass('green');
    
    guesser.changeState('right');
  }
  else
  {
    $(event.target)
      .addClass('red');
    $('button.answer[data-answer="' + guesser.question.solution.code + '"]')
      .addClass('green');
    
    guesser.changeState('wrong');
  }
};

//-----------------------------------------------------------------------------

// Global variables
var guesser = undefined;
var loaded = 0;

// If the document is loaded
$(document).ready(function()
{
  // Create a loading bar
  Display.createLoading(0.0,'Stations aan het laden');
});

// If the stations are loaded
$(document).on('cta-stations-ready',function()
{
  // Map all stations to a new station and create ctas
  Stations = Stations.map(station => new Station(station));
});

// If a station is loaded
$(document).on('cta-ready',function(event, station)
{
  // Check if this station has trains
  if (station.trains.length === 0)
  {
    Stations.remove(station);
    return;
  }
  
  // Increase the counter
  loaded ++;
  Display.updateLoading((loaded / Stations.length) * 1.0,"Stations aan het laden (" + loaded + "/" + Stations.length + ")");
  
  // If all are loaded, trigger station ready event
  if (loaded >= Stations.length)
    $(document).trigger('guesser-ready');
});

// If the guesser is ready
$(document).on('guesser-ready',function()
{
  // Create a new game
  Display.newGame();
});

// If the question is loaded
$(document).on('guesser-question-ready',function(event, question)
{
  // Append CTAs
  for (var platform in question.solution.cta)
  {
    var cta = $(document.createElement('div'))
      .addClass('ctas-cell')
      .append(question.solution.cta[platform].createAndDraw(300,150));
    $('div.ctas').append(cta);
  }
  
  // Append answers
  for (var i = 0; i < question.answers.length; i ++)
  {
    var answer = $(document.createElement('button'))
      .addClass('answer')
      .attr({'data-answer': question.answers[i].code})
      .on('click',Display.answered)
      .append(question.answers[i].name);
    $('div.answers').append(answer);
  }
});

//-----------------------------------------------------------------------------