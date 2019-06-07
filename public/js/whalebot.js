// BotUI script, adapted from botui.org //

var botui = new BotUI('whalebot');
// fact1 = 'The blue whale is the largest known mammal that ever lived.'
// fact2 = 'Hippos are my closest living relative.'
// fact3 = 'Bowhead whales can live to over 200 years old.'
// trash1 = 'The Great Pacific garbage patch is a collection of floating plastic and trash in the middle of the Pacific Ocean. It covers 1.6 million square kilometers.'
// trash2 = 'You\'re gonna lose this game. My brain weighs 17 pounds.'
// trash3 = 'Plastic can take up to 1000 years to decompose.'
// trash4 = 'Are you still playing? Your moves are so slow I mistook you for a mola mola.'

// Hello, I am Whale!
// Science fact / Trash talk
// Science fact 1 > The blue whale is the largest known mammal that ever lived.
// Science fact / Trash talk
// Trash talk 1 > The Great Pacific garbage patch is a collection of floating plastic and trash in the middle of the Pacific Ocean. It covers 1.6 million square kilometers.
// That's not what I meant by 'trash talk'.
// Trash talk 2 > You're gonna lose this game. My brain weighs 17 pounds.
// Science fact / Trash talk
// Science fact 2 > Hippos are the whale's closest living relative.
// Science fact / Trash talk
// Trash talk 3 > Plastic can take up to 1000 years to decompose.
// You're a bummer
// Science fact / Trash talk
// Science fact 3 > Bowhead whales can live to over 200 years old.
// Trash talk 4 > Are you still playing? Your moves are so slow I mistook you for a mola mola.
// Science fact / Trash talk (loop to beginning)



function init() {
botui.message
  .bot({
    delay: 700,
    content: 'Hello, I am Whale!'
  })
  .then(function () {
    return botui.action.button({
      delay: 1000,
      action: [{
        text: 'Science fact',
        value: 'fact'
      }, {
        text: 'Trash talk',
        value: 'trash'
      }]
    }).then(function (res) {
    if(res.value == 'fact') {
      botui.message.bot({
        delay: 1000,
        content: 'The blue whale is the largest known mammal that ever lived.'
    })}
    else {
      botui.message.bot({
        delay: 1000,
        content: 'The Great Pacific garbage patch is a collection of floating plastic and trash in the middle of the Pacific Ocean. It covers 1.6 million square kilometers.'
      }).then(function () {
        return botui.action.button({
          delay: 1000,
          action: [{
            text: 'That\'s not what I meant by trash talk.',
            value: 'trash'
          }]
        }).then(function (res) {
        if(res.value == 'trash') {
          botui.message.bot({
            delay: 1000,
            content: 'You\'re gonna lose this game. My brain weighs 17 pounds.'
        })}
      })
      })

    }

  })
  })

.then(function () {
  return botui.action.button({
    delay: 1000,
    action: [{
      text: 'Science fact',
      value: 'fact'
    }, {
      text: 'Trash talk',
      value: 'trash'
    }]
  }).then(function (res) {
  if(res.value == 'fact') {
    botui.message.bot({
      delay: 1000,
      content: 'Hippos are my closest living relative.'
  })}
  else {
    botui.message.bot({
      delay: 1000,
      content: 'Plastic can take up to 1000 years to decompose.'
    })
  }

})
}).then(init); // loop to initial state

}


init();


// .then(function () {
//   return botui.action.button({
//     delay: 1000,
//     action: [{
//       text: 'That\'s not what I meant by trash talk.',
//       value: 'trash'
//     }]
//   })
// })
