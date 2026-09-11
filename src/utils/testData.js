export function createFinishedTestGame() {
  return {
    code: 'TELE-TEST',
    mode: 'ordenado',
    host: 'Beto',
    status: 'finished',
    started: true,
    currentHand: 7,
    dealerIndex: 1,

    players: [
      {
        id: 'player-beto',
        name: 'Beto',
        isHost: true,
        purchasesRemaining: 3,
        totalScore: 0,
        completedGames: [],
        penalties: [],
      },
      {
        id: 'player-mel',
        name: 'Mel',
        isHost: false,
        purchasesRemaining: 2,
        totalScore: 0,
        completedGames: [],
        penalties: [],
      },
      {
        id: 'player-luigi',
        name: 'Luigi',
        isHost: false,
        purchasesRemaining: 1,
        totalScore: 0,
        completedGames: [],
        penalties: [],
      },
      {
        id: 'player-ana',
        name: 'Ana',
        isHost: false,
        purchasesRemaining: 4,
        totalScore: 0,
        completedGames: [],
        penalties: [],
      },
      {
        id: 'player-carlos',
        name: 'Carlos',
        isHost: false,
        purchasesRemaining: 0,
        totalScore: 0,
        completedGames: [],
        penalties: [],
      },
    ],

    hands: createTestHands(),
  };
}

function createTestHands() {
  const scores = [
    [20, 30, 0, 40, 50],
    [25, 35, 0, 45, 55],
    [30, 40, 0, 50, 60],
    [15, 25, 0, 35, 45],
    [20, 30, 0, 40, 50],
    [25, 35, 0, 45, 55],
    [30, 40, 0, 50, 60],
  ];

  const gameCodes = [
    '1/3',
    '2/3',
    '1/4',
    '2/4',
    '1/5',
    '2/5',
    'ESC',
  ];

  const playerIds = [
    'player-beto',
    'player-mel',
    'player-luigi',
    'player-ana',
    'player-carlos',
  ];

  return scores.map((handScores, index) => ({
    number: index + 1,
    dealerIndex: index % playerIds.length,
    endReason: 'player_out',

    results: playerIds.map(
      (playerId, playerIndex) => ({
        playerId,
        completedGameCode: gameCodes[index],
        points: handScores[playerIndex],
        purchasesUsed: 0,
      })
    ),
  }));
}