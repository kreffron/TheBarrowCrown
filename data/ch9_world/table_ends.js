/* The end of each chapter at the Dungeon Master's table (script command ['tableEnd', chapter]; src/opening.js plays it).
   lines: the first whose condition holds is his line on the chapter, else fallback. notes come from the chronicle.
   card: the old "Coming next" card, used when the table is off (Options) or the game is running fast. */
(function () {
  G.D.tableEnds = {
    1: {
      title: 'Chapter One', sub: "The Thane's Barrow", place: 'barrow', next: 'The Drowned Abbey', card: 'Chapter Two: The Drowned Abbey',
      lines: [
        ['grukk=1', 'You let the goblin walk, and he took his whole tribe with him. I had plans for Grukk. Now he has plans of his own.'],
        ['grukk=2', "Grave silver for a goblin's mercy. Somewhere in Brackenford, a churchwarden is counting the plates."],
        ['grukk=3', "Grukk Gravepicker, dead in the Thane's crypt. I liked that goblin. Never mind. I have more."]
      ],
      fallback: 'One barrow lit again. The King has four more, and he is very patient.'
    },
    2: {
      title: 'Chapter Two', sub: 'The Drowned Abbey', place: 'abbey', next: 'The Oath of Stone', card: 'Chapter Three: The Oath of Stone',
      lines: [
        ['ab.choice=1', 'You saved the fishermen and let the Sister walk off with a shard. Heroes. I can work with heroes.'],
        ['ab.choice=2&hostagesLost', 'You chased the Sister, and the tide came in behind you. Saltmere will remember that.'],
        ['ab.choice=2', 'You chased her and still saved every fisherman. I had that sluice timed to the second. Rude.'],
        ['ab.choice=3', "You traded the Thane's shard for a boatful of fishermen. She carries two now. I am delighted."]
      ],
      fallback: "The Abbey's lamp burns again. The tide goes out. For now."
    },
    3: {
      title: 'Chapter Three', sub: 'The Oath of Stone', place: 'cairn', next: 'The Pale Hand', card: 'Chapter Four: The Pale Hand',
      lines: [
        ['runaOath=1', "Runa stood the trial and walked out with Bryn. I had dice ready for that. She didn't need them."],
        ['runaOath=2', 'Runa paid the stone-price, and the clan said nothing kind. Stone remembers. So do I.'],
        ['runaOath=3', "A bard talking a clan out of its own oath. I'm writing that one down."],
        ['runaOath=4', "Five more winters at the Cairn, when this is over. I'll hold her to that."]
      ],
      fallback: 'The Cairn holds. The snow will cover your tracks by morning.'
    },
    4: {
      title: 'Chapter Four', sub: 'The Pale Hand', place: 'highmoor', next: 'The Barrow King', card: 'Chapter Five: The Barrow King',
      lines: [
        ['shards4=1', "You put the shards in the Duke's vault, and the Chancellor kept the key. Always ask who holds the key."],
        ['shards4=2', 'You kept the shards, so Corr had to take them out of your hands. He enjoyed that. So did I.'],
        ['heist=1', 'You burned every debt in Highmoor. Half the city is free, and the other half is furious. Lovely.'],
        ['heist=2', "You kept Highmoor's debt-papers. Wren won't speak to Dask. I doubt his conscience will either."]
      ],
      fallback: 'Highmoor stands, for now. And the King has almost everything he needs.'
    }
  };
})();
