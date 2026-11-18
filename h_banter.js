/* Party banter: the four talking among themselves while you explore. Each entry plays once, the first time you
   enter its map (with its condition met), as lines low on the screen that do not stop play (UI.bark). */
(function () {
  const D = G.D;
  D.kindNames = { giant: 'Giant' };
  D.weather = { thornwood: 'leaves', mill: 'leaves', mirefen: 'rain', karrow: 'snow', frostpass: 'snow', falls: 'snow', highmoor: 'rain', ashfall: 'ash', ashroad: 'ash', icehalls: 'snow' };
  D.banter = [
    // Chapter 1
    { id: 'thorn1', map: 'thornwood', if: 'joined', lines: [['Finch', 'Lovely wood. Lovely, lovely wood. Is that a wolf?'], ['Runa', 'That is a stump.'], ['Finch', 'Lovely stump.']] },
    { id: 'mill1', map: 'mill', lines: [['Dask', 'Goblins in a mill. What do they even want with flour?'], ['Runa', 'To throw it in your eyes.'], ['Dask', '...Fair.']] },
    { id: 'tower1', map: 'oldtower', lines: [['Maren', 'Someone kept a lamp in that window once. You can see the soot.'], ['Finch', 'Someone keeps one there now, by the look of it. And not a nice someone.']] },
    { id: 'barrow1', map: 'barrow1', lines: [['Dask', 'Barrows. Always barrows. Why can nobody bury a king in a nice dry cellar?'], ['Maren', 'Speak softly. They were people.'], ['Dask', 'Rich people. I am being very respectful of the rich ones.']] },
    { id: 'cistern1', map: 'cistern', lines: [['Runa', 'It stinks.'], ['Finch', 'It echoes, though. Listen: la!'], ['Runa', 'It stinks AND it echoes.']] },
    { id: 'ossuary1', map: 'ossuary', lines: [['Maren', 'Wardens buried their own here. Every skull has a lamp carved over it.'], ['Finch', 'I am going to write a song about this place, and nobody is going to like it.']] },
    { id: 'millrace1', map: 'millrace', lines: [['Runa', 'Stones. Plates. Gates. This is my kind of puzzle.'], ['Dask', 'Your kind of puzzle is "hit it".'], ['Runa', 'And these ones I get to push. Progress.']] },
    { id: 'hbarrow1', map: 'hollowbarrow', lines: [['Dask', 'Everyone walk exactly where I walk.'], ['Finch', 'Where are you walking?'], ['Dask', 'Somewhere that does not click.']] },
    // Chapter 2
    { id: 'salt1', map: 'saltmere', lines: [['Finch', 'Smell that! Salt and tar and fish.'], ['Runa', 'You say that as if it is good.'], ['Finch', 'It is the smell of an audience, Runa.']] },
    { id: 'fen1', map: 'mirefen', lines: [['Dask', 'My boots are full of fen.'], ['Maren', 'The lights out on the water: do not follow them. Whatever they promise.'], ['Dask', 'Nobody has ever promised me anything nice enough to wade for.']] },
    { id: 'abbey1', map: 'abbey1', lines: [['Maren', 'The Lamplighter\'s abbey. I used to dream of seeing it.'], ['Finch', 'Is it what you dreamed?'], ['Maren', 'It was dry, in my dreams.']] },
    { id: 'wreck1', map: 'wreck', lines: [['Runa', 'A ship, on its side, in a field of mud.'], ['Dask', 'Somebody\'s cargo is still in there. Somebody\'s very unguarded cargo.']] },
    { id: 'seacave1', map: 'seacave', lines: [['Finch', 'Grandmother said the sea-caves sing at high tide.'], ['Dask', 'Did she say what they sing about?'], ['Finch', 'Drowning, mostly.']] },
    { id: 'dchapel1', map: 'drownedchapel', lines: [['Maren', 'They kept the lamps lit even as the sea came in. Even then.'], ['Runa', 'Stubborn people. I like them.']] },
    { id: 'scaves1', map: 'seacaves', lines: [['Finch', 'Hear that? Under the waves? That is a melody.'], ['Dask', 'That is water hitting rocks.'], ['Finch', 'That is what melodies ARE, Dask.']] },
    // Chapter 3
    { id: 'karrow1', map: 'karrow', lines: [['Runa', 'Home.'], ['Finch', 'It is very... white.'], ['Runa', 'It is very home.']] },
    { id: 'pass1', map: 'frostpass', lines: [['Dask', 'I cannot feel my fingers. A thief without fingers is just a man.'], ['Runa', 'Put them in your armpits. Karrow trick.'], ['Dask', 'Karrow has some very intimate tricks.']] },
    { id: 'icecave1', map: 'icecaves', lines: [['Maren', 'The ice remembers light. Look how it holds my lamp.'], ['Finch', 'It is like standing inside a bell.']] },
    { id: 'falls1', map: 'falls', lines: [['Finch', 'Oh, that is LOUD. I love it.'], ['Runa', 'My grandfather jumped from the top for a dare.'], ['Dask', 'And?'], ['Runa', 'And we have a story about it.']] },
    { id: 'cairn1', map: 'cairn1', lines: [['Runa', 'The cairns of the old kings. Walk soft. They hear.'], ['Maren', 'Then we will be polite.']] },
    { id: 'ihalls1', map: 'icehalls', lines: [['Runa', 'I slid down this rink on a shield when I was six.'], ['Maren', 'And?'], ['Runa', 'And I have a scar about it.']] },
    { id: 'spire1', map: 'echospire', lines: [['Finch', 'A tower full of bells. I may never leave.'], ['Maren', 'The mirrors want light, and the bells want you. We will manage between us.']] },
    // Chapter 4
    { id: 'high1', map: 'highmoor', lines: [['Dask', 'Highmoor. Every second door here has my name on a bill behind it.'], ['Finch', 'And the other doors?'], ['Dask', 'Wanted posters.']] },
    { id: 'cata1', map: 'catacombs1', lines: [['Maren', 'So many dead, under so many living. They walk over them every day.'], ['Runa', 'In Karrow we burn ours. Then they keep you warm one last time.']] },
    { id: 'under1', map: 'undercroft', lines: [['Finch', 'There is a whole city down here. A whole, damp, unhappy city.'], ['Dask', 'Where do you think the rent goes?']] },
    { id: 'sewer1', map: 'sewer4', lines: [['Runa', 'I take back what I said about the cistern.'], ['Dask', 'What did you say about the cistern?'], ['Runa', 'That it stank.']] },
    { id: 'arch1', map: 'archive', lines: [['Dask', 'Do you know how many times I have been in a building I was not allowed in?'], ['Maren', 'I do not want to know.'], ['Dask', 'Neither do the people who own them. Shh.']] },
    { id: 'lamps1', map: 'lampvault', lines: [['Maren', 'Under everything, the first lamp-hall. I did not think it was real.'], ['Finch', 'Then let us light it up and make it real.']] },
    // Chapter 5
    { id: 'ash1', map: 'ashfall', lines: [['Finch', 'Even the snow is grey here.'], ['Maren', 'It is not snow.']] },
    { id: 'ashroad1', map: 'ashroad', lines: [['Runa', 'Long road.'], ['Dask', 'Last road, maybe.'], ['Finch', 'Then it had better have a good song at the end of it.']] },
    { id: 'cinder1', map: 'cinderkeep', lines: [['Dask', 'Nice fortress. Shame about the people in it.'], ['Runa', 'We will fix that.']] },
    { id: 'lamphall1', map: 'lamphall', lines: [['Maren', 'Every one of these lamps was put out on purpose.'], ['Maren', 'Then we light them on purpose.']] }
  ];
})();
