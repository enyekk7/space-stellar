// Mission tracking utility
export interface Mission {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'special' | 'challenge'
  target: number
  current: number
  reward: {
    type: 'points' | 'coins'
    amount: number
  }
  claimed: boolean
  completed: boolean
}

const MISSION_STORAGE_KEY = 'missions_data'
const MISSION_CLAIMS_KEY = 'missions_claimed'

// Get mission progress from localStorage
export const getMissionProgress = (address: string): Record<string, number> => {
  const key = `mission_progress_${address}`
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : {}
}

// Update mission progress
export const updateMissionProgress = (address: string, missionId: string, value: number) => {
  const key = `mission_progress_${address}`
  const progress = getMissionProgress(address)
  progress[missionId] = value
  localStorage.setItem(key, JSON.stringify(progress))
}

// Get claimed missions
export const getClaimedMissions = (address: string): string[] => {
  const key = `${MISSION_CLAIMS_KEY}_${address}`
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : []
}

// Mark mission as claimed
export const claimMission = (address: string, missionId: string) => {
  const key = `${MISSION_CLAIMS_KEY}_${address}`
  const claimed = getClaimedMissions(address)
  if (!claimed.includes(missionId)) {
    claimed.push(missionId)
    localStorage.setItem(key, JSON.stringify(claimed))
  }
}

// Get match statistics from localStorage
export const getMatchStats = (address: string) => {
  const today = new Date().toDateString()
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toDateString()

  const statsKey = `match_stats_${address}`
  const stored = localStorage.getItem(statsKey)
  const stats = stored ? JSON.parse(stored) : {
    totalMatches: 0,
    totalWins: 0,
    multiplayerMatches: 0,
    todayMatches: 0,
    weekMatches: 0,
    totalCoins: 0,
    lastUpdate: null
  }

  return stats
}

// Update match statistics
export const updateMatchStats = (address: string, data: {
  isMultiplayer?: boolean
  isWin?: boolean
  coins?: number
}) => {
  const today = new Date().toDateString()
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toDateString()

  const statsKey = `match_stats_${address}`
  const stats = getMatchStats(address)

  stats.totalMatches += 1
  if (data.isWin) stats.totalWins += 1
  if (data.isMultiplayer) stats.multiplayerMatches += 1
  if (data.coins) stats.totalCoins += (data.coins || 0)

  // Check if today's date changed
  const lastUpdate = stats.lastUpdate ? new Date(stats.lastUpdate).toDateString() : null
  if (lastUpdate !== today) {
    stats.todayMatches = 0
  }
  stats.todayMatches += 1

  // Check if week changed
  const lastWeek = stats.lastWeekStart || weekStartStr
  if (lastWeek !== weekStartStr) {
    stats.weekMatches = 0
    stats.lastWeekStart = weekStartStr
  }
  stats.weekMatches += 1

  stats.lastUpdate = new Date().toISOString()
  localStorage.setItem(statsKey, JSON.stringify(stats))
}

// Initialize missions
export const initializeMissions = (address: string): Mission[] => {
  const stats = getMatchStats(address)
  const progress = getMissionProgress(address)
  const claimed = getClaimedMissions(address)

  // Use stats directly, not progress (progress is for manual tracking if needed)
  const dailyMatches = stats.todayMatches || 0
  const weeklyWins = stats.totalWins || 0
  const multiplayerMatches = stats.multiplayerMatches || 0
  const totalMatches = stats.totalMatches || 0

  const missions: Mission[] = [
    {
      id: 'daily_10_matches',
      title: 'Daily Challenge',
      description: 'Complete 10 matches today to earn bonus rewards.',
      type: 'daily',
      target: 10,
      current: dailyMatches,
      reward: { type: 'points', amount: 100 },
      claimed: claimed.includes('daily_10_matches'),
      completed: dailyMatches >= 10
    },
    {
      id: 'weekly_20_wins',
      title: 'Weekly Quest',
      description: 'Win 20 matches this week to unlock special rewards.',
      type: 'weekly',
      target: 20,
      current: weeklyWins,
      reward: { type: 'points', amount: 500 },
      claimed: claimed.includes('weekly_20_wins'),
      completed: weeklyWins >= 20
    },
    {
      id: 'multiplayer_20_matches',
      title: 'Multiplayer Master',
      description: 'Play 20 multiplayer matches to earn special rewards.',
      type: 'special',
      target: 20,
      current: multiplayerMatches,
      reward: { type: 'coins', amount: 50 },
      claimed: claimed.includes('multiplayer_20_matches'),
      completed: multiplayerMatches >= 20
    },
    {
      id: 'total_50_matches',
      title: 'Veteran Player',
      description: 'Complete 50 total matches to prove your dedication.',
      type: 'challenge',
      target: 50,
      current: totalMatches,
      reward: { type: 'points', amount: 250 },
      claimed: claimed.includes('total_50_matches'),
      completed: totalMatches >= 50
    }
  ]

  return missions
}

