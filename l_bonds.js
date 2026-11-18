/* Bonds at the inn: evenings where the companions argue, tease, and make up, and Runa's answer moves their trust in
   her and how they get on with each other (see src/bonds.js). One plays on every other inn rest, alternating with
   the quieter evenings in D.innTalk. A bond gone sour gets its own evening first, with a chance to mend it.
   Also: a line in the epilogue for each pair of companions, by how they ended up. */
(function () {
  const D = G.D;
  const say = (who, t) => ['say', who, t], note = t => ['note', t], bond = (k, n) => ['bond', k, n];
  const pick = (q, opts) => ['choice', null, q, opts];
  D.bondTalk = [
    // ---- mending: a trust or a friendship gone sour comes first ----
    { id: 'mend_dask', if: 'bond.dask<=-2', script: [say('Dask', 'I have been thinking. About leaving. Not tonight. Soon.'), say('Dask', 'You have not exactly been on my side, lately.'),
      pick('What does Runa say?', [['Ask him to stay, and mean it', [say('Runa', 'Stay. I mean it. I have not said it enough.'), say('Dask', '...Well. Since you asked nicely.'), bond('dask', 3)]],
        ['Tell him the door is open', [say('Dask', '...Noted.'), bond('dask', -1)]]])] },
    { id: 'mend_maren', if: 'bond.maren<=-2', script: [say('Maren', 'Runa. I keep the lamp because I believe in what it stands for. Lately I am not sure we stand for it.'),
      pick('What does Runa say?', [['Hear her out', [note('Maren talks for a long time. Runa listens for all of it.'), say('Maren', 'Thank you. That is all I needed.'), bond('maren', 3)]],
        ['Tell her the road is not a temple', [say('Maren', 'No. It is not.'), bond('maren', -1)]]])] },
    { id: 'mend_finch', if: 'bond.finch<=-2', script: [say('Finch', 'You know what the worst thing is, for a bard? Being in a story where nobody listens to you.'),
      pick('What does Runa say?', [['Ask him what he would have done', [say('Finch', '...Really? All right. First, I would have...'), note('It is a long answer. Some of it is good.'), bond('finch', 3)]],
        ['Tell him to write it in a song', [say('Finch', 'Oh, I will.'), bond('finch', -1)]]])] },
    { id: 'mend_dm', if: 'bond.dask_maren<=-2', script: [note('Dask and Maren sit at opposite ends of the table and talk only to Runa, about each other.'),
      pick('What does Runa do?', [['Make them talk it out', [note('It takes an hour and most of a bottle. They come out of it friends, mostly.'), bond('dask_maren', 3)]],
        ['Leave them to it', [note('Nobody says much at breakfast.'), bond('dask_maren', -1)]]])] },
    { id: 'mend_df', if: 'bond.dask_finch<=-2', script: [note('Finch has stopped putting Dask in his songs. Dask has noticed, and is pretending not to.'),
      pick('What does Runa do?', [['Ask Finch to sing the old verse about Dask', [say('Finch', '...Fine. For you.'), note('Dask mouths along to the chorus. Finch sees him do it.'), bond('dask_finch', 3)]],
        ['Stay out of it', [bond('dask_finch', -1)]]])] },
    { id: 'mend_mf', if: 'bond.maren_finch<=-2', script: [note('Maren and Finch have not said a kind word to each other in days.'),
      pick('What does Runa do?', [['Get them to tell each other one good thing', [say('Finch', 'You never give up on anybody. It is very annoying.'), say('Maren', 'You make people laugh when they need to. It is very annoying.'), bond('maren_finch', 3)]],
        ['Let it burn out on its own', [bond('maren_finch', -1)]]])] },
    // ---- chapter 1 ----
    { id: 'b1_purse', if: 'chapter>=1', script: [note('Dask is counting coins on the table. Maren is watching him do it.'), say('Maren', 'Where did that come from, Dask?'), say('Dask', 'A purse. Purses are where coins live.'),
      say('Maren', 'Whose purse?'), say('Dask', 'Mine, now. Runa, tell her it is fine.'),
      pick('What does Runa say?', [['Give it back, Dask', [say('Dask', '...Fine. FINE. The poor-box gets it. With great ceremony.'), bond('maren', 1), bond('dask', -1)]],
        ['It is his business', [say('Maren', 'I see.'), bond('dask', 1), bond('maren', -1), bond('dask_maren', -1)]],
        ['Sort it out between you', [note('They argue until the candle gutters. By the end, they are almost laughing.'), bond('dask_maren', 1)]]])] },
    { id: 'b1_snore', if: 'chapter>=1', script: [say('Finch', 'I have written a verse about Runa\'s snoring. It is called The Avalanche.'),
      pick('What does Runa do?', [['Laugh', [say('Dask', 'Do the second verse.'), say('Finch', 'There are four.'), bond('finch', 1), bond('dask_finch', 1)]],
        ['Glare until he stops', [say('Finch', '...Tough crowd.'), bond('finch', -1)]],
        ['Add a verse of her own', [note('Runa\'s verse is about Finch\'s hat. It is better than his.'), say('Finch', 'That is... annoyingly good.'), bond('finch', 2)]]])] },
    // ---- chapter 2 ----
    { id: 'b2_faith', if: 'chapter>=2', script: [say('Finch', 'Maybe the Lamplighter just cannot find the fens. Too much fog.'), note('Maren goes quiet.'),
      pick('What does Runa do?', [['Tell Finch to apologise', [say('Finch', '...Sorry, Maren. That was cheap.'), say('Maren', 'It was. Thank you.'), bond('maren', 1), bond('finch', -1), bond('maren_finch', 1)]],
        ['Laugh it off', [say('Maren', 'Of course.'), bond('finch', 1), bond('maren', -1), bond('maren_finch', -1)]],
        ['Ask Maren what the Lamplighter means to her', [say('Maren', '...It means somebody keeps watch. Even here. Even when I cannot.'), say('Finch', 'I would like to put that in a song. If you will let me.'), bond('maren_finch', 2), bond('maren', 1)]]])] },
    { id: 'b2_debt', if: 'chapter>=2', script: [note('A man in a Highmoor coat stops at the table and looks at Dask for a long moment. "Underbough. I thought you were dead."'),
      pick('What does Runa do?', [['Cover for him', [say('Runa', 'He is with us. Whatever you think he owes, take it up with me.'), note('The man looks at the axe, and leaves.'), bond('dask', 2), bond('maren', -1)]],
        ['Let Dask face it', [say('Dask', '...Right. Facing it. Excellent idea. I will face it from behind you.'), bond('dask', -1), bond('maren', 1)]],
        ['Nod to Finch', [note('Finch starts a song about debt collectors. The whole room joins the chorus. The man leaves.'), say('Dask', 'I could kiss you.'), say('Finch', 'Please do not.'), bond('dask_finch', 2)]]])] },
    // ---- chapter 3 ----
    { id: 'b3_songs', if: 'chapter>=3', script: [say('Finch', 'The skald says the clan songs are not for outsiders. Is that true, Runa?'),
      pick('What does Runa say?', [['Teach him one yourself', [note('Runa sings it low, under the noise of the hall. Finch does not write it down. He just listens.'), say('Finch', '...Thank you.'), bond('finch', 2)]],
        ['Some songs are kept', [say('Finch', 'I understand. I do not like it, but I understand.'), bond('finch', -1)]]])] },
    { id: 'b3_dice', if: 'chapter>=3', script: [note('Dask and Finch are dicing for the last of the honey cakes. Dask\'s dice keep coming up sixes.'),
      pick('What does Runa do?', [['Call it out', [say('Dask', 'Lies. Slander. Luck.'), say('Finch', 'I KNEW it.'), bond('finch', 1), bond('dask', -1), bond('dask_finch', -1)]],
        ['Let it go', [say('Finch', 'I saw that, Runa. I saw you see it.'), bond('dask', 1), bond('dask_finch', -1)]],
        ['Sit down and play', [note('Runa does not know how to cheat at dice. She wins anyway. Nobody understands how.'), bond('dask_finch', 1), bond('dask', 1), bond('finch', 1)]]])] },
    // ---- chapter 4 ----
    { id: 'b4_why', if: 'chapter>=4&bond.dask_maren>=0', script: [say('Maren', 'Why do you stay, Dask? Truly.'), say('Dask', 'Somebody has to stop you giving all our money to orphans.'), say('Maren', 'That is not an answer.'),
      say('Dask', '...You three are the first people who never sold me on.'),
      pick('What does Runa do?', [['Say nothing. Let it sit.', [note('Nobody says anything for a while. It is a good while.'), bond('dask_maren', 2)]],
        ['Tease him', [say('Runa', 'Was that a feeling, Dask?'), say('Dask', 'Indigestion.'), bond('dask_maren', 1), bond('dask', 1)]]])] },
    { id: 'b4_city', if: 'chapter>=4', script: [say('Maren', 'This city frightens me more than the barrows did. At least the dead are honest about wanting you.'),
      pick('What does Runa say?', [['We are leaving as soon as we can', [say('Maren', 'Good.'), bond('maren', 1), bond('finch', -1)]],
        ['Finch, show her the good parts', [note('Finch drags Maren to a puppet show, a bakery and a bridge with a view. She comes back smiling.'), bond('maren_finch', 2)]]])] },
    // ---- chapter 5 ----
    { id: 'b5_eve', if: 'chapter>=5', script: [note('The last quiet night before the Ashen Road. Nobody wants to go to bed.'),
      say('Finch', 'A toast. To the four of us. Whatever happens.'), say('Dask', 'To the four of us. Mostly to me.'), say('Maren', 'To the four of us.'),
      pick('What does Runa say?', [['To the four of us', [bond('dask_maren', 1), bond('dask_finch', 1), bond('maren_finch', 1)]],
        ['To the ones we lost on the way', [note('The table goes quiet. Then Maren lifts her cup, and the others follow.'), bond('maren', 1), bond('dask_maren', 1), bond('maren_finch', 1)]]])] }
  ];
  // the epilogue: a card for each pair of companions who ended up close, or never made peace
  const PAIR = {
    dask_maren: ['Dask and Maren', ['They write to each other every month. She corrects his spelling. He corrects her optimism. Neither works.'], ['They were civil to the end. They are civil at weddings. That is all.']],
    dask_finch: ['Dask and Finch', ['Every ballad Finch writes has a rogue in it, and every rogue gets the best lines. Dask pretends not to notice.'], ['Finch never sang about Dask again. Dask says he prefers it that way. He does not.']],
    maren_finch: ['Maren and Finch', ['Finch sings at every lamp-lighting Maren keeps. She pretends it is too loud. It is exactly loud enough.'], ['Maren and Finch went separate ways, and wished each other well, mostly.']]
  };
  const cards = Object.entries(PAIR).map(([k, [title, good, bad]]) => ['if', 'bond.' + k + '>=6', [['card', title, '', good]], [['if', 'bond.' + k + '<=-2', [['card', title, '', bad]]]]]);
  const ep = D.scripts.epilogueHeroes; if (ep) ep.splice(ep.length - 1, 0, ...cards);
})();
