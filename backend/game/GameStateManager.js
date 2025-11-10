// Simple Game State Manager - Peer-to-Peer Multiplayer
// Server hanya relay messages, tidak calculate game logic

class GameStateManager {
  constructor() {
    this.games = new Map(); // roomCode -> basic info
  }

  // Initialize game (simplified - no game loop)
  initGame(roomCode, players) {
    const gameState = {
      roomCode,
      players: players.map(p => p.address),
      started: true,
      createdAt: Date.now()
    };
    
    this.games.set(roomCode, gameState);
    console.log(`✅ Game registered for room ${roomCode} with ${players.length} players`);
    return gameState;
  }

  // Get game state
  getGameState(roomCode) {
    return this.games.get(roomCode);
  }

  // Remove game
  removeGame(roomCode) {
    this.games.delete(roomCode);
    console.log(`✅ Game removed for room ${roomCode}`);
  }

  // Dummy methods for compatibility
  updatePlayerInput(roomCode, address, input) {
    return true; // Always return true
  }

  startGameLoop(roomCode, io) {
    console.log(`✅ Game started for room ${roomCode} (peer-to-peer mode)`);
  }

  stopGameLoop(roomCode) {
    console.log(`✅ Game stopped for room ${roomCode}`);
  }
}

export default new GameStateManager();



