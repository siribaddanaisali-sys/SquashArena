import User from './User.js';
import Player from './Player.js';
import Coach from './Coach.js';
import Tournament from './Tournament.js';
import Match from './Match.js';
import Ranking from './Ranking.js';
import Venue from './Venue.js';
import Court from './Court.js';
import PlayerCoach from './PlayerCoach.js';

// User associations
User.hasOne(Player, { foreignKey: 'userId' });
User.hasOne(Coach, { foreignKey: 'userId' });

Player.belongsTo(User, { foreignKey: 'userId' });
Coach.belongsTo(User, { foreignKey: 'userId' });

// Player-Coach associations
Player.belongsToMany(Coach, { through: PlayerCoach, foreignKey: 'playerId' });
Coach.belongsToMany(Player, { through: PlayerCoach, foreignKey: 'coachId' });

// Match associations
Match.belongsTo(Player, { as: 'player1', foreignKey: 'player1Id' });
Match.belongsTo(Player, { as: 'player2', foreignKey: 'player2Id' });
Match.belongsTo(Tournament, { foreignKey: 'tournamentId' });

Player.hasMany(Match, { as: 'matchesAsPlayer1', foreignKey: 'player1Id' });
Player.hasMany(Match, { as: 'matchesAsPlayer2', foreignKey: 'player2Id' });

// Ranking associations
Ranking.belongsTo(Player, { foreignKey: 'playerId' });
Player.hasMany(Ranking, { foreignKey: 'playerId' });

// Tournament associations
Tournament.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });
Tournament.hasMany(Match, { foreignKey: 'tournamentId' });

// Venue and Court associations
Venue.hasMany(Court, { foreignKey: 'venueId' });
Court.belongsTo(Venue, { foreignKey: 'venueId' });

export {
  User,
  Player,
  Coach,
  Tournament,
  Match,
  Ranking,
  Venue,
  Court,
  PlayerCoach,
};
