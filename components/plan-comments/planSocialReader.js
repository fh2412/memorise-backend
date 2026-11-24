const { groupBy } = require('../plan-shared/planDb');
const dl = require('./planCommentsDatalink');

const REACTIONS = ['thumbs_up', 'heart', 'laugh', 'wow', 'party', 'thumbs_down'];

/** Fixed order, only reactions that someone used. */
const summarizeReactions = (rows, viewerId) => REACTIONS.flatMap((key) => {
  const users = rows.filter(r => r.reaction === key).map(r => r.user_id);
  return users.length ? [{ key, count: users.length, mine: users.includes(viewerId), users }] : [];
});

/** Adds comment_count and reactions to every item (2 queries for the whole board). */
const attachSocialData = async (conn, items, viewerId) => {
  const ids = items.map(i => i.item_id);
  if (ids.length === 0) return items;

  const counts = new Map((await dl.countCommentsDb(conn, ids)).map(c => [c.item_id, Number(c.n)]));
  const reactions = groupBy(await dl.findReactionsDb(conn, ids), 'item_id');

  return items.map(i => ({
    ...i,
    comment_count: counts.get(i.item_id) ?? 0,
    reactions: summarizeReactions(reactions.get(i.item_id) ?? [], viewerId),
  }));
};

module.exports = { REACTIONS, summarizeReactions, attachSocialData };