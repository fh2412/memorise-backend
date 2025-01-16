const fetchUsersForMemoryFromDB = async (memoryId) => {
    const query = `
        SELECT u.* 
        FROM users u 
        INNER JOIN user_has_memory um ON u.user_id = um.user_id
        WHERE um.memory_id = ?`;

    try {
        const [rows] = await db.query(query, [memoryId]);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error fetching users for memory (${query}): ${error.message}`);
        throw error;
    }
};

const fetchCreatedMemoriesFromDB = async (userId) => {
    const query = `
        SELECT memories.*, users.name AS username, location.latitude, location.longitude
        FROM memories
        JOIN users ON memories.user_id = users.user_id
        JOIN location ON memories.location_id = location.location_id
        WHERE memories.user_id = ?`;

    try {
        const [rows] = await db.query(query, [userId]);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error fetching created memories for user (${query}): ${error.message}`);
        throw error;
    }
};

const fetchAddedMemoriesFromDB = async (userId) => {
    const query = `
        SELECT memories.*, users.name AS username, location.latitude, location.longitude
        FROM memories
        JOIN user_has_memory ON memories.memory_id = user_has_memory.memory_id
        JOIN users ON memories.user_id = users.user_id
        JOIN location ON memories.location_id = location.location_id
        WHERE user_has_memory.user_id = ?`;

    try {
        const [rows] = await db.query(query, [userId]);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error fetching added memories for user (${query}): ${error.message}`);
        throw error;
    }
};

const fetchAllMemoriesFromDB = async (userId) => {
    const query = `
        SELECT memory_id, title
        FROM memories
        WHERE user_id = ?

        UNION ALL

        SELECT memories.memory_id, memories.title
        FROM memories
        INNER JOIN user_has_memory ON memories.memory_id = user_has_memory.memory_id
        WHERE user_has_memory.user_id = ?`;

    try {
        const [combinedRows] = await db.query(query, [userId, userId]);
        return combinedRows.map(memory => ({
            memoryId: memory.memory_id,
            title: memory.title
        }));
    } catch (error) {
        logger.error(`Data Access error; Error fetching all memories for user (${query}): ${error.message}`);
        throw error;
    }
};

const fetchMemoryByIdFromDB = async (memoryId) => {
    const query = `
        SELECT * 
        FROM memories 
        WHERE memory_id = ?`;

    try {
        const [rows] = await db.query(query, [memoryId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error(`Data Access error; Error fetching memory by memoryId (${query}): ${error.message}`);
        throw error;
    }
};

const fetchMemoryFriendsFromDB = async (memoryId, userId) => {
    const query = `
        SELECT u.name, u.user_id, u.dob, u.profilepic, u.country
        FROM users u
        INNER JOIN user_has_memory um ON u.user_id = um.user_id
        WHERE um.memory_id = ? AND u.user_id != ?`;

    try {
        const [rows] = await db.query(query, [memoryId, userId]);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error fetching friends for memoryId: ${memoryId}, userId: ${userId}: ${error.message}`);
        throw error;
    }
};

const fetchMemoryFriends = async (memoryId) => {
    const query = `
      SELECT u.user_id, u.name, u.dob, u.profilepic, u.country
      FROM user_has_memory AS uh
      JOIN users AS u ON uh.user_id = u.user_id
      WHERE uh.memory_id = ?
    `;

    try {
        const [rows] = await db.execute(query, [memoryId]);
        return rows;
    } catch (error) {
        logger.error(`Data Access error; Error fetching friends for memoryId: ${memoryId}: ${error.message}`);
        throw error;
    }
};

const getSharedMemoriesCount = async (userId1, userId2) => {
    const query = `
      SELECT COUNT(DISTINCT m.memory_id) AS sharedMemoriesCount
      FROM memories AS m
      LEFT JOIN user_has_memory AS uh1 ON m.memory_id = uh1.memory_id AND uh1.user_id = ?
      LEFT JOIN user_has_memory AS uh2 ON m.memory_id = uh2.memory_id AND uh2.user_id = ?
      WHERE 
        (uh1.user_id IS NOT NULL AND uh2.user_id IS NOT NULL)
        OR (m.user_id = ? AND uh2.user_id IS NOT NULL)
        OR (m.user_id = ? AND uh1.user_id IS NOT NULL)
    `;

    try {
        const [result] = await db.execute(query, [userId1, userId2, userId1, userId2]);
        return result[0]?.sharedMemoriesCount || 0;
    } catch (error) {
        logger.error(`Data Access error; Error fetching shared memory count: ${error.message}`);
        throw error;
    }
};