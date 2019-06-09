/* This code is a collab between Christine Benedict and Serena Epstein, June 2019 */


// Board initial setup
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
var blacksum = 2;
var whitesum = 2;
var interval_timer;
var d = new Date();

var computerOptions = [];
var computerMoveTimeout;


// Create initial game state
var game = {
  whose_turn: 'black',
  board: JSON.parse(JSON.stringify(old_board)),
  legal_moves: calculate_valid_moves('b',old_board),
  last_move_time: d.getTime(),
}

// Once things are drawn, set the text for my color
$('#my_color').html('<h3><span class="turn-bold my-turn">It is my turn.</span></h3>');

function intervalTimer(last_move_time){
interval_timer = setInterval(function(last_time){
  return function (){
    // Do the work of updating the UI
    var d = new Date();
    var elapsedmilli = d.getTime() - last_time;
    var minutes = Math.floor(elapsedmilli / (60 * 1000));
    var seconds = Math.floor((elapsedmilli % (60 * 1000))/ 1000);

    if(seconds < 10){
    $('#elapsed').html(`${minutes}:0${seconds}`);
    }
    else{
    $('#elapsed').html(`${minutes}:${seconds}`);
    }

  }}(last_move_time), 1000);
}

// Function declarations
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

        $(`#${row}_${column}`).removeClass('hovered_over');

        if(nw || nn || ne || ww || ee || sw || ss || se){
          valid[row][column] = who;
          if(who === 'w'){
            computerOptions.push({row: row, column: column});
          } else if(who ==='b'){
            $(`#${row}_${column}`).addClass('hovered_over');
          }
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

function updateBoardImages(){

  blacksum = 0;
  whitesum = 0;

  for(let row = 0; row < 8; row++){
    for(let column = 0; column < 8; column++){

      // End of the player's move, add one to the count
      if(game.board[row][column] == 'b'){
        blacksum = blacksum+1;
      }
      if(game.board[row][column] == 'w'){
        whitesum = whitesum+1;
      }


      // This is a good time to also update the hover based on legal moves
      // if(game.board[row][column] == ' ' && game.legal_moves[row][column] === my_color.substr(0,1)){
      //   $(`#${row}_${column}`).addClass('hovered_over');
      // } else {
      //   $(`#${row}_${column}`).removeClass('hovered_over');
      // }

      if(old_board[row][column] != game.board[row][column]){
        if(old_board[row][column] == ' ' && game.board[row][column] == 'b'){
          $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/blacktoken.svg" alt="black square"/>').off('click').removeClass('hovered_over');
        } else if(old_board[row][column] == ' ' && game.board[row][column] == 'w'){
          $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/whitetoken.svg" alt="white square"/>').off('click').removeClass('hovered_over');
        } else if(old_board[row][column] == 'w' && game.board[row][column] == 'b'){
          $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/blacktoken.svg" alt="black square"/>')
        } else if(old_board[row][column] == 'b' && game.board[row][column] == 'w'){
          $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/whitetoken.svg" alt="white square"/>');
        } else {
          $(`#${row}_${column}`).html('<img src="assets/images/error.svg" alt="error"/>');
        }
      }
    }
  }
  old_board = JSON.parse(JSON.stringify(game.board));
}

// Check to see if the game is over
function checkIfWinner(){

  var row, column, winner;
  var count = 0;
  var black = 0;
  var white = 0;
  for(let row = 0; row < 8; row++){
    for(let column = 0; column < 8; column++){
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
  console.log('Checking for a winner. ', black, white, 'Count is '+count)


  if(count == 0){
    if(black === white){
      winner = 'tie game';
    } else if(black > white){
      winner = 'black';
    } else if(white > black){
      winner = 'white';
    } else {
      winner = null
    }
  }

  if (winner !== null && winner !== undefined){
    // Tell me if I won
    if(winner == 'black'){
      $('#game_over').html('<h1>Game over</h1><h2>You won!</h2>');
    }
    else if(winner == 'white'){
      $('#game_over').html('<h1>Game over</h1><h2>You lost :(</h2>');
    }

      $('#game_over').append('<a href="index.html" class="btn chat-btn" role="button" aria-pressed="true">Exit game</a>');
    return true;
  } else {
    return false;
  }
}

// Place initial tokens and set up hover
function setInitialSquares(){
  for(let row = 0; row < 8; row++){
    for(let column = 0; column < 8; column ++){
      if(game.board[row][column] == ' '){
        $(`#${row}_${column}`).html(`<img class="token-fade-in" src="assets/images/emptytoken.svg" onClick="clickASquare(${row},${column}); return false;" alt="empty square" />`);
      }
      if(game.board[row][column] == ' ' && game.legal_moves[row][column] === my_color.substr(0,1)){
        $(`#${row}_${column}`).addClass('hovered_over');
      }
      if(game.board[row][column] == 'w'){
        $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/whitetoken.svg" alt="white square" /> ');
      } else if (game.board[row][column] == 'b'){
        $(`#${row}_${column}`).html('<img class="token-fade-in" src="assets/images/blacktoken.svg" alt="black square" /> ');
      }
    }
  }
}


function computersTurn(row, column){

    // Add move to board array
    game.board[row][column] = 'w';

    // Flip tokens in the board array
    flip_board('w', row, column, game.board);

    // Place the appropriate token images
    updateBoardImages();


    // End of the player's move, add one to the count
    $('#blacksum').html(blacksum);
    $('#whitesum').html(whitesum);


    // Check if winner
    checkIfWinner();

    // Change whose turn it is
    game.whose_turn = 'black';
    game.legal_moves = JSON.parse(JSON.stringify(calculate_valid_moves('b', game.board)));
    game.last_move_time = new Date().getTime();
    computerOptions = [];
    $('#my_color').html('<h3><span class="turn-bold my-turn">It is my turn.</span></h3>');
    clearInterval(interval_timer);
    intervalTimer(game.last_move_time);
    clearTimeout(computerMoveTimeout);

    // Check if winner
    checkIfWinner();
}

// Functionality for when a user clicks a square
function clickASquare(row, column){

  // Check to make sure it is the player's turn
  if(game.whose_turn === my_color){

    // Check if valid move
    if(game.legal_moves[row][column] === my_color.substr(0,1)){

      // Add move to board array
      game.board[row][column] = 'b';

      // Flip tokens in the board array
      flip_board('b', row, column, game.board);

      // Place the appropriate token images
      updateBoardImages('b');


      // End of the player's move, add one to the count
      $('#blacksum').html(blacksum);
      $('#whitesum').html(whitesum);


      // Check if winner
      checkIfWinner();

      // Change whose turn it is
      game.whose_turn = 'white';
      game.legal_moves = JSON.parse(JSON.stringify(calculate_valid_moves('w', game.board)));
      game.last_move_time = new Date().getTime();
      $('#my_color').html('<h3>It is <span class="turn-bold ">Whale\'s turn</span>.</h3>');
      clearInterval(interval_timer);
      intervalTimer(game.last_move_time);

      // Check if winner
      checkIfWinner();

      let computerMove = Math.floor(Math.random()*computerOptions.length);

      console.log(computerOptions[computerMove].row, computerOptions[computerMove].column);

      if(!checkIfWinner()){
        computerMoveTimeout = setTimeout(() => {
          computersTurn(computerOptions[computerMove].row, computerOptions[computerMove].column)}, 3000
        );
      }
    }
  }
}

  window.onload=function(){
    setInitialSquares();
    $('#blacksum').html(blacksum);
    $('#whitesum').html(whitesum);
    intervalTimer(game.last_move_time);
    $('#quit').append('<a href="index.html" class="btn btn-lg active btn-quit" role="button" aria-pressed="true">Quit</a>');
  }
