import bcryptjs from 'bcryptjs';
import sequelize from './config/database.js';
import User from './src/models/User.js';
import Player from './src/models/Player.js';
import Coach from './src/models/Coach.js';
import Tournament from './src/models/Tournament.js';
import Match from './src/models/Match.js';
import Ranking from './src/models/Ranking.js';
import Venue from './src/models/Venue.js';
import Court from './src/models/Court.js';
import PlayerCoach from './src/models/PlayerCoach.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS=0');

    // Clear existing data
    await sequelize.truncate({ cascade: true });
    console.log('✓ Cleared existing data');

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS=1');

    // Hash test password
    const hashedPassword = await bcryptjs.hash('Test@123', 10);

    // ============ USERS & PLAYERS ============
    console.log('Creating players...');
    const players = await User.bulkCreate([
      {
        email: 'ali.khan@squash.com',
        password: hashedPassword,
        firstName: 'Ali',
        lastName: 'Khan',
        role: 'player',
        isActive: true,
      },
      {
        email: 'aisha.malik@squash.com',
        password: hashedPassword,
        firstName: 'Aisha',
        lastName: 'Malik',
        role: 'player',
        isActive: true,
      },
      {
        email: 'hassan.ahmed@squash.com',
        password: hashedPassword,
        firstName: 'Hassan',
        lastName: 'Ahmed',
        role: 'player',
        isActive: true,
      },
      {
        email: 'fatima.hassan@squash.com',
        password: hashedPassword,
        firstName: 'Fatima',
        lastName: 'Hassan',
        role: 'player',
        isActive: true,
      },
      {
        email: 'omar.ibrahim@squash.com',
        password: hashedPassword,
        firstName: 'Omar',
        lastName: 'Ibrahim',
        role: 'player',
        isActive: true,
      },
      {
        email: 'sarah.lee@squash.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Lee',
        role: 'player',
        isActive: true,
      },
      {
        email: 'james.smith@squash.com',
        password: hashedPassword,
        firstName: 'James',
        lastName: 'Smith',
        role: 'player',
        isActive: true,
      },
      {
        email: 'emma.wilson@squash.com',
        password: hashedPassword,
        firstName: 'Emma',
        lastName: 'Wilson',
        role: 'player',
        isActive: true,
      },
      {
        email: 'david.brown@squash.com',
        password: hashedPassword,
        firstName: 'David',
        lastName: 'Brown',
        role: 'player',
        isActive: true,
      },
      {
        email: 'sophia.taylor@squash.com',
        password: hashedPassword,
        firstName: 'Sophia',
        lastName: 'Taylor',
        role: 'player',
        isActive: true,
      },
      {
        email: 'michael.anderson@squash.com',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Anderson',
        role: 'player',
        isActive: true,
      },
      {
        email: 'isabella.garcia@squash.com',
        password: hashedPassword,
        firstName: 'Isabella',
        lastName: 'Garcia',
        role: 'player',
        isActive: true,
      },
      {
        email: 'antonio.miller@squash.com',
        password: hashedPassword,
        firstName: 'Antonio',
        lastName: 'Miller',
        role: 'player',
        isActive: true,
      },
      {
        email: 'elena.davis@squash.com',
        password: hashedPassword,
        firstName: 'Elena',
        lastName: 'Davis',
        role: 'player',
        isActive: true,
      },
      {
        email: 'carlos.rodriguez@squash.com',
        password: hashedPassword,
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        role: 'player',
        isActive: true,
      },
      {
        email: 'lucia.martinez@squash.com',
        password: hashedPassword,
        firstName: 'Lucia',
        lastName: 'Martinez',
        role: 'player',
        isActive: true,
      },
      {
        email: 'marco.rossi@squash.com',
        password: hashedPassword,
        firstName: 'Marco',
        lastName: 'Rossi',
        role: 'player',
        isActive: true,
      },
      {
        email: 'giulia.bianchi@squash.com',
        password: hashedPassword,
        firstName: 'Giulia',
        lastName: 'Bianchi',
        role: 'player',
        isActive: true,
      },
      {
        email: 'lucas.santos@squash.com',
        password: hashedPassword,
        firstName: 'Lucas',
        lastName: 'Santos',
        role: 'player',
        isActive: true,
      },
      {
        email: 'ana.silva@squash.com',
        password: hashedPassword,
        firstName: 'Ana',
        lastName: 'Silva',
        role: 'player',
        isActive: true,
      },
    ]);

    // Create player profiles
    const playerProfiles = [];
    for (const user of players) {
      const profile = await Player.create({
        userId: user.id,
        ranking: Math.floor(Math.random() * 100) + 1,
        points: Math.floor(Math.random() * 5000) + 100,
        wins: Math.floor(Math.random() * 50),
        losses: Math.floor(Math.random() * 30),
        hand: Math.random() > 0.5 ? 'right' : 'left',
        nationality: ['Pakistan', 'UK', 'Egypt', 'USA', 'Canada', 'Australia'][
          Math.floor(Math.random() * 6)
        ],
        bio: `Professional squash player with expertise in competitive tournaments.`,
        status: 'active',
      });
      playerProfiles.push(profile);
    }

    console.log('✓ Created 20 players');

    // ============ COACHES ============
    console.log('Creating coaches...');
    const coaches = await User.bulkCreate([
      {
        email: 'coach.ahmed@squash.com',
        password: hashedPassword,
        firstName: 'Ahmed',
        lastName: 'Coaching',
        role: 'coach',
        isActive: true,
      },
      {
        email: 'coach.sara@squash.com',
        password: hashedPassword,
        firstName: 'Sara',
        lastName: 'Coaching',
        role: 'coach',
        isActive: true,
      },
      {
        email: 'coach.john@squash.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Coaching',
        role: 'coach',
        isActive: true,
      },
      {
        email: 'coach.maria@squash.com',
        password: hashedPassword,
        firstName: 'Maria',
        lastName: 'Coaching',
        role: 'coach',
        isActive: true,
      },
      {
        email: 'coach.rajesh@squash.com',
        password: hashedPassword,
        firstName: 'Rajesh',
        lastName: 'Coaching',
        role: 'coach',
        isActive: true,
      },
    ]);

    // Create coach profiles
    for (const user of coaches) {
      await Coach.create({
        userId: user.id,
        certification: 'Level ' + (Math.floor(Math.random() * 3) + 1),
        experience: Math.floor(Math.random() * 20) + 2,
        specialization: ['Technical', 'Fitness', 'Mental Game', 'All-Round'][
          Math.floor(Math.random() * 4)
        ],
        bio: 'Expert squash coach with years of experience training professional players.',
        status: 'active',
      });
    }

    console.log('✓ Created 5 coaches');

    // ============ ORGANIZERS (Organisers) ============
    console.log('Creating organizers...');
    const organizers = await User.bulkCreate([
      {
        email: 'organizer.main@squash.com',
        password: hashedPassword,
        firstName: 'Main',
        lastName: 'Organizer',
        role: 'organiser',
        isActive: true,
      },
      {
        email: 'organizer.event@squash.com',
        password: hashedPassword,
        firstName: 'Event',
        lastName: 'Organizer',
        role: 'organiser',
        isActive: true,
      },
      {
        email: 'organizer.tournament@squash.com',
        password: hashedPassword,
        firstName: 'Tournament',
        lastName: 'Organizer',
        role: 'organiser',
        isActive: true,
      },
    ]);

    console.log('✓ Created 3 organizers');

    // ============ REGULATOR ============
    console.log('Creating regulators...');
    const regulators = await User.bulkCreate([
      {
        email: 'regulator.admin@squash.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Regulator',
        role: 'regulator',
        isActive: true,
      },
      {
        email: 'regulator.rules@squash.com',
        password: hashedPassword,
        firstName: 'Rules',
        lastName: 'Regulator',
        role: 'regulator',
        isActive: true,
      },
    ]);

    console.log('✓ Created 2 regulators');

    // ============ VENUES & COURTS ============
    console.log('Creating venues and courts...');
    const venues = await Venue.bulkCreate([
      {
        name: 'International Squash Complex',
        city: 'Cairo',
        country: 'Egypt',
        address: '123 Sports Ave, Cairo',
        numCourts: 8,
        contactPhone: '+20-123-456789',
      },
      {
        name: 'London Squash Academy',
        city: 'London',
        country: 'UK',
        address: '456 Court Lane, London',
        numCourts: 6,
        contactPhone: '+44-20-7946-0958',
      },
      {
        name: 'Dubai Squash Club',
        city: 'Dubai',
        country: 'UAE',
        address: '789 Elite Sports, Dubai',
        numCourts: 10,
        contactPhone: '+971-4-xxx-xxxx',
      },
    ]);

    // Create courts for venues
    for (const venue of venues) {
      for (let i = 1; i <= venue.numCourts; i++) {
        await Court.create({
          venueId: venue.id,
          courtNumber: i,
          courtName: `Court ${i}`,
          status: 'available',
        });
      }
    }

    console.log('✓ Created 3 venues with 24 courts');

    // ============ TOURNAMENTS ============
    console.log('Creating tournaments...');
    const tournaments = await Tournament.bulkCreate([
      {
        name: 'International Championship 2026',
        description: 'Premier international squash championship',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-15'),
        category: 'professional',
        status: 'upcoming',
        location: 'Cairo, Egypt',
        organizerId: organizers[0].id,
        maxParticipants: 32,
        registeredParticipants: 28,
      },
      {
        name: 'European Open 2026',
        description: 'Open squash tournament for European players',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-10'),
        category: 'amateur',
        status: 'upcoming',
        location: 'London, UK',
        organizerId: organizers[1].id,
        maxParticipants: 48,
        registeredParticipants: 35,
      },
      {
        name: 'Junior Championship',
        description: 'Youth squash championship for players under 21',
        startDate: new Date('2026-03-20'),
        endDate: new Date('2026-03-25'),
        category: 'junior',
        status: 'ongoing',
        location: 'Dubai, UAE',
        organizerId: organizers[2].id,
        maxParticipants: 24,
        registeredParticipants: 18,
      },
      {
        name: 'Masters Cup',
        description: 'Exclusive tournament for professional masters',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-06-08'),
        category: 'professional',
        status: 'upcoming',
        location: 'London, UK',
        organizerId: organizers[0].id,
        maxParticipants: 16,
        registeredParticipants: 14,
      },
      {
        name: 'Spring Open',
        description: 'Regional open squash tournament',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-10'),
        category: 'amateur',
        status: 'completed',
        location: 'Cairo, Egypt',
        organizerId: organizers[1].id,
        maxParticipants: 32,
        registeredParticipants: 30,
      },
    ]);

    console.log('✓ Created 5 tournaments');

    // ============ MATCHES ============
    console.log('Creating matches...');
    const matchRecords = [];
    const courts = await Court.findAll();

    for (let i = 0; i < 40; i++) {
      const player1 = playerProfiles[Math.floor(Math.random() * playerProfiles.length)];
      const player2 = playerProfiles[Math.floor(Math.random() * playerProfiles.length)];

      if (player1.id === player2.id) continue;

      const tournament = tournaments[Math.floor(Math.random() * tournaments.length)];
      const court = courts[Math.floor(Math.random() * courts.length)];

      const statuses = ['completed', 'scheduled', 'ongoing'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const match = await Match.create({
        tournamentId: tournament.id,
        player1Id: player1.id,
        player2Id: player2.id,
        status: status,
        scheduledTime: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        courtId: court.id,
        roundNumber: Math.floor(Math.random() * 4) + 1,
        score:
          status === 'completed'
            ? {
                sets: [
                  {
                    player1: Math.floor(Math.random() * 11) + 9,
                    player2: Math.floor(Math.random() * 11) + 9,
                  },
                  {
                    player1: Math.floor(Math.random() * 11) + 9,
                    player2: Math.floor(Math.random() * 11) + 9,
                  },
                  {
                    player1: Math.floor(Math.random() * 11) + 9,
                    player2: Math.floor(Math.random() * 11) + 9,
                  },
                ],
              }
            : null,
        winnerId: status === 'completed' ? (Math.random() > 0.5 ? player1.id : player2.id) : null,
      });

      matchRecords.push(match);
    }

    console.log('✓ Created 40 matches');

    // ============ RANKINGS ============
    console.log('Creating rankings...');

    for (const rank of ['world', 'regional', 'national']) {
      for (let i = 0; i < playerProfiles.length; i++) {
        await Ranking.create({
          playerId: playerProfiles[i].id,
          rank: i + 1,
          points: (playerProfiles.length - i) * 100,
          category: rank,
          lastUpdated: new Date(),
        });
      }
    }

    console.log('✓ Created rankings (world, regional, national)');

    // ============ PLAYER-COACH RELATIONSHIPS ============
    console.log('Creating player-coach relationships...');
    const coachProfiles = await Coach.findAll();

    for (let i = 0; i < playerProfiles.length; i++) {
      const coach = coachProfiles[i % coachProfiles.length];
      await PlayerCoach.create({
        playerId: playerProfiles[i].id,
        coachId: coach.id,
      });
    }

    console.log('✓ Created player-coach relationships');

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('🔐 Test Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Player: ali.khan@squash.com / Test@123');
    console.log('🏆 Organizer: organizer.main@squash.com / Test@123');
    console.log('⚖️  Regulator: regulator.admin@squash.com / Test@123');
    console.log('🎓 Coach: coach.ahmed@squash.com / Test@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
