const commitTransactions = async sessions => {
  return await Promise.all(
    sessions.map(async session => {
      await session.commitTransaction();
      await session.endSession();
    })
  );
};

const abortTransactions = async sessions => {
  return await Promise.all(
    sessions.map(async session => {
      await session.abortTransaction();
      await session.endSession();
    })
  );
};

module.exports = { commitTransactions, abortTransactions };
