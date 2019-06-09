// BotUI script, adapted from botui.org //

var botui = new BotUI('whalebot');

var fact = [
            'The blue whale is the largest known mammal that ever lived.',
            'Hippos are my closest living relative.',
            'Bowhead whales can live to over 200 years old.',
            'Sperm whales love to snack on giant squid.',
            'A narwhal\'s tusk is actually one long tooth! Inside their mouths, narwhals are completely toothless.',
            'Beluga whales can change their forehead shape to make facial expressions.',
            'Whale songs can travel hundreds or even thousands of miles through the water.',
            'Whales are host to a variety of parasites, including barnacles, whale lice, worms, sea lampreys, and more.',
            'A blue whale\'s heart is the size of a car.',
            'Orcas can imitate human speech patterns.'
          ];

var trash = [
            'The Great Pacific garbage patch is a collection of floating plastic and trash in the middle of the Pacific Ocean. It covers 1.6 million square kilometers.',
            'You\'re gonna lose this game. My brain weighs 17 pounds.',
            'Plastic can take up to 1000 years to decompose.',
            'Are you still playing? Your moves are so slow I mistook you for a mola mola.',
            'About 8 million metric tons of plastic are thrown into the ocean every year.',
            'By 2050, there will be more plastic in the ocean than fish (by weight).',
            'In the most polluted parts of the ocean, up to 74% of a sea turtle\'s diet is plastic.',
            'Do you speak whale? [screeching noise]',
            'We\'re not friends. You\'re my anemone.',
            'I can navigate thousands of miles without directions. You can\'t even find your way around this game board.'
          ];

botui.message.bot({
    delay: 1000,
    content: 'Hello, I am Whale!'
  })


function init() {

botui.action.button({
      delay: 1000,
      action: [{
        text: 'Science fact',
        value: 'fact'
      }, {
        text: 'Trash talk',
        value: 'trash'
      }]
    })
    .then(function (res) {
    if(res.value == 'fact') {
      var randFact = fact[Math.floor(Math.random() * fact.length)];
      botui.message.bot({
        delay: 1000,
        content: randFact
    })
  }
    else {
      var randTrash = trash[Math.floor(Math.random() * trash.length)];
      botui.message.bot({
      delay: 1000,
      content: randTrash
      })
    }
  }).then(init)
};

init()
