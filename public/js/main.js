/* Functions for general use */

/* Returns the value associated with 'whichParam' on the URL */
function getURLParameters(whichParam)
{
  var pageURL = window.location.search.substring(1);
  var pageURLVariables = pageURL.split('&');
  for(var i = 0; i < pageURLVariables.length; i++){
    var parameterName = pageURLVariables[i].split('=');
    if(parameterName[0] == whichParam){
      return parameterName[1];
    }
  }
}

var username = getURLParameters('username');
if('undefined' == typeof username || !username){
  username = 'Anonymous_'+Math.random();
}

var chat_room = getURLParameters('game_id');
if('undefined' == typeof chat_room || !chat_room){
  chat_room = 'lobby';
}

/* SOLO PLAY */
var gameType = getURLParameters('gameType');


function soloPlay(){
  window.location.href = 'solo-game.html?username='+username+'&gameType=solo';
}

/* Connect to the socket server */
var socket = io.connect();

/* What to do when the server sends me a log message */
socket.on('log',function(array){
  console.log.apply(console,array);
});

/* What to do when the server responds that someone joined a room */
socket.on('join_room_response',function(payload){
  if(payload.result == 'fail'){
    alert(payload.message);
    return;
  }

/* If we are being notified that we joined the room, then ignore it */
  if(payload.socket_id == socket.id){
    return;
  }

/* If someone joined, then add a new row to the lobby table */
var dom_elements = $('.socket_'+payload.socket_id);

/* If we don't already have an entry for this person */
if(dom_elements.length == 0){
  var nodeA = $('<div></div>');
  nodeA.addClass('socket_'+payload.socket_id);

  var nodeB = $('<div></div>');
  nodeB.addClass('socket_'+payload.socket_id);

  var nodeC = $('<div></div>');
  nodeC.addClass('socket_'+payload.socket_id);

  nodeA.addClass('w-100');

  nodeB.addClass('col-9 text-right');
  nodeB.append('<h4>'+payload.username+'</h4>');

  nodeC.addClass('col3 text-left');
  var buttonC = makeInviteButton(payload.socket_id);
  nodeC.append(buttonC);

  nodeA.hide();
  nodeB.hide();
  nodeC.hide();
  $('#players').append(nodeA,nodeB,nodeC);
  nodeA.slideDown(1000);
  nodeB.slideDown(1000);
  nodeC.slideDown(1000);
}

/* If we have seen the person who just joined (something weird happened) */
else {
  uninvite(payload.socket_id);
  var buttonC = makeInviteButton(payload.socket_id);
  $('.socket_'+payload.socket_id+' button').replaceWith(buttonC);
  dom_elements.slideDown(1000);
}

/* Manage the message that a new player has joined ... added italics*/
var newHTML = '<p><i>'+payload.username+' just entered the room</i></p>';
var newNode = $(newHTML);
newNode.hide();
$('#messages').prepend(newNode);
newNode.slideDown(1000);
});

/* What to do when the server says that someone has left a room */
socket.on('player_disconnected',function(payload){
  if(payload.result == 'fail'){
    alert(payload.message);
    return;
  }

/* If we are being notified that we left the room, then ignore it */
  if(payload.socket_id == socket.id){
    return;
  }

/* If someone left the room, then animate out all their content */
var dom_elements = $('.socket_'+payload.socket_id);

/* If something exists */
if(dom_elements.length != 0){
  dom_elements.slideUp(1000);
}

/* Manage the message that a player has left ... added italics */
var newHTML = '<p><i>'+payload.username+' has left the room</i></p>';
var newNode = $(newHTML);
newNode.hide();
$('#messages').prepend(newNode);
newNode.slideDown(1000);
});

/* Send an invite message to the server */
function invite(who){
  var payload = {};
  payload.requested_user = who;

  console.log('*** Client log message: \'invite\' payload: '+JSON.stringify(payload));
  socket.emit('invite',payload);
}

/* Handle a response after sending an invite message to the server */
socket.on('invite_response',function(payload){
  if(payload.result == 'fail'){
    alert(payload.message);
    return;
  }
  var newNode = makeInvitedButton(payload.socket_id);
  $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});

/* Handle a notification that we have been invited */
socket.on('invited',function(payload){
  if(payload.result == 'fail'){
    alert(payload.message);
    return;
  }
  var newNode = makePlayButton(payload.socket_id);
  $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});

/* Send an uninvite message to the server */
function uninvite(who){
  var payload = {};
  payload.requested_user = who;

  console.log('*** Client log message: \'uninvite\' payload: '+JSON.stringify(payload));
  socket.emit('uninvite',payload);
}

/* Handle a response after sending an uninvite message to the server */
socket.on('uninvite_response',function(payload){
  if(payload.result == 'fail'){
    alert(payload.message);
    return;
  }
  var newNode = makeInviteButton(payload.socket_id);
  $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});

/* Handle a notification that we have been uninvited */
socket.on('uninvited',function(payload){
  if(payload.result == 'fail'){
    alert(payload.message);
    return;
  }
  var newNode = makeInviteButton(payload.socket_id);
  $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});

/* Send a game_start message to the server */
function game_start(who){
  var payload = {};
  payload.requested_user = who;

  console.log('*** Client log message: \'game_start\' payload: '+JSON.stringify(payload));
  socket.emit('game_start',payload);
}

/* Handle a notification that we have been engaged */
socket.on('game_start_response',function(payload){
  if(payload.result == 'fail'){
    alert(payload.message);
    return;
  }

  var newNode = makeEngagedButton(payload.socket_id);
  $('.socket_'+payload.socket_id+' button').replaceWith(newNode);

/* Jump to a new page */
window.location.href = 'game.html?username='+username+'&game_id='+payload.game_id;
});

function send_message(){
  var payload = {};
  payload.room = chat_room;
  payload.message = $('#send_message_holder').val();
  console.log('*** Client Log Message: \'send_message\' payload: '+JSON.stringify(payload));
  socket.emit('send_message',payload);
  $('#send_message_holder').val('');
}

socket.on('send_message_response',function(payload){
  if(payload.result == 'fail'){
    alert(payload.message);
    return;
  }
  var newHTML = '<p><span class="chat-name">'+payload.username+': </span> '+payload.message+'</p>';
  var newNode = $(newHTML);
  newNode.hide();
  $('#messages').prepend(newNode);
  newNode.slideDown(1000);
});

function makeInviteButton(socket_id){
  var newHTML = '<button type=\'button\' class=\'btn btn-outline-primary\'>Invite</button>';
  var newNode = $(newHTML);
  newNode.click(function(){
          invite(socket_id);
  });
  return(newNode);
}

function makeInvitedButton(socket_id){
  var newHTML = '<button type=\'button\' class=\'btn btn-primary\'>Invited</button>';
  var newNode = $(newHTML);
  newNode.click(function(){
          uninvite(socket_id);
  });
  return(newNode);
}

function makePlayButton(socket_id){
  var newHTML = '<button type=\'button\' class=\'btn btn-success\'>Play</button>';
  var newNode = $(newHTML);
  newNode.click(function(){
          game_start(socket_id);
  });
  return(newNode);
}

function makeEngagedButton(){
  var newHTML = '<button type=\'button\' class=\'btn btn-danger\'>Engaged</button>';
  var newNode = $(newHTML);
  return(newNode);
}

$(function(){
  var payload = {};
  payload.room = chat_room;
  payload.username = username;

  console.log('*** Client Log Message: \'join_room\' payload: '+JSON.stringify(payload));
  socket.emit('join_room',payload);

  $('#quit').append('<a href="lobby.html?username='+username+'" class="btn btn-lg active btn-quit" role="button" aria-pressed="true">Quit</a>');

});

/* Code for the board specifically */
var old_board = [
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?']
                ];

var my_color = ' ';
var interval_timer;

socket.on('game_update',function(payload){

  console.log('*** Client Log Message: \'game_update\'\n\tpayload: '+JSON.stringify(payload));
  /* Check for a good board update */
  if(payload.result == 'fail'){
    console.log(payload.message);
    window.location.href = 'lobby.html?username='+username;
    return;
}
/* Check for a good board in the payload */
var board = payload.game.board;
if('undefined' == typeof board || !board){
  console.log('Internal error: received a malformed board update from the server');
  return;
}
/* Update my color */
if(socket.id == payload.game.player_white.socket){
  my_color = 'white';
}
else if(socket.id == payload.game.player_black.socket){
  my_color = 'black';
}
else {
  /* Something weird is going on, like 3 people playing at once */
  /* Send client back to lobby */
  window.location.href = 'lobby.html?username='+username;
  return;
}

/*
if(my_color == 'black')

var my_color_name = ' ';
var whose_turn_name = ' ';

if(my_color == 'white'){
  my_color_name = 'whale';
}
if(my_color == 'black'){
  my_color_name = 'squid';
}


if(payload.game.whose_turn == 'white'){
  payload.game.whose_turn_name = 'whale';
}
if(payload.game.whose_turn == 'black'){
  payload.game.whose_turn_name = 'squid';
}
*/

if(my_color == 'black'){
  $('#my_color').html('<h2 id="#my_color">I am Squid</h2>');
}
else{
  $('#my_color').html('<h2 id="#my_color">I am Whale</h2>');
}

if((payload.game.whose_turn == 'black') && (my_color == 'black')){
  $('#my_color').append('<h3><span class="turn-bold my-turn">It is my turn.</span> Elapsed time <span id="elapsed"></span></h3>');
}
else if((payload.game.whose_turn == 'black') && (my_color == 'white')){
  $('#my_color').append('<h3>It is <span class="turn-bold ">Squid\'s turn</span>. Elapsed time <span id="elapsed"></span></h3>');
}
else if((payload.game.whose_turn == 'white') && (my_color == 'white')){
  $('#my_color').append('<h3><span class="turn-bold my-turn">It is my turn.</span> Elapsed time <span id="elapsed"></span></h3>');
}
else if((payload.game.whose_turn == 'white') && (my_color == 'black')){
  $('#my_color').append('<h3>It is <span class="turn-bold">Whale\'s turn</span>. Elapsed time <span id="elapsed"></span></h3>');
}








/*
$('#my_color').html('<h2 id="#my_color">I am '+my_color+'</h2>');
$('#my_color').append('<h3>It is <span class="turn-bold">'+payload.game.whose_turn+'\'s turn</span>. Elapsed time <span id="elapsed"></span></h3>');
*/

clearInterval(interval_timer);
interval_timer = setInterval(function(last_time){
  return function (){
    //Do the work of updating the UI
    var d = new Date();
    var elapsedmilli = d.getTime() - last_time;
    var minutes = Math.floor(elapsedmilli / (60 * 1000));
    var seconds = Math.floor((elapsedmilli % (60 * 1000))/ 1000);

    if(seconds < 10){
    $('#elapsed').html(minutes+':0'+seconds);
    }
    else{
    $('#elapsed').html(minutes+':'+seconds);
    }

  }}(payload.game.last_move_time)
  , 1000);

/* Animate changes to the board */
var blacksum = 0;
var whitesum = 0;
var row,column;
for(row = 0; row < 8; row++){
  for(column = 0; column < 8; column++){
    if(board[row][column] == 'b'){
      blacksum++;
    }
    if(board[row][column] == 'w'){
      whitesum++;
    }

    /* If a board space has changed */
    if(old_board[row][column] != board[row][column]){
      /* Empty */
      if(old_board[row][column] == '?' && board[row][column] == ' '){
        $('#'+row+'_'+column).html('<img class="" src="assets/images/emptytoken.svg" alt="empty square" />');
      }
      /* Empty to white */
      else if(old_board[row][column] == '?' && board[row][column] == 'w'){
        $('#'+row+'_'+column).html('<img class="token-fade-in" src="assets/images/whitetoken.svg" alt="white square" />');
      }
      /* Empty to black */
      else if(old_board[row][column] == '?' && board[row][column] == 'b'){
        $('#'+row+'_'+column).html('<img class="token-fade-in" src="assets/images/blacktoken.svg" alt="black square" />');
      }
      /* Empty to white */
      else if(old_board[row][column] == ' ' && board[row][column] == 'w'){
        $('#'+row+'_'+column).html('<img class="token-fade-in" src="assets/images/whitetoken.svg" alt="white square" />');
      }
      /* Empty to black */
      else if(old_board[row][column] == ' ' && board[row][column] == 'b'){
        $('#'+row+'_'+column).html('<img class="token-fade-in" src="assets/images/blacktoken.svg" alt="black square" />');
      }
      /* White to empty */
      else if(old_board[row][column] == 'w' && board[row][column] == ' '){
        $('#'+row+'_'+column).html('<img class="" src="assets/images/emptytoken.svg" alt="empty square" />');
      }
      /* Black to empty */
      else if(old_board[row][column] == 'b' && board[row][column] == ' '){
        $('#'+row+'_'+column).html('<img class="" src="assets/images/emptytoken.svg" alt="empty square" />');
      }
      /* White to black */
      else if(old_board[row][column] == 'w' && board[row][column] == 'b'){
        $('#'+row+'_'+column).html('<img class="" src="assets/images/blacktoken.svg" alt="black square" />');
      }


      /* TRYING TO FLIP
      else if(old_board[row][column] == 'w' && board[row][column] == 'b'){
        $('#'+row+'_'+column).html('<div class="flip-container"><div class="flipper"><div class="front"><img class="fade-wb" src="assets/images/whitetoken.svg" alt="white square" /></div><div class="back"><img class="fade-wb" src="assets/images/blacktoken.svg" alt="black square" /></div></div></div>');
      }
      */

      /* Black to white */
      else if(old_board[row][column] == 'b' && board[row][column] == 'w'){
        $('#'+row+'_'+column).html('<img class="" src="assets/images/whitetoken.svg" alt="white square" />');
      }
      /* Error */
      else{
        $('#'+row+'_'+column).html('<img src="assets/images/errortoken.svg" alt="error" />');
      }
    }

/* Set up interactivity */
$('#'+row+'_'+column).off('click');
$('#'+row+'_'+column).removeClass('hovered_over');

if(payload.game.whose_turn === my_color){
  if(payload.game.legal_moves[row][column] === my_color.substr(0,1)){
        $('#'+row+'_'+column).addClass('hovered_over');
        $('#'+row+'_'+column).click(function(r,c){
          return function(){
            var payload = {};
            payload.row = r;
            payload.column = c;
            payload.color = my_color;
            console.log('***Client log message: \'play_token\' payload: '+JSON.stringify(payload));
            socket.emit('play_token',payload);
          };
        }(row,column));
      }
    }
  }
}

$('#blacksum').html(blacksum);
$('#whitesum').html(whitesum);

old_board = board;

});

socket.on('play_token_response',function(payload){

  console.log('*** Client Log Message: \'play_token_response\'\n\tpayload: '+JSON.stringify(payload));
  /* Check for a good play token response */
  if(payload.result == 'fail'){
    console.log(payload.message);
    alert(payload.message);
    return;
  }
});

socket.on('game_over',function(payload){

  console.log('*** Client Log Message: \'game_over\'\n\tpayload: '+JSON.stringify(payload));
  /* Check for a good play token response */
  if(payload.result == 'fail'){
    console.log(payload.message);
    return;
  }

  /* Jump to a new page */
  $('#game_over').html('<h1>Game over</h1><h2>'+payload.who_won+' won!</h2>');
  $('#game_over').append('<a href="lobby.html?username='+username+'" class="btn btn-success btn-lg active" role="button" aria-pressed="true">Return to the lobby</a>');
});
