/**
 * CareerModeSystem.ts
 * Comprehensive career mode with season management, team building, and progression
 */

export interface PlayerStats {
  // Batting stats
  gamesPlayed: number;
  atBats: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbis: number;
  walks: number;
  strikeouts: number;
  stolenBases: number;
  caughtStealing: number;

  // Pitching stats
  wins: number;
  losses: number;
  saves: number;
  inningsPitched: number;
  earnedRuns: number;
  strikeoutsPitched: number;
  walksAllowed: number;
  hitsAllowed: number;

  // Fielding stats
  putouts: number;
  assists: number;
  errors: number;

  // Advanced stats (calculated)
  battingAverage: number;
  onBasePercentage: number;
  sluggingPercentage: number;
  ops: number;
  era: number;
  whip: number;
  fieldingPercentage: number;
}

export interface PlayerProfile {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  age: number;
  position: 'P' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF' | 'DH';
  number: number;

  // Physical attributes
  height: number; // inches
  weight: number; // pounds
  bats: 'L' | 'R' | 'S'; // Switch
  throws: 'L' | 'R';

  // Ratings (1-100)
  contact: number;
  power: number;
  speed: number;
  fielding: number;
  arm: number;
  pitchVelocity?: number;
  pitchControl?: number;
  pitchMovement?: number;

  // Potential and development
  potential: number; // 1-100
  developmentCurve: 'early' | 'normal' | 'late';
  peakAge: number;

  // Contract and salary
  salary: number;
  contractYears: number;
  isFreeAgent: boolean;

  // Personality and morale
  personality: 'leader' | 'grinder' | 'hothead' | 'professional' | 'playful';
  morale: number; // 0-100
  chemistry: number; // 0-100
  clutch: number; // 0-100

  // Career stats
  careerStats: PlayerStats;
  seasonStats: PlayerStats;

  // Injury status
  isInjured: boolean;
  injuryType?: string;
  injuryDaysRemaining: number;

  // Special abilities
  abilities: PlayerAbility[];
}

export interface PlayerAbility {
  id: string;
  name: string;
  description: string;
  type: 'batting' | 'pitching' | 'fielding' | 'baserunning';
  effect: {
    stat: string;
    modifier: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Team {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  division: 'East' | 'West' | 'Central';
  league: 'American' | 'National';

  // Team colors and branding
  primaryColor: string;
  secondaryColor: string;
  logo: string;

  // Roster
  players: PlayerProfile[];
  roster25Man: string[]; // Player IDs
  activeLineup: string[]; // 9 players
  rotationPitchers: string[]; // 5 starters
  bullpen: string[]; // Relief pitchers

  // Team stats
  wins: number;
  losses: number;
  runsScored: number;
  runsAllowed: number;

  // Team ratings
  overallRating: number;
  offenseRating: number;
  defenseRating: number;
  pitchingRating: number;

  // Financial
  payroll: number;
  budget: number;
  marketSize: 'small' | 'medium' | 'large';

  // Stadium
  stadium: Stadium;

  // Team chemistry and morale
  teamChemistry: number;
  teamMorale: number;
  managerRating: number;
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  capacity: number;
  yearBuilt: number;
  surface: 'grass' | 'turf';

  // Field dimensions
  leftField: number;
  leftCenter: number;
  centerField: number;
  rightCenter: number;
  rightField: number;

  // Park factors (100 = neutral)
  homeRunFactor: number;
  hitsFactor: number;

  // Environmental
  elevation: number; // feet above sea level
  climate: 'warm' | 'moderate' | 'cold';
  roofType: 'outdoor' | 'dome' | 'retractable';
}

export interface SeasonSchedule {
  seasonYear: number;
  games: ScheduledGame[];
  allStarBreak: number; // Game number
  playoffStart: number;
  worldSeriesStart: number;
}

export interface ScheduledGame {
  gameNumber: number;
  date: Date;
  homeTeam: string;
  awayTeam: string;
  isPlayed: boolean;
  homeScore?: number;
  awayScore?: number;
  winnerId?: string;
}

export interface CareerSaveData {
  playerName: string;
  managerName: string;
  currentTeam: string;
  currentSeason: number;
  currentDay: number;

  // Career achievements
  championships: number;
  playoffAppearances: number;
  awardsWon: Award[];

  // Career stats
  careerWins: number;
  careerLosses: number;
  careerPlayoffWins: number;

  // Progression
  managerLevel: number;
  managerXP: number;
  unlockedFeatures: string[];

  // Teams and players
  teams: Team[];
  freeAgents: PlayerProfile[];

  // Current season
  currentSchedule: SeasonSchedule;
  standings: TeamStanding[];

  // Settings
  difficulty: 'rookie' | 'veteran' | 'all-star' | 'hall-of-fame';
  simulationSpeed: 'slow' | 'normal' | 'fast';
  autoSave: boolean;
}

export interface Award {
  id: string;
  name: string;
  season: number;
  type: 'mvp' | 'cy-young' | 'rookie' | 'gold-glove' | 'silver-slugger' | 'manager';
  recipient: string; // Player or manager ID
}

export interface TeamStanding {
  teamId: string;
  wins: number;
  losses: number;
  winningPercentage: number;
  gamesBack: number;
  streak: string; // e.g., "W5", "L2"
  lastTen: string; // e.g., "7-3"
  homeRecord: string;
  awayRecord: string;
  divisionRecord: string;
}

export class CareerModeSystem {
  private saveData: CareerSaveData;
  private readonly MAX_ROSTER_SIZE = 40;
  private readonly ACTIVE_ROSTER_SIZE = 25;
  private readonly GAMES_PER_SEASON = 162;
  private readonly SALARY_CAP = 200_000_000;

  constructor(saveData?: CareerSaveData) {
    if (saveData) {
      this.saveData = saveData;
    } else {
      this.saveData = this.initializeNewCareer();
    }
  }

  /**
   * Initialize a new career mode save
   */
  private initializeNewCareer(): CareerSaveData {
    const teams = this.generateDefaultTeams();
    const schedule = this.generateSeasonSchedule(2025, teams);

    return {
      playerName: 'Player',
      managerName: 'Manager',
      currentTeam: teams[0].id,
      currentSeason: 2025,
      currentDay: 1,
      championships: 0,
      playoffAppearances: 0,
      awardsWon: [],
      careerWins: 0,
      careerLosses: 0,
      careerPlayoffWins: 0,
      managerLevel: 1,
      managerXP: 0,
      unlockedFeatures: ['basic_trading', 'lineup_management'],
      teams: teams,
      freeAgents: [],
      currentSchedule: schedule,
      standings: this.initializeStandings(teams),
      difficulty: 'veteran',
      simulationSpeed: 'normal',
      autoSave: true
    };
  }

  /**
   * Generate default teams
   */
  private generateDefaultTeams(): Team[] {
    const teamNames = [
      { name: 'Sluggers', city: 'Sandlot', abbr: 'SND', division: 'East' as const, league: 'National' as const },
      { name: 'Thunder', city: 'Storm', abbr: 'STM', division: 'East' as const, league: 'National' as const },
      { name: 'Eagles', city: 'Sky', abbr: 'SKY', division: 'East' as const, league: 'National' as const },
      { name: 'Titans', city: 'Mountain', abbr: 'MTN', division: 'West' as const, league: 'National' as const },
      { name: 'Waves', city: 'Ocean', abbr: 'OCN', division: 'West' as const, league: 'National' as const },
      { name: 'Flames', city: 'Desert', abbr: 'DST', division: 'West' as const, league: 'National' as const },
      { name: 'Knights', city: 'Castle', abbr: 'CST', division: 'Central' as const, league: 'American' as const },
      { name: 'Dragons', city: 'Valley', abbr: 'VLY', division: 'Central' as const, league: 'American' as const },
      { name: 'Panthers', city: 'Forest', abbr: 'FOR', division: 'Central' as const, league: 'American' as const },
      { name: 'Comets', city: 'Space', abbr: 'SPC', division: 'East' as const, league: 'American' as const },
      { name: 'Sharks', city: 'Bay', abbr: 'BAY', division: 'East' as const, league: 'American' as const },
      { name: 'Phoenix', city: 'Fire', abbr: 'FIR', division: 'West' as const, league: 'American' as const }
    ];

    return teamNames.map((team, index) => this.createTeam(
      `team_${index}`,
      team.name,
      team.city,
      team.abbr,
      team.division,
      team.league
    ));
  }

  /**
   * Create a team with generated players
   */
  private createTeam(
    id: string,
    name: string,
    city: string,
    abbr: string,
    division: 'East' | 'West' | 'Central',
    league: 'American' | 'National'
  ): Team {
    const players = this.generateTeamRoster();
    const stadium = this.generateStadium(city);

    return {
      id,
      name,
      city,
      abbreviation: abbr,
      division,
      league,
      primaryColor: this.getRandomColor(),
      secondaryColor: this.getRandomColor(),
      logo: `logo_${abbr.toLowerCase()}`,
      players,
      roster25Man: players.slice(0, 25).map(p => p.id),
      activeLineup: players.slice(0, 9).map(p => p.id),
      rotationPitchers: players.filter(p => p.position === 'P').slice(0, 5).map(p => p.id),
      bullpen: players.filter(p => p.position === 'P').slice(5, 12).map(p => p.id),
      wins: 0,
      losses: 0,
      runsScored: 0,
      runsAllowed: 0,
      overallRating: this.calculateTeamRating(players),
      offenseRating: this.calculateOffenseRating(players),
      defenseRating: this.calculateDefenseRating(players),
      pitchingRating: this.calculatePitchingRating(players),
      payroll: players.reduce((sum, p) => sum + p.salary, 0),
      budget: 150_000_000,
      marketSize: 'medium',
      stadium,
      teamChemistry: 70 + Math.random() * 20,
      teamMorale: 70 + Math.random() * 20,
      managerRating: 70 + Math.random() * 20
    };
  }

  /**
   * Generate a full team roster
   */
  private generateTeamRoster(): PlayerProfile[] {
    const positions: Array<'P' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF'> = [
      'P', 'P', 'P', 'P', 'P', // 5 starters
      'P', 'P', 'P', 'P', 'P', 'P', 'P', // 7 relievers
      'C', 'C', // 2 catchers
      '1B', '2B', '3B', 'SS', // Infield
      'LF', 'CF', 'RF', // Outfield
      '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF' // Bench players
    ];

    return positions.map((position, index) => this.generatePlayer(position, index));
  }

  /**
   * Generate a random player
   */
  private generatePlayer(position: string, jerseyNumber: number): PlayerProfile {
    const firstName = this.getRandomFirstName();
    const lastName = this.getRandomLastName();
    const age = 21 + Math.floor(Math.random() * 15); // 21-35 years old

    const isPitcher = position === 'P';
    const baseRating = 50 + Math.random() * 40; // 50-90 base rating

    const stats: PlayerStats = {
      gamesPlayed: 0,
      atBats: 0,
      hits: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      rbis: 0,
      walks: 0,
      strikeouts: 0,
      stolenBases: 0,
      caughtStealing: 0,
      wins: 0,
      losses: 0,
      saves: 0,
      inningsPitched: 0,
      earnedRuns: 0,
      strikeoutsPitched: 0,
      walksAllowed: 0,
      hitsAllowed: 0,
      putouts: 0,
      assists: 0,
      errors: 0,
      battingAverage: 0,
      onBasePercentage: 0,
      sluggingPercentage: 0,
      ops: 0,
      era: 0,
      whip: 0,
      fieldingPercentage: 1.000
    };

    return {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName,
      lastName,
      age,
      position: position as any,
      number: jerseyNumber + 1,
      height: 68 + Math.floor(Math.random() * 12), // 68-79 inches
      weight: 170 + Math.floor(Math.random() * 60), // 170-229 lbs
      bats: Math.random() > 0.5 ? 'R' : 'L',
      throws: Math.random() > 0.5 ? 'R' : 'L',
      contact: baseRating + (Math.random() * 20 - 10),
      power: baseRating + (Math.random() * 20 - 10),
      speed: baseRating + (Math.random() * 20 - 10),
      fielding: baseRating + (Math.random() * 20 - 10),
      arm: baseRating + (Math.random() * 20 - 10),
      pitchVelocity: isPitcher ? baseRating + (Math.random() * 20 - 10) : undefined,
      pitchControl: isPitcher ? baseRating + (Math.random() * 20 - 10) : undefined,
      pitchMovement: isPitcher ? baseRating + (Math.random() * 20 - 10) : undefined,
      potential: 60 + Math.random() * 30,
      developmentCurve: this.getRandomDevelopmentCurve(),
      peakAge: 27 + Math.floor(Math.random() * 4),
      salary: this.calculateSalary(baseRating, age),
      contractYears: 1 + Math.floor(Math.random() * 4),
      isFreeAgent: false,
      personality: this.getRandomPersonality(),
      morale: 70 + Math.random() * 20,
      chemistry: 70 + Math.random() * 20,
      clutch: 50 + Math.random() * 40,
      careerStats: { ...stats },
      seasonStats: { ...stats },
      isInjured: false,
      injuryDaysRemaining: 0,
      abilities: this.generatePlayerAbilities(baseRating)
    };
  }

  /**
   * Generate stadium for a city
   */
  private generateStadium(city: string): Stadium {
    return {
      id: `stadium_${city.toLowerCase()}`,
      name: `${city} Field`,
      city,
      capacity: 35000 + Math.floor(Math.random() * 20000),
      yearBuilt: 1990 + Math.floor(Math.random() * 30),
      surface: Math.random() > 0.8 ? 'turf' : 'grass',
      leftField: 325 + Math.floor(Math.random() * 15),
      leftCenter: 370 + Math.floor(Math.random() * 20),
      centerField: 395 + Math.floor(Math.random() * 15),
      rightCenter: 370 + Math.floor(Math.random() * 20),
      rightField: 325 + Math.floor(Math.random() * 15),
      homeRunFactor: 90 + Math.floor(Math.random() * 20),
      hitsFactor: 95 + Math.floor(Math.random() * 10),
      elevation: Math.floor(Math.random() * 5000),
      climate: this.getRandomClimate(),
      roofType: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'dome' : 'retractable') : 'outdoor'
    };
  }

  /**
   * Generate season schedule
   */
  private generateSeasonSchedule(year: number, teams: Team[]): SeasonSchedule {
    const games: ScheduledGame[] = [];
    let gameNumber = 1;
    const startDate = new Date(year, 3, 1); // April 1st

    // Generate 162 games for each team
    for (let i = 0; i < this.GAMES_PER_SEASON / 2; i++) {
      // Randomly pair teams
      const shuffled = [...teams].sort(() => Math.random() - 0.5);

      for (let j = 0; j < shuffled.length; j += 2) {
        if (j + 1 < shuffled.length) {
          const gameDate = new Date(startDate);
          gameDate.setDate(startDate.getDate() + Math.floor(i * 1.5));

          games.push({
            gameNumber: gameNumber++,
            date: gameDate,
            homeTeam: shuffled[j].id,
            awayTeam: shuffled[j + 1].id,
            isPlayed: false
          });
        }
      }
    }

    return {
      seasonYear: year,
      games: games.sort((a, b) => a.date.getTime() - b.date.getTime()),
      allStarBreak: 81,
      playoffStart: 163,
      worldSeriesStart: 170
    };
  }

  /**
   * Initialize standings
   */
  private initializeStandings(teams: Team[]): TeamStanding[] {
    return teams.map(team => ({
      teamId: team.id,
      wins: 0,
      losses: 0,
      winningPercentage: 0,
      gamesBack: 0,
      streak: '-',
      lastTen: '0-0',
      homeRecord: '0-0',
      awayRecord: '0-0',
      divisionRecord: '0-0'
    }));
  }

  /**
   * Simulate a game
   */
  public simulateGame(game: ScheduledGame): void {
    const homeTeam = this.getTeamById(game.homeTeam);
    const awayTeam = this.getTeamById(game.awayTeam);

    if (!homeTeam || !awayTeam) return;

    // Calculate win probability based on team ratings
    const homeAdvantage = 1.1; // 10% home field advantage
    const homeStrength = homeTeam.overallRating * homeAdvantage;
    const awayStrength = awayTeam.overallRating;
    const homeWinProb = homeStrength / (homeStrength + awayStrength);

    // Simulate result
    const homeWins = Math.random() < homeWinProb;

    // Generate realistic score
    const winnerScore = 3 + Math.floor(Math.random() * 5); // 3-7 runs
    const loserScore = Math.floor(Math.random() * winnerScore); // 0 to winner-1

    game.isPlayed = true;
    if (homeWins) {
      game.homeScore = winnerScore;
      game.awayScore = loserScore;
      game.winnerId = homeTeam.id;
      homeTeam.wins++;
      awayTeam.losses++;
    } else {
      game.homeScore = loserScore;
      game.awayScore = winnerScore;
      game.winnerId = awayTeam.id;
      awayTeam.wins++;
      homeTeam.losses++;
    }

    homeTeam.runsScored += game.homeScore;
    homeTeam.runsAllowed += game.awayScore;
    awayTeam.runsScored += game.awayScore;
    awayTeam.runsAllowed += game.homeScore;

    this.updateStandings();
  }

  /**
   * Update standings after games
   */
  private updateStandings(): void {
    this.saveData.standings.forEach(standing => {
      const team = this.getTeamById(standing.teamId);
      if (team) {
        standing.wins = team.wins;
        standing.losses = team.losses;
        standing.winningPercentage = team.wins / (team.wins + team.losses);
      }
    });

    // Calculate games back
    const sortedStandings = [...this.saveData.standings].sort((a, b) =>
      b.winningPercentage - a.winningPercentage
    );

    if (sortedStandings.length > 0) {
      const leader = sortedStandings[0];
      sortedStandings.forEach(standing => {
        standing.gamesBack = ((leader.wins - standing.wins) - (leader.losses - standing.losses)) / 2;
      });
    }
  }

  /**
   * Advance to next day
   */
  public advanceDay(): void {
    this.saveData.currentDay++;

    // Check for scheduled games
    const todaysGames = this.saveData.currentSchedule.games.filter(game =>
      !game.isPlayed && game.gameNumber === this.saveData.currentDay
    );

    // Simulate today's games
    todaysGames.forEach(game => this.simulateGame(game));

    // Update player stats and development
    this.updatePlayerDevelopment();

    // Check for season end
    if (this.saveData.currentDay > this.GAMES_PER_SEASON) {
      this.endSeason();
    }
  }

  /**
   * Update player development
   */
  private updatePlayerDevelopment(): void {
    this.saveData.teams.forEach(team => {
      team.players.forEach(player => {
        // Age-based development
        if (player.age < player.peakAge) {
          // Developing player
          const growthRate = (player.potential - this.getPlayerOverall(player)) / 100;
          this.improvePlayer(player, growthRate * 0.01);
        } else if (player.age > player.peakAge + 3) {
          // Declining player
          this.degradePlayer(player, 0.005);
        }

        // Injury recovery
        if (player.isInjured && player.injuryDaysRemaining > 0) {
          player.injuryDaysRemaining--;
          if (player.injuryDaysRemaining === 0) {
            player.isInjured = false;
            player.injuryType = undefined;
          }
        }
      });
    });
  }

  /**
   * End the season and handle offseason
   */
  private endSeason(): void {
    // Award championships
    const champion = this.determineChampion();
    if (champion && champion.id === this.saveData.currentTeam) {
      this.saveData.championships++;
    }

    // Process free agency
    this.processFreeAgency();

    // Age all players
    this.ageAllPlayers();

    // Start new season
    this.saveData.currentSeason++;
    this.saveData.currentDay = 1;
    this.saveData.currentSchedule = this.generateSeasonSchedule(
      this.saveData.currentSeason,
      this.saveData.teams
    );

    // Reset team records
    this.saveData.teams.forEach(team => {
      team.wins = 0;
      team.losses = 0;
      team.runsScored = 0;
      team.runsAllowed = 0;
    });

    this.initializeStandings(this.saveData.teams);
  }

  /**
   * Process free agency
   */
  private processFreeAgency(): void {
    this.saveData.teams.forEach(team => {
      team.players = team.players.filter(player => {
        player.contractYears--;
        if (player.contractYears <= 0 && !player.isFreeAgent) {
          player.isFreeAgent = true;
          this.saveData.freeAgents.push(player);
          return false;
        }
        return true;
      });
    });
  }

  /**
   * Age all players
   */
  private ageAllPlayers(): void {
    [...this.saveData.teams.flatMap(t => t.players), ...this.saveData.freeAgents].forEach(player => {
      player.age++;

      // Check for retirement
      if (player.age > 40 || (player.age > 35 && this.getPlayerOverall(player) < 50)) {
        // Player retires
        player.contractYears = 0;
      }
    });
  }

  /**
   * Helper methods
   */
  private getTeamById(id: string): Team | undefined {
    return this.saveData.teams.find(t => t.id === id);
  }

  private getPlayerOverall(player: PlayerProfile): number {
    if (player.position === 'P') {
      return (
        (player.pitchVelocity || 0) * 0.4 +
        (player.pitchControl || 0) * 0.4 +
        (player.pitchMovement || 0) * 0.2
      );
    }
    return (
      player.contact * 0.3 +
      player.power * 0.25 +
      player.speed * 0.15 +
      player.fielding * 0.2 +
      player.arm * 0.1
    );
  }

  private improvePlayer(player: PlayerProfile, amount: number): void {
    player.contact = Math.min(99, player.contact + amount);
    player.power = Math.min(99, player.power + amount);
    player.fielding = Math.min(99, player.fielding + amount);
  }

  private degradePlayer(player: PlayerProfile, amount: number): void {
    player.contact = Math.max(1, player.contact - amount);
    player.power = Math.max(1, player.power - amount);
    player.speed = Math.max(1, player.speed - amount);
  }

  private determineChampion(): Team | undefined {
    const sorted = [...this.saveData.teams].sort((a, b) =>
      (b.wins / (b.wins + b.losses)) - (a.wins / (a.wins + a.losses))
    );
    return sorted[0];
  }

  private calculateTeamRating(players: PlayerProfile[]): number {
    const avg = players.reduce((sum, p) => sum + this.getPlayerOverall(p), 0) / players.length;
    return Math.round(avg);
  }

  private calculateOffenseRating(players: PlayerProfile[]): number {
    const hitters = players.filter(p => p.position !== 'P');
    return Math.round(
      hitters.reduce((sum, p) => sum + (p.contact + p.power) / 2, 0) / hitters.length
    );
  }

  private calculateDefenseRating(players: PlayerProfile[]): number {
    return Math.round(
      players.reduce((sum, p) => sum + p.fielding, 0) / players.length
    );
  }

  private calculatePitchingRating(players: PlayerProfile[]): number {
    const pitchers = players.filter(p => p.position === 'P');
    return Math.round(
      pitchers.reduce((sum, p) => sum + ((p.pitchVelocity || 0) + (p.pitchControl || 0)) / 2, 0) / pitchers.length
    );
  }

  private calculateSalary(rating: number, age: number): number {
    const baseSalary = rating * 50000;
    const ageFactor = age < 27 ? 0.8 : age > 33 ? 0.6 : 1.0;
    return Math.round(baseSalary * ageFactor);
  }

  private getRandomFirstName(): string {
    const names = ['Mike', 'Jake', 'Tony', 'Derek', 'Alex', 'Ryan', 'Carlos', 'Juan', 'Miguel', 'David',
                   'Chris', 'Matt', 'Josh', 'Kevin', 'Brian', 'Jason', 'Brandon', 'Tyler', 'Justin', 'Aaron'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private getRandomLastName(): string {
    const names = ['Johnson', 'Smith', 'Williams', 'Rodriguez', 'Martinez', 'Garcia', 'Davis', 'Wilson',
                   'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
                   'Harris', 'Clark', 'Lewis'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private getRandomColor(): string {
    const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFA500', '#800080', '#FFD700', '#000000', '#FFFFFF'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getRandomDevelopmentCurve(): 'early' | 'normal' | 'late' {
    const rand = Math.random();
    if (rand < 0.2) return 'early';
    if (rand < 0.8) return 'normal';
    return 'late';
  }

  private getRandomPersonality(): 'leader' | 'grinder' | 'hothead' | 'professional' | 'playful' {
    const types: Array<'leader' | 'grinder' | 'hothead' | 'professional' | 'playful'> =
      ['leader', 'grinder', 'hothead', 'professional', 'playful'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomClimate(): 'warm' | 'moderate' | 'cold' {
    const types: Array<'warm' | 'moderate' | 'cold'> = ['warm', 'moderate', 'cold'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private generatePlayerAbilities(baseRating: number): PlayerAbility[] {
    const abilities: PlayerAbility[] = [];
    const numAbilities = baseRating > 80 ? 2 : baseRating > 70 ? 1 : 0;

    const availableAbilities: PlayerAbility[] = [
      {
        id: 'clutch_hitter',
        name: 'Clutch Hitter',
        description: '+15% batting in pressure situations',
        type: 'batting',
        effect: { stat: 'contact', modifier: 15 },
        rarity: 'rare'
      },
      {
        id: 'power_surge',
        name: 'Power Surge',
        description: '+20% home run chance',
        type: 'batting',
        effect: { stat: 'power', modifier: 20 },
        rarity: 'epic'
      },
      {
        id: 'speedster',
        name: 'Speedster',
        description: '+25% stolen base success',
        type: 'baserunning',
        effect: { stat: 'speed', modifier: 25 },
        rarity: 'rare'
      },
      {
        id: 'ace',
        name: 'Ace',
        description: '+10% strikeout rate',
        type: 'pitching',
        effect: { stat: 'pitchControl', modifier: 10 },
        rarity: 'legendary'
      },
      {
        id: 'gold_glove',
        name: 'Gold Glove',
        description: '+15% fielding range',
        type: 'fielding',
        effect: { stat: 'fielding', modifier: 15 },
        rarity: 'rare'
      }
    ];

    for (let i = 0; i < numAbilities; i++) {
      const ability = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
      if (!abilities.find(a => a.id === ability.id)) {
        abilities.push({ ...ability });
      }
    }

    return abilities;
  }

  /**
   * Public getters
   */
  public getSaveData(): CareerSaveData {
    return this.saveData;
  }

  public getCurrentTeam(): Team | undefined {
    return this.getTeamById(this.saveData.currentTeam);
  }

  public getStandings(): TeamStanding[] {
    return [...this.saveData.standings].sort((a, b) => b.winningPercentage - a.winningPercentage);
  }

  public getTodaysGames(): ScheduledGame[] {
    return this.saveData.currentSchedule.games.filter(
      g => g.gameNumber === this.saveData.currentDay
    );
  }
}
