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

var my_color = 'white';
var interval_timer;


$('#my_color').html('<h2 id="#my_color">I am '+my_color+'</h2>');
$('#my_color').append('<h3>It is <span class="turn-bold">'+payload.game.whose_turn+'\'s turn</span>. Elapsed time <span id="elapsed"></span></h3>');

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


/*******/

/* Execute the move */
if(color == 'white'){
  game.board[row][column] = 'w';
  flip_board('w',row,column,game.board);
  game.whose_turn = 'black';
  game.legal_moves = calculate_valid_moves('b',game.board);
}
else if(color == 'black'){
  game.board[row][column] = 'b';
  flip_board('b',row,column,game.board);
  game.whose_turn = 'white';
  game.legal_moves = calculate_valid_moves('w',game.board);
}

var d = new Date();
game.last_move_time = d.getTime();

/* A registry of currently created games */
var games = [];

function create_new_game(){
  var new_game = {};
  new_game.player_white = {};
  new_game.player_black = {};
  new_game.player_white.socket = '';
  new_game.player_white.username = '';
  new_game.player_black.socket = '';
  new_game.player_black.username = '';

  var d = new Date();
  new_game.last_move_time = d.getTime();

  new_game.whose_turn = 'black';
  new_game.board = [
                      [' ',' ',' ',' ',' ',' ',' ',' '],
                      [' ',' ',' ',' ',' ',' ',' ',' '],
                      [' ',' ',' ',' ',' ',' ',' ',' '],
                      [' ',' ',' ','w','b',' ',' ',' '],
                      [' ',' ',' ','b','w',' ',' ',' '],
                      [' ',' ',' ',' ',' ',' ',' ',' '],
                      [' ',' ',' ',' ',' ',' ',' ',' '],
                      [' ',' ',' ',' ',' ',' ',' ',' ']
                    ];
new_game.legal_moves = calculate_valid_moves('b',new_game.board);

return new_game;
}

/* Check if there is a color 'who' on the line starting at (r,c) or
 * anywhere further by adding dr and dc to (r,c) */

function check_line_match(who,dr,dc,r,c,board){
  if(board[r][c] === who){
    return true;
  }
  if(board[r][c] === ' '){
    return false;
  }

  if( (r+dr < 0) || (r+dr > 7) ){
    return false;
  }
  if( (c+dc < 0) || (c+dc > 7) ){
    return false;
  }
  return check_line_match(who,dr,dc,r+dr,c+dc,board);
}


/* Check if the position at r,c contains the opposite of who on the board
 * and if the line indicated by adding dr to r and dc to c eventually sends
 * in the who color */

function valid_move(who,dr,dc,r,c,board){
  var other;
  if(who === 'b'){
    other = 'w';
  }
  else if(who === 'w'){
    other = 'b';
  }
  else{
    log('Houston, we have a color problem: '+who);
    return false;
  }
  if( (r+dr < 0) || (r+dr > 7) ){
    return false;
  }
  if( (c+dc < 0) || (c+dc > 7) ){
    return false;
  }
  if(board[r+dr][c+dc] != other){
    return false;
  }
  if( (r+dr+dr < 0) || (r+dr+dr > 7) ){
    return false;
  }
  if( (c+dc+dc < 0) || (c+dc+dc > 7) ){
    return false;
  }
  return check_line_match(who,dr,dc,r+dr+dr,c+dc+dc,board);
}

function calculate_valid_moves(who,board){
  var valid = [
                  [' ',' ',' ',' ',' ',' ',' ',' '],
                  [' ',' ',' ',' ',' ',' ',' ',' '],
                  [' ',' ',' ',' ',' ',' ',' ',' '],
                  [' ',' ',' ',' ',' ',' ',' ',' '],
                  [' ',' ',' ',' ',' ',' ',' ',' '],
                  [' ',' ',' ',' ',' ',' ',' ',' '],
                  [' ',' ',' ',' ',' ',' ',' ',' '],
                  [' ',' ',' ',' ',' ',' ',' ',' ']
                ];
  for(var row = 0; row < 8; row++){
    for(var column = 0; column < 8; column++){
      if(board[row][column] === ' '){
        nw = valid_move(who,-1,-1,row,column,board);
        nn = valid_move(who,-1, 0,row,column,board);
        ne = valid_move(who,-1, 1,row,column,board);

        ww = valid_move(who, 0,-1,row,column,board);
        ee = valid_move(who, 0, 1,row,column,board);

        sw = valid_move(who, 1,-1,row,column,board);
        ss = valid_move(who, 1, 0,row,column,board);
        se = valid_move(who, 1, 1,row,column,board);

        if(nw || nn || ne || ww || ee || sw || ss || se){
          valid[row][column] = who;
        }
      }
    }
  }
  return valid;
}

function flip_line(who,dr,dc,r,c,board){
  if( (r+dr < 0) || (r+dr > 7) ){
    return false;
  }
  if( (c+dc < 0) || (c+dc > 7) ){
    return false;
  }

  if(board[r+dr][c+dc] === ' '){
    return false;
  }
  if(board[r+dr][c+dc] === who){
    return true;
  }
  else{
    if(flip_line(who,dr,dc,r+dr,c+dc,board)){
      board[r+dr][c+dc] = who;
      return true;
    }
    else{
      return false;
    }
  }
}

function flip_board(who,row,column,board){
  flip_line(who,-1,-1,row,column,board);
  flip_line(who,-1, 0,row,column,board);
  flip_line(who,-1, 1,row,column,board);

  flip_line(who, 0,-1,row,column,board);
  flip_line(who, 0, 1,row,column,board);

  flip_line(who, 1,-1,row,column,board);
  flip_line(who, 1, 0,row,column,board);
  flip_line(who, 1, 1,row,column,board);
}

/* Check to see if the game is over */
var row,column;
var count = 0;
var black = 0;
var white = 0;
for(row = 0; row < 8; row++){
for(column = 0; column < 8; column++){
  if(games[game_id].legal_moves[row][column] != ' '){
    count++;
  }
  if(games[game_id].board[row][column] === 'b'){
    black++;
  }
  if(games[game_id].board[row][column] === 'w'){
    white++;
  }
}
}
if(count == 0){
  
/* Send a game over message */
var winner = 'tie game';
if(black > white){
  winner = 'black';
}
if(white > black){
  winner = 'white';
}
