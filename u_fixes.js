/* Reachability fixes, after the dungeon redraw (d_dungeons.js) and the placed entrances (D.placeNear). Found by the
   walk test in tools/reachtest.py, which follows the party from the start through every door, stair and story move.
   Each fix opens a way past something that was sealing part of a map off. */
(function () {
  const M = G.D.maps;
  const set = (id, x, y, ch) => { const r = M[id].rows[y]; M[id].rows[y] = r.slice(0, x) + ch + r.slice(x + 1); };

  // The Last Door (hollow2): the stairs down from the Hall of Lamps stood in the only corridor into the level, so
  // every step forward went back up them. A step of floor beside the stairs lets the party past.
  set('hollow2', 2, 13, '.');

  // The Sleepers' Vault (vault3): the third brazier was boxed in behind the vault's chest, so the stone door could
  // never open. The chest moves into the brazier's alcove, and its old place becomes floor.
  set('vault3', 19, 5, '.'); set('vault3', 21, 4, 'c');

  // The Thornwood (thornwood): once the old tower's stairs appear, they stand in the one path into the web glade.
  // A second lane beside them keeps the glade (its spider, its mushrooms, its traveller) in reach.
  set('thornwood', 4, 7, ':'); set('thornwood', 4, 8, ':');
})();
