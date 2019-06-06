/* This code is a collab between Christine Benedict and Serena Epstein, June 2019 */


/* GAME LOGIC */
var old_board = [
                    [' ',' ',' ',' ',' ',' ',' ',' '],
                    [' ',' ',' ',' ',' ',' ',' ',' '],
                    [' ',' ',' ',' ',' ',' ',' ',' '],
                    [' ',' ',' ','w','b',' ',' ',' '],
                    [' ',' ',' ','b','w',' ',' ',' '],
                    [' ',' ',' ',' ',' ',' ',' ',' '],
                    [' ',' ',' ',' ',' ',' ',' ',' '],
                    [' ',' ',' ',' ',' ',' ',' ',' ']
                ];

var my_color = 'black';
var interval_timer;
var d = new Date();


function check_line_match(who, dr, dc, r, c, board){
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
  return check_line_match(who, dr, dc, r+dr, c+dc, board);
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
  return check_line_match(who, dr, dc, r+dr+dr, c+dc+dc, board);
}

function calculate_valid_moves(who, board){
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

function flip_line(who, dr, dc, r, c, board){
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

function flip_board(who, row, column, board){
  flip_line(who,-1,-1,row,column,board);
  flip_line(who,-1, 0,row,column,board);
  flip_line(who,-1, 1,row,column,board);

  flip_line(who, 0,-1,row,column,board);
  flip_line(who, 0, 1,row,column,board);

  flip_line(who, 1,-1,row,column,board);
  flip_line(who, 1, 0,row,column,board);
  flip_line(who, 1, 1,row,column,board);
}


var game = {
  whose_turn: 'black',
  board: old_board,
  legal_moves: calculate_valid_moves('b',old_board),
  last_move_time: d.getTime(),
}


function setInitialSquares(){
  for(let row = 0; row < 8; row++){
    for( let column = 0; column < 8; column ++){
      if(game.board[row][column] == ' '){
        $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/emptytoken.svg" alt="empty square" /> ').addClass('hovered_over');
      }
      if(game.board[row][column] == 'w'){
        $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/whitetoken.svg" alt="white square" /> ');
      } else if (game.board[row][column] == 'b'){
        $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/blacktoken.svg" alt="black square" /> ');
      }
    }
  }
}



/* GAME INFO */
$('#my_color').html('<h2 id="#my_color">I am '+my_color+'</h2>');
$('#my_color').append('<h3>It is <span class="turn-bold">'+game.whose_turn+'\'s turn</span>. Elapsed time <span id="elapsed"></span></h3>');

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

  }}(game.last_move_time), 1000);

/* Animate changes to the board */
var blacksum = 0;
var whitesum = 0;

var row, column;

function clickASquare(row, column){
  if(game.whose_turn === my_color){
    if(game.legal_moves[row][column] === my_color.substr(0,1)){
      if(old_board[row][column] != game.board[row][column]){
        if(old_board[row][column] == ' ' && game.board[row][column] == 'w'){
          $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/whitetoken.svg" alt="white square" />');
        } else if(old_board[row][column] == ' ' && game.board[row][column] == 'b'){
          $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/blacktoken.svg" alt="black square" />');
        } else if(old_board[row][column] == 'w' && game.board[row][column] == ' '){
          $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/emptytoken.svg" alt="empty square" />');
        } else if(old_board[row][column] == 'b' && game.board[row][column] == ' '){
          $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/emptytoken.svg" alt="empty square" />');
        } else if(old_board[row][column] == 'w' && game.board[row][column] == 'b'){
          $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/blacktoken.svg" alt="black square" />');
        } else if(old_board[row][column] == 'b' && game.board[row][column] == 'w'){
          $(`#${row}_${column}`).html('<img class="token-fade-in"" src="assets/images/whitetoken.svg" alt="white square" />');
        } else {
          $(`#${row}_${column}`).html('<img src="assets/images/errortoken.svg" alt="error" />');
        }

        $(`#${row}_${column}`).off('click');
      }


      /* Check to see if the game is over */
      var row,column;
      var count = 0;
      var black = 0;
      var white = 0;
      for(row = 0; row < 8; row++){
      for(column = 0; column < 8; column++){
          if(game.legal_moves[row][column] != ' '){
            count++;
          }
          if(game.board[row][column] === 'b'){
            black++;
          }
          if(game.board[row][column] === 'w'){
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
      }
      }
      }
      }

      for(row = 0; row < 8; row++){
      for( column = 0; column < 8; column ++){
      if(game.board[row][column] == 'b'){
      blacksum++
      }
      if(game.board[row][column] == 'w'){
      whitesum++
      }


      if(old_board[row][column] != game.board[row][column]){
      if(old_board[row][column] == '?' && game.board[row][column] == ' '){
        $(`#${row}_${column}`).html('<img class="" src="assets/images/emptytoken.svg" alt="empty square" />');
      } else if(old_board[row][column] == 'w' && game.board[row][column] == 'w'){
        $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/whitetoken.svg" alt="white square" />');
      } else if(old_board[row][column] == 'b' && game.board[row][column] == 'b'){
        $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/blacktoken.svg" alt="black square" />');
      } else if(old_board[row][column] == ' ' && game.board[row][column] == 'w'){
        $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/whitetoken.svg" alt="white square" />');
      } else if(old_board[row][column] == ' ' && game.board[row][column] == 'b'){
        $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/blacktoken.svg" alt="black square" />');
      } else if(old_board[row][column] == 'w' && game.board[row][column] == ' '){
        $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/emptytoken.svg" alt="empty square" />');
      } else if(old_board[row][column] == 'b' && game.board[row][column] == ' '){
        $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/emptytoken.svg" alt="empty square" />');
      } else if(old_board[row][column] == 'w' && game.board[row][column] == 'b'){
        $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/blacktoken.svg" alt="black square"/>');
      } else if(old_board[row][column] == 'b' && game.board[row][column] == 'w'){
        $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/whitetoken.svg" alt="white square"/>');
      } else {
        $(`#${row}_${column}`).html('<img src="assets/images/errortoken.svg" alt="error" />');
      }

      $(`#${row}_${column}`).off('click');

      if(payload.game.whose_turn === my_color){
        if(payload.game.legal_moves[row][column] === my_color.substr(0,1)){
          $(`#${row}_${column}`).addClass('hovered_over');
          $(`#${row}_${column}`).click(function(r,c){
            return function(){
              var payload = {};
              payload.row = r;
              payload.column = c;
              payload.color = my_color;
              console.log('*** Client Log Message: \'play token\' payload: '+JSON.stringify(payload));
            };
          }(row,column));
        } else {
          $(`#${row}_${column}`).removeClass('hovered_over');
        }
      }
      }
      }
      }
      $('#blacksum').html(blacksum);
      $('#whitesum').html(whitesum);

      old_board = game.board;


      window.onload=function(){
        setInitialSquares();
      }
