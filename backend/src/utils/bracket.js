/**
 * Tournament Bracket Generation Utilities
 */

/**
 * Generate single elimination bracket
 * @param {Array} players - Array of { playerId, seedNumber, playerName }
 * @returns {{ rounds: Array, totalRounds: number }}
 */
export function generateSingleElimination(players) {
  // Sort by seed
  const seeded = [...players].sort((a, b) => (a.seedNumber || 999) - (b.seedNumber || 999));
  
  // Pad to nearest power of 2
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(seeded.length)));
  const totalRounds = Math.ceil(Math.log2(bracketSize));
  
  // Fill remaining slots with BYEs
  while (seeded.length < bracketSize) {
    seeded.push({ playerId: null, seedNumber: null, playerName: 'BYE' });
  }

  // Standard seeding placement (1 vs last, 2 vs second-to-last, etc.)
  const ordered = seedBracketOrder(seeded, bracketSize);

  // Build rounds
  const rounds = [];
  
  // Round 1 - initial matchups
  const round1 = [];
  for (let i = 0; i < ordered.length; i += 2) {
    const p1 = ordered[i];
    const p2 = ordered[i + 1];
    const isBye = !p1.playerId || !p2.playerId;
    
    round1.push({
      matchIndex: i / 2,
      player1: p1,
      player2: p2,
      winnerId: isBye ? (p1.playerId || p2.playerId) : null,
      status: isBye ? 'completed' : 'pending',
      score: null,
    });
  }
  rounds.push({ roundNumber: 1, name: getRoundName(1, totalRounds), matches: round1 });

  // Subsequent rounds (empty placeholders)
  let matchesInRound = round1.length / 2;
  for (let r = 2; r <= totalRounds; r++) {
    const roundMatches = [];
    for (let m = 0; m < matchesInRound; m++) {
      roundMatches.push({
        matchIndex: m,
        player1: null,
        player2: null,
        winnerId: null,
        status: 'pending',
        score: null,
      });
    }
    rounds.push({ roundNumber: r, name: getRoundName(r, totalRounds), matches: roundMatches });
    matchesInRound = matchesInRound / 2;
  }

  // Advance BYE winners to round 2
  const byeWinners = round1.filter(m => m.status === 'completed' && m.winnerId);
  byeWinners.forEach((match, idx) => {
    const r2Idx = Math.floor(match.matchIndex / 2);
    const slot = match.matchIndex % 2 === 0 ? 'player1' : 'player2';
    const winner = match.player1.playerId === match.winnerId ? match.player1 : match.player2;
    if (rounds[1]) {
      rounds[1].matches[r2Idx][slot] = winner;
    }
  });

  return { rounds, totalRounds };
}

/**
 * Generate round robin bracket
 * @param {Array} players - Array of { playerId, seedNumber, playerName }
 * @returns {{ rounds: Array, totalRounds: number, standings: Array }}
 */
export function generateRoundRobin(players) {
  const n = players.length;
  const list = [...players];
  
  // If odd number, add a BYE
  if (n % 2 !== 0) {
    list.push({ playerId: null, seedNumber: null, playerName: 'BYE' });
  }
  
  const totalRounds = list.length - 1;
  const half = list.length / 2;
  const rounds = [];

  // Circle method for round robin scheduling
  const fixed = list[0];
  const rotating = list.slice(1);

  for (let r = 0; r < totalRounds; r++) {
    const currentOrder = [fixed, ...rotating];
    const matches = [];

    for (let m = 0; m < half; m++) {
      const p1 = currentOrder[m];
      const p2 = currentOrder[currentOrder.length - 1 - m];
      
      if (p1.playerId && p2.playerId) {
        matches.push({
          matchIndex: m,
          player1: p1,
          player2: p2,
          winnerId: null,
          status: 'pending',
          score: null,
        });
      }
    }

    rounds.push({
      roundNumber: r + 1,
      name: `Round ${r + 1}`,
      matches,
    });

    // Rotate: move last element to second position
    rotating.unshift(rotating.pop());
  }

  const standings = players.map(p => ({
    playerId: p.playerId,
    playerName: p.playerName,
    played: 0, wins: 0, losses: 0, gamesWon: 0, gamesLost: 0, points: 0,
  }));

  return { rounds, totalRounds, standings };
}

/**
 * Standard bracket seeding order
 * Places seeds so that top seeds meet latest (e.g., 1 vs 16, 8 vs 9)
 */
function seedBracketOrder(players, size) {
  if (size === 1) return [players[0]];
  if (size === 2) return [players[0], players[1]];

  const result = new Array(size);
  
  // Place seeds using standard bracket positioning
  function placeSeed(seedIndex, position, groupSize) {
    if (groupSize === 1) {
      result[position] = players[seedIndex] || { playerId: null, seedNumber: null, playerName: 'BYE' };
      return;
    }
    const half = groupSize / 2;
    if (seedIndex % 2 === 0) {
      placeSeed(seedIndex, position, half);
    } else {
      placeSeed(seedIndex, position + half, half);
    }
  }

  // Simple standard seeding: 1 vs N, 2 vs N-1, etc.
  for (let i = 0; i < size / 2; i++) {
    result[i * 2] = players[i] || { playerId: null, seedNumber: null, playerName: 'BYE' };
    result[i * 2 + 1] = players[size - 1 - i] || { playerId: null, seedNumber: null, playerName: 'BYE' };
  }

  return result;
}

function getRoundName(roundNumber, totalRounds) {
  const diff = totalRounds - roundNumber;
  if (diff === 0) return 'Final';
  if (diff === 1) return 'Semi-Final';
  if (diff === 2) return 'Quarter-Final';
  return `Round ${roundNumber}`;
}
