const db = require('../../config/db');
const logger = require('../../middleware/logger');

const getFriendsFromDB = async (userId) => {
    const query = `
      SELECT u.user_id, u.name, u.email, u.dob, u.gender, u.profilepic
      FROM friendships f
      JOIN users u ON (f.user_id1 = u.user_id OR f.user_id2 = u.user_id)
      WHERE (f.user_id1 = ? OR f.user_id2 = ?)
        AND f.status = 'accepted'
        AND NOT u.user_id = ?;
    `;
    try {
        const [results] = await db.query(query, [userId, userId, userId]);
        return results;
    } catch (error) {
        logger.error(`Data Access error; Error selecting users friends (${query}): ${error.message}`);
        throw error;
    }
};

const getFriendshipStatusFromDB = async (userId1, userId2) => {
    const query = `
      SELECT status, user_id1, user_id2
      FROM friendships
      WHERE (user_id1 = ? AND user_id2 = ?)
         OR (user_id1 = ? AND user_id2 = ?)
    `;
    try {
        const [results] = await db.query(query, [userId1, userId2, userId2, userId1]);
        return results;
    } catch (error) {
        logger.error(`Data Access error; Error selecting friend status (${query}): ${error.message}`);
        throw error;
    }
};

const getMissingMemoryFriendsFromDB = async (userId, memoryId) => {
    const query = `
      SELECT u.user_id, u.name, u.email
      FROM friendships f
      JOIN users u ON (f.user_id1 = u.user_id OR f.user_id2 = u.user_id)
      WHERE (f.user_id1 = ? OR f.user_id2 = ?) 
      AND f.status = 'accepted'
      AND NOT u.user_id = ?
      AND NOT EXISTS (
        SELECT 1 
        FROM user_has_memory 
        WHERE user_id = u.user_id 
        AND memory_id = ?
      )
      AND NOT EXISTS (
        SELECT 1 
        FROM memories 
        WHERE user_id = u.user_id 
        AND memory_id = ?
      );
    `;
    try {
        const [results] = await db.query(query, [userId, userId, userId, memoryId, memoryId]);
        return results;
    } catch (error) {
        logger.error(`Data Access error; Error selecting missing memory friends (${query}): ${error.message}`);
        throw error;
    }
};

const getPendingFriendsFromDB = async (userId) => {
    const query = `
      SELECT u.user_id, u.name, u.dob, u.gender, u.profilepic
      FROM friendships f
      JOIN users u ON (f.user_id1 = u.user_id OR f.user_id2 = u.user_id)
      WHERE (f.user_id1 = ?) 
        AND f.status = 'pending'
        AND NOT u.user_id = ?;
    `;
    try {
        const [results] = await db.query(query, [userId, userId]);
        return results;
    } catch (error) {
        logger.error(`Data Access error; Error getting pending friends (${query}): ${error.message}`);
        throw error;
    }
};

const getIngoingFriendRequestsFromDB = async (userId) => {
    const query = `
      SELECT u.user_id, u.name, u.dob, u.gender, u.profilepic
      FROM friendships f
      JOIN users u ON (f.user_id1 = u.user_id OR f.user_id2 = u.user_id)
      WHERE (f.user_id2 = ?) 
        AND f.status = 'pending'
        AND NOT u.user_id = ?;
    `;

    try {
        const [results] = await db.query(query, [userId, userId]);
        return results;
    } catch (error) {
        logger.error(`Data Access error; Error getting ingoing friends (${query}): ${error.message}`);
        throw error;
    }
};

const getFriendSuggestionsFromDB = async (userId) => {
    const query = `
    WITH UserAcceptedFriends AS (
        -- Finds all direct accepted friends of the target user.
        -- The 'friend_id' column will contain the ID of the friend.
        SELECT f.user_id2 AS friend_id
        FROM friendships f
        WHERE f.user_id1 = ?
        UNION
        SELECT f.user_id1 AS friend_id
        FROM friendships f
        WHERE f.user_id2 = ?
    ),
    FriendsOfFriendsCandidates AS (
        -- Identify potential friend suggestions by looking at friends of the user's friends.
        -- This CTE also tracks which common friend (bridge) connects them.
        SELECT
            -- The potential suggested friend's ID
            CASE
                WHEN fof.user_id1 = uaf.friend_id THEN fof.user_id2
                ELSE fof.user_id1
            END AS potential_friend_id,
            -- The ID of the common friend that links the target user to the potential friend
            uaf.friend_id AS common_friend_id
        FROM friendships fof
        JOIN UserAcceptedFriends uaf
            -- Join conditions to find friendships involving the user's direct friends
            ON (fof.user_id1 = uaf.friend_id OR fof.user_id2 = uaf.friend_id)
        WHERE
            fof.status = 'accepted' -- Ensure it's an accepted friendship
            -- Exclude the target user themselves from being a potential friend
            AND fof.user_id1 != ?
            AND fof.user_id2 != ?
    )
    SELECT
        u.user_id,
        u.name,
        u.gender,
        u.dob,
        u.profilepic,
        COUNT(DISTINCT fofc.common_friend_id) AS common_friends_count
    FROM FriendsOfFriendsCandidates fofc
    JOIN users u ON u.user_id = fofc.potential_friend_id
    WHERE
        -- Crucial: Filter out any potential suggestions who are already direct friends of the target user.
        fofc.potential_friend_id NOT IN (SELECT friend_id FROM UserAcceptedFriends)
    GROUP BY
        u.user_id, u.name, u.gender, u.dob
    ORDER BY
        common_friends_count DESC
    LIMIT 5;
    `;
    try {
        const [results] = await db.query(
            query,
            [
                userId, // For WHERE f.user_id1 = ? (UserAcceptedFriends first part)
                userId, // For WHERE f.user_id2 = ? (UserAcceptedFriends second part)
                userId, // For AND fof.user_id1 != ? (FriendsOfFriendsCandidates)
                userId, // For AND fof.user_id2 != ? (FriendsOfFriendsCandidates)
                userId  // For fofc.potential_friend_id NOT IN (SELECT friend_id FROM UserAcceptedFriends)
            ]
        );
        return results;
    } catch (error) {
        logger.error(`Data Access error; Error getting suggested friends (${query}): ${error.message}`);
        throw error;
    }
};

const insertFriendRequest = async (senderId, receiverId) => {
    const query = `
      INSERT INTO friendships (user_id1, user_id2, status) 
      VALUES (?, ?, ?)
    `;

    try {
        await db.query(query, [senderId, receiverId, 'pending']);
    } catch (error) {
        logger.error(`Data Access error; Error sending friend request (${query}): ${error.message}`);
        throw error;
    }
};

const insertFriend = async (senderId, receiverId) => {
    const query = `
      INSERT INTO friendships (user_id1, user_id2, status) 
      VALUES (?, ?, ?)
    `;

    try {
        await db.query(query, [senderId, receiverId, 'accepted']);
    } catch (error) {
        logger.error(`Data Access error; Error inserting friend request (${query}): ${error.message}`);
        throw error;
    }
};

const updateFriendRequestStatus = async (userId1, userId2) => {
    const query = `
      UPDATE friendships 
      SET status = ? 
      WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)
    `;

    try {
        await db.query(query, ['accepted', userId1, userId2, userId2, userId1]);
    } catch (error) {
        logger.error(`Data Access error; Error accepting friend request (${query}): ${error.message}`);
        throw error;
    }
};

const removeFriendFromDB = async (userId1, userId2) => {
    const query = `DELETE FROM friendships WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)`;

    try {
        await db.query(query, [userId1, userId2, userId2, userId1]);
        return { message: 'Friendship removed successfully' };
    } catch (error) {
        logger.error(`Data Access error; Error accepting friend request (${query}): ${error.message}`);
        throw error;
    }
};


module.exports = {
    getFriendsFromDB,
    getFriendshipStatusFromDB,
    getMissingMemoryFriendsFromDB,
    getPendingFriendsFromDB,
    getIngoingFriendRequestsFromDB,
    getFriendSuggestionsFromDB,
    insertFriendRequest,
    insertFriend,
    updateFriendRequestStatus,
    removeFriendFromDB,
}