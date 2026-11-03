const pollDl = require('./planPollsDatalink');

const toLocation = (row) => (row.latitude == null || row.longitude == null ? null : {
  lat: Number(row.latitude),     // DECIMAL arrives as string from mysql2
  lng: Number(row.longitude),
  city: row.city ?? '',
  country: row.country ?? '',
  countryCode: row.country_code ?? '',
});

const groupBy = (rows, key) => {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r[key])) map.set(r[key], []);
    map.get(r[key]).push(r);
  }
  return map;
};

const buildPoll = (p, options, votes, viewerId) => {
  const votersByOption = new Map(options.map(o => [o.option_id, []]));
  const voters = new Set();
  const myVotes = [];
  for (const v of votes) {
    votersByOption.get(v.option_id)?.push(v.user_id);
    voters.add(v.user_id);
    if (v.user_id === viewerId) myVotes.push(v.option_id);
  }

  const isClosed = Number(p.is_closed) === 1;
  const decided = p.decided_option_id != null;
  const hideResults = Number(p.hide_results) === 1;
  // Enforced server-side: hidden results never reach the client before voting
  const resultsVisible = !hideResults || myVotes.length > 0 || decided || isClosed;

  return {
    multiple: Number(p.multiple) === 1,
    max_choices: p.max_choices,
    closes_at: p.closes_at,
    is_closed: isClosed,
    allow_member_options: Number(p.allow_member_options) === 1,
    hide_results: hideResults,
    decided_option_id: p.decided_option_id,
    decided_by: p.decided_by,
    decided_at: p.decided_at,
    source_item_id: p.source_item_id,
    results_visible: resultsVisible,
    total_voters: voters.size,
    my_votes: myVotes,
    options: options.map(o => {
      const list = votersByOption.get(o.option_id) ?? [];
      return {
        option_id: o.option_id,
        label: o.label,
        sort_order: o.sort_order,
        created_by: o.created_by,
        location: toLocation(o),
        votes: resultsVisible ? list.length : null,
        voters: resultsVisible ? list : null,
      };
    }),
  };
};

/** Adds `poll` to every poll item. Non-poll items pass through unchanged. */
const attachPollData = async (conn, items, viewerId) => {
  const ids = items.filter(i => i.type === 'poll').map(i => i.item_id);
  if (ids.length === 0) return items;

  const polls = new Map((await pollDl.findPollsDb(conn, ids)).map(p => [p.item_id, p]));
  const options = groupBy(await pollDl.findOptionsDb(conn, ids), 'item_id');
  const votes = groupBy(await pollDl.findVotesDb(conn, ids), 'item_id');

  return items.map((item) => {
    if (item.type !== 'poll') return item;
    const p = polls.get(item.item_id);
    return {
      ...item,
      poll: p ? buildPoll(p, options.get(item.item_id) ?? [], votes.get(item.item_id) ?? [], viewerId) : null,
    };
  });
};

module.exports = { attachPollData, toLocation };