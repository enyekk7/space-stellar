// Simple REST API untuk multiplayer peer-to-peer
// Menghindari kompleksitas WebSocket

import express from 'express';
const router = express.Router();

// Store player data in-memory
const playerData = new Map(); // roomCode -> { [address]: { x, y, health, bullets, shipImage, shipRarity, timestamp } }

// Update player data (position, health, bullets, ship, score, coins)
router.post('/update-player', (req, res) => {
  const { roomCode, address, x, y, health, bullets, shipImage, shipRarity, score, coins } = req.body;
  
  if (!roomCode || !address) {
    return res.status(400).json({ success: false, message: 'Missing roomCode or address' });
  }
  
  if (!playerData.has(roomCode)) {
    playerData.set(roomCode, {});
  }
  
  const roomPlayers = playerData.get(roomCode);
  if (!roomPlayers[address]) {
    roomPlayers[address] = {};
  }
  
  // Update only provided fields
  if (x !== undefined && y !== undefined) {
    roomPlayers[address].x = x;
    roomPlayers[address].y = y;
  }
  if (health !== undefined) {
    roomPlayers[address].health = health;
  }
  if (bullets !== undefined) {
    roomPlayers[address].bullets = bullets;
  }
  if (shipImage !== undefined) {
    roomPlayers[address].shipImage = shipImage;
  }
  if (shipRarity !== undefined) {
    roomPlayers[address].shipRarity = shipRarity;
  }
  if (score !== undefined) {
    roomPlayers[address].score = score;
  }
  if (coins !== undefined) {
    roomPlayers[address].coins = coins;
  }
  roomPlayers[address].timestamp = Date.now();
  
  res.json({ success: true });
});

// Get other players' data (positions, health, bullets, ship)
router.get('/get-players/:roomCode/:address', (req, res) => {
  const { roomCode, address } = req.params;
  
  if (!playerData.has(roomCode)) {
    return res.json({ success: true, players: [] });
  }
  
  const roomPlayers = playerData.get(roomCode);
  const otherPlayers = Object.entries(roomPlayers)
    .filter(([playerAddress]) => playerAddress !== address)
    .map(([playerAddress, data]) => ({
      address: playerAddress,
      x: data.x,
      y: data.y,
      health: data.health,
      bullets: data.bullets || [],
      shipImage: data.shipImage,
      shipRarity: data.shipRarity,
      score: data.score,
      coins: data.coins,
      timestamp: data.timestamp
    }));
  
  res.json({ success: true, players: otherPlayers });
});

// Legacy endpoint for backward compatibility
router.post('/update-position', (req, res) => {
  const { roomCode, address, x, y } = req.body;
  
  if (!roomCode || !address || x === undefined || y === undefined) {
    return res.status(400).json({ success: false, message: 'Missing parameters' });
  }
  
  if (!playerData.has(roomCode)) {
    playerData.set(roomCode, {});
  }
  
  const roomPlayers = playerData.get(roomCode);
  if (!roomPlayers[address]) {
    roomPlayers[address] = {};
  }
  
  roomPlayers[address].x = x;
  roomPlayers[address].y = y;
  roomPlayers[address].timestamp = Date.now();
  
  res.json({ success: true });
});

// Legacy endpoint for backward compatibility
router.get('/get-positions/:roomCode/:address', (req, res) => {
  const { roomCode, address } = req.params;
  
  if (!playerData.has(roomCode)) {
    return res.json({ success: true, players: [] });
  }
  
  const roomPlayers = playerData.get(roomCode);
  const otherPlayers = Object.entries(roomPlayers)
    .filter(([playerAddress]) => playerAddress !== address)
    .map(([playerAddress, data]) => ({
      address: playerAddress,
      x: data.x,
      y: data.y,
      timestamp: data.timestamp
    }));
  
  res.json({ success: true, players: otherPlayers });
});

// Clean up old data (called by cron or manually)
router.post('/cleanup', (req, res) => {
  const now = Date.now();
  const timeout = 60000; // 1 minute
  
  for (const [roomCode, players] of playerData.entries()) {
    for (const [address, data] of Object.entries(players)) {
      if (now - (data.timestamp || 0) > timeout) {
        delete players[address];
      }
    }
    
    if (Object.keys(players).length === 0) {
      playerData.delete(roomCode);
    }
  }
  
  res.json({ success: true, message: 'Cleanup completed' });
});

export default router;

