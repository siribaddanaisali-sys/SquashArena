/**
 * ELO Rating System for Squash
 * K-factor varies by player experience level
 */

const K_FACTOR_NEW = 40;       // New players (< 30 matches)
const K_FACTOR_NORMAL = 20;    // Regular players
const K_FACTOR_TOP = 10;       // Top players (rating > 2400)

function getKFactor(rating, totalMatches) {
  if (totalMatches < 30) return K_FACTOR_NEW;
  if (rating > 2400) return K_FACTOR_TOP;
  return K_FACTOR_NORMAL;
}

/**
 * Calculate expected score (probability of winning)
 */
function expectedScore(playerRating, opponentRating) {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * Calculate new ELO ratings after a match
 * @param {number} winnerRating - Current rating of winner
 * @param {number} loserRating - Current rating of loser  
 * @param {number} winnerMatches - Total matches played by winner
 * @param {number} loserMatches - Total matches played by loser
 * @returns {{ winnerNewRating, loserNewRating, winnerChange, loserChange }}
 */
export function calculateElo(winnerRating, loserRating, winnerMatches, loserMatches) {
  const winnerK = getKFactor(winnerRating, winnerMatches);
  const loserK = getKFactor(loserRating, loserMatches);

  const winnerExpected = expectedScore(winnerRating, loserRating);
  const loserExpected = expectedScore(loserRating, winnerRating);

  const winnerChange = Math.round(winnerK * (1 - winnerExpected) * 100) / 100;
  const loserChange = Math.round(loserK * (0 - loserExpected) * 100) / 100;

  return {
    winnerNewRating: Math.round((winnerRating + winnerChange) * 100) / 100,
    loserNewRating: Math.max(100, Math.round((loserRating + loserChange) * 100) / 100),
    winnerChange,
    loserChange,
  };
}
