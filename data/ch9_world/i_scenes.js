/* Short scenes: a few lines before side-boss fights that had little lead-in (D.bossScenes, played once, just
   before the first attempt at the fight), and evenings at the inn (D.innTalk, one new one per inn rest, newest
   chapter first). */
(function () {
  const D = G.D;
  D.bossScenes = {
    oneear: [['shake', 300], ['say', 'Runa', 'He is old. Old wolves are the clever ones.'], ['say', 'Finch', 'Ten years of sheep and hunters, and never caught. He has earned a song, either way.'], ['say', 'Dask', 'Let us make it a short one.']],
    eelking: [['say', 'Maren', 'The fen-folk say it took a whole boat, once.'], ['say', 'Dask', 'A whole boat. Was anyone in it?'], ['say', 'Maren', '...Yes.'], ['shake', 400], ['say', 'Runa', 'Then it owes them.']],
    troll3: [['say', 'Runa', 'Frost troll. Hit it before it wakes up properly.'], ['say', 'Finch', 'It looks very awake to me.'], ['shake', 400], ['say', 'Runa', 'That is a frost troll half asleep.']],
    whitepaw: [['say', 'Runa', 'Old Whitepaw. Hrolf\'s grandfather lost a hand to this one.'], ['say', 'Dask', 'And then Hrolf sent us. Lovely family.'], ['shake', 500], ['say', 'Maren', 'Be quick, and be kind, if you can.']],
    engine: [['say', 'Dask', 'A debt-collector made of brass. They finally built the perfect one.'], ['say', 'Finch', 'Do you think it takes payment in songs?'], ['say', 'Dask', 'Nothing takes payment in songs, Finch.'], ['shake', 300]],
    ratmother: [['say', 'Runa', 'Rats. Rats the size of me.'], ['say', 'Finch', 'And their mother is the size of a cart.'], ['say', 'Maren', 'Breathe through your mouth. Stay close to me.'], ['shake', 400]],
    ashenknight: [['say', 'Maren', 'That is Warden armour. Burned black.'], ['say', 'Runa', 'Then whoever wears it has no right to it.'], ['say', 'The Ashen Knight', 'You come late. The others came late too.'], ['shake', 500]],
    cinderbrute: [['say', 'Dask', 'Grukk bet us we could not do this. Grukk is going to pay.'], ['say', 'Finch', 'It is eating the CART.'], ['say', 'Runa', 'Good. Then it will have no room for us.'], ['shake', 400]],
    hollowself: [['say', 'Finch', 'That is not my good side.'], ['say', 'Dask', 'That is not anybody\'s good side.'], ['say', 'Maren', 'Whatever it is, it knows us. Do not let it talk.']]
  };
  D.innTalk = [
    { id: 'a5', if: 'chapter>=5', lines: [['Runa', 'Whatever happens at the end of the road...'], ['Dask', 'Don\'t.'], ['Runa', '...I am glad it was you three.'], ['Finch', 'Oh, now I am going to cry into my soup.']] },
    { id: 'b5', if: 'chapter>=5', lines: [['Maren', 'If I fall, keep the lamps lit.'], ['Runa', 'You will not fall. I will be standing in front of you.'], ['Maren', 'That is what I am afraid of.']] },
    { id: 'a4', if: 'chapter>=4', lines: [['Dask', 'This is the city that wants me hanged.'], ['Finch', 'And here we are, sleeping in it.'], ['Dask', 'Best place to hide. Right under their noses.']] },
    { id: 'b4', if: 'chapter>=4', lines: [['Maren', 'Sing something quiet, Finch.'], ['', 'Finch sings low, an old Warden song. For once, nobody in the common room talks.'], ['Maren', '...Thank you.']] },
    { id: 'a3', if: 'chapter>=3', lines: [['Runa', 'In Karrow the beds are furs on stone. This straw is a palace.'], ['Maren', 'You miss it.'], ['Runa', 'Every day. But it will still be there. That is what mountains are for.']] },
    { id: 'b3', if: 'chapter>=3', lines: [['Maren', 'You gave the beggar outside your share.'], ['Dask', 'Did I? Must have been somebody else. Tall, handsome, me-shaped.']] },
    { id: 'a2', if: 'chapter>=2', lines: [['Finch', 'My grandmother would have liked you, Maren.'], ['Maren', 'What was she like?'], ['Finch', 'Loud. Kind. Terrible at cards. She cheated anyway.']] },
    { id: 'b2', if: 'chapter>=2', lines: [['Dask', 'Arm-wrestle. Loser buys breakfast.'], ['Runa', 'You will lose.'], ['Dask', 'I know. I am hungry, and you are rich.']] },
    { id: 'a1', lines: [['Finch', 'Runa, have you ever sung in an inn?'], ['Runa', 'Once. They asked me to stop.'], ['Finch', 'Was it that bad?'], ['Runa', 'It was a battle song. People got up and started fighting.']] },
    { id: 'b1', lines: [['Dask', 'You pray before you sleep. Every night.'], ['Maren', 'I ask for the lamps to stay lit.'], ['Dask', 'And do they?'], ['Maren', 'So far.']] },
    { id: 'c1', lines: [['Runa', 'Your brother. Was he a Warden too?'], ['Maren', 'He was going to be. Ask me another night.'], ['Runa', 'Another night, then.']] },
    { id: 'd1', lines: [['Finch', 'Dask, how much do you actually owe?'], ['Dask', 'Define "owe".'], ['Finch', 'Money you agreed to pay back.'], ['Dask', 'Ah. Then nothing. I never agreed.']] }
  ];

  /* ---------- the four of them: an epilogue card for each hero, shaped by how the road went ---------- */
  D.scripts.epilogueHeroes = [
    ['endtally'],
    ['if', 'ending=1', [['card', 'Your ending', 'The Fifth Stanza']], [['if', 'ending=2', [['card', 'Your ending', 'Ennet Goes Home']], [['card', 'Your ending', 'The Grey Lamp']]]]],
    ['if', 'end.camp.dask>=3', [['card', 'Runa Stonehand', 'Barbarian', ['Runa keeps her axe sharp and her oaths kept, and is hardly ever seen without Dask, who claims to find this exhausting and has never once left.']]],
      [['if', 'end.camp.maren>=3', [['card', 'Runa Stonehand', 'Barbarian', ['Runa keeps her axe sharp and her oaths kept. She and Maren walk the Cairn road together every spring, and talk the whole way.']]],
        [['if', 'end.camp.finch>=3', [['card', 'Runa Stonehand', 'Barbarian', ['Runa keeps her axe sharp and her oaths kept. Finch has written her eleven songs. She pretends to hate every one of them.']]],
          [['if', 'end.camp.alone>=2', [['card', 'Runa Stonehand', 'Barbarian', ['Runa still walks alone at night, the way she always did. These days she comes back before morning.']]],
            [['card', 'Runa Stonehand', 'Barbarian', ['Runa keeps her axe sharp and her oaths kept. When anyone asks what the four of you were to each other, she says one word: clan.']]]]]]]]]],
    ['if', 'bond.dask>=10', [['card', 'Dask Underbough', 'Rogue', ['Dask stays. Nobody is more surprised than Dask. He keeps a room over the Crooked Lantern and the key to every lock in Brackenford, and has not stolen anything in a year. Nearly a year.']]],
      [['if', 'bond.dask>=4', [['card', 'Dask Underbough', 'Rogue', ['Dask drifts, the way he always has: Highmoor, Saltmere, the road. But every midwinter a parcel comes to the Crooked Lantern with no name on it, and something in it for each of you.']]],
        [['card', 'Dask Underbough', 'Rogue', ['Dask is gone one morning, the way thieves go. He leaves the last round of drinks paid for, which, for Dask, is a love letter.']]]]]],
    ['if', 'bond.maren>=10', [['card', 'Maren Vale', 'Cleric', ['Maren keeps the lamps of the valley, and keeps a place at her table for three people who are always late. She says the Lamplighter sent them to her. They say she did.']]],
      [['if', 'bond.maren>=4', [['card', 'Maren Vale', 'Cleric', ['Maren goes wherever the lamps need her. Her letters come from all over the valley, short and kind, and always end the same way: keep the light.']]],
        [['card', 'Maren Vale', 'Cleric', ['Maren goes back to the Wardens\' house and the long quiet of the order. She prays for the three of you by name every night, which is more than most people get.']]]]]],
    ['if', 'bond.finch>=10', [['card', 'Finch Tallowmere', 'Bard', ['Finch sings the Ballad of the Five Lamps in every tavern from Saltmere to Karrow, and in every version the four of you are taller, braver and better-looking. You let it stand.']]],
      [['if', 'bond.finch>=4', [['card', 'Finch Tallowmere', 'Bard', ['Finch takes to the road with a lute and a new song every month. Some of them are even about the four of you.']]],
        [['card', 'Finch Tallowmere', 'Bard', ['Finch sings for the whole valley now, not just for the four of you. The songs are good. You are in one verse, near the end.']]]]]],
    ['if', 'end.bonds>=27', [['card', 'The Crooked Lantern', '', ['Every year, on the night the crown broke, the four of you meet at the Crooked Lantern.', 'In all the years after, nobody misses one.']]],
      [['if', 'end.bonds>=12', [['card', 'The Crooked Lantern', '', ['Most years, on the night the crown broke, the four of you find your way back to the Crooked Lantern.', 'Most years is enough.']]],
        [['card', 'The Crooked Lantern', '', ['The road takes the four of you different ways.', 'But the Crooked Lantern keeps a table by the fire with four chairs, just in case.']]]]]]
  ];
  // play it after the valley's epilogue, just before The End
  const cut = (D.scripts.epilogue5 || []).find(c => c[0] === 'cutscene');
  if (cut) { const body = cut[1], i = body.findIndex(c => c[0] === 'card' && c[1] === 'The End'); if (i > 0) body.splice(i - 1, 0, ['run', 'epilogueHeroes']); }
})();
