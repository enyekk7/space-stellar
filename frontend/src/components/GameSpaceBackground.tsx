import { useEffect, useRef } from 'react'
import './GameSpaceBackground.css'

interface Star {
  x: number
  y: number
  radius: number
  speed: number
  opacity: number
  twinkle: number
  twinkleSpeed: number
  color: string // White or blue tint
  behavior: 'static' | 'twinkle' | 'moving' | 'pulse' // Variasi efek bintang
  pulsePhase: number // Untuk efek pulse
  pulseSpeed: number // Kecepatan pulse
  baseOpacity: number // Opacity dasar untuk efek variasi
}

interface ShootingStar {
  x: number
  y: number
  speed: number
  length: number
  opacity: number
  angle: number
  life: number
  color: string // Blue or white
}

const GameSpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize stars dengan warna biru dan putih
    const initStars = () => {
      const stars: Star[] = []
      const starCount = Math.floor((canvas.width * canvas.height) / 10000) // More stars for game

      for (let i = 0; i < starCount; i++) {
        // Random color: white (70%) or blue tint (30%)
        const isBlue = Math.random() < 0.3
        const color = isBlue 
          ? `rgba(${150 + Math.random() * 105}, ${180 + Math.random() * 75}, 255, 1)` // Blue tint
          : '#ffffff' // White
        
        // Random behavior: static (30%), twinkle (40%), moving (20%), pulse (10%)
        const behaviorRand = Math.random()
        let behavior: 'static' | 'twinkle' | 'moving' | 'pulse'
        if (behaviorRand < 0.3) {
          behavior = 'static' // Diam, tidak berkedip
        } else if (behaviorRand < 0.7) {
          behavior = 'twinkle' // Berkedip
        } else if (behaviorRand < 0.9) {
          behavior = 'moving' // Bergerak
        } else {
          behavior = 'pulse' // Berpulsa
        }
        
        const baseOpacity = Math.random() * 0.9 + 0.3
        
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2.5 + 0.2,
          speed: Math.random() * 0.4 + 0.05,
          opacity: baseOpacity,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.04 + 0.01,
          color,
          behavior,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          baseOpacity
        })
      }
      starsRef.current = stars
    }

    // Initialize shooting stars dengan warna biru dan putih
    const createShootingStar = () => {
      const angle = Math.random() * Math.PI * 0.6 + Math.PI * 0.2 // 36-96 degrees
      const x = Math.random() * canvas.width
      const y = -50

      // Random color: blue (60%) or white (40%)
      const isBlue = Math.random() < 0.6
      const color = isBlue 
        ? `rgba(${100 + Math.random() * 155}, ${150 + Math.random() * 105}, 255, 1)` // Bright blue
        : '#ffffff' // White

      shootingStarsRef.current.push({
        x,
        y,
        speed: Math.random() * 5 + 4, // Faster for game
        length: Math.random() * 120 + 80, // Longer trails
        opacity: Math.random() * 0.95 + 0.7, // Brighter
        angle,
        life: 1,
        color
      })
    }

    // Spawn shooting stars more frequently for game
    const shootingStarInterval = setInterval(() => {
      if (Math.random() > 0.5) { // 50% chance every interval
        createShootingStar()
      }
    }, 1800) // Spawn every 1.8 seconds for more action

    initStars()

    // Animation loop
    const animate = () => {
      // Clear with completely black background (sangat gelap)
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw stars dengan variasi efek
      starsRef.current.forEach((star) => {
        let finalOpacity = star.baseOpacity
        
        // Apply different behaviors
        if (star.behavior === 'static') {
          // Static: tidak berkedip, opacity tetap
          finalOpacity = star.baseOpacity
        } else if (star.behavior === 'twinkle') {
          // Twinkle: berkedip dengan sin wave
          star.twinkle += star.twinkleSpeed
          const twinkleOpacity = Math.sin(star.twinkle) * 0.4 + 0.6
          finalOpacity = star.baseOpacity * twinkleOpacity
        } else if (star.behavior === 'moving') {
          // Moving: berkedip sedikit sambil bergerak
          star.twinkle += star.twinkleSpeed * 0.5
          const twinkleOpacity = Math.sin(star.twinkle) * 0.2 + 0.8
          finalOpacity = star.baseOpacity * twinkleOpacity
        } else if (star.behavior === 'pulse') {
          // Pulse: efek berpulsa (expand/contract)
          star.pulsePhase += star.pulseSpeed
          const pulseOpacity = Math.sin(star.pulsePhase) * 0.3 + 0.7
          finalOpacity = star.baseOpacity * pulseOpacity
        }
        
        star.opacity = finalOpacity

        // Draw star dengan warna dan glow effect yang lebih keren
        // Ukuran glow bervariasi berdasarkan behavior
        ctx.save()
        ctx.globalAlpha = finalOpacity
        
        // Variasi glow intensity berdasarkan behavior
        let glowMultiplier = 1.0
        if (star.behavior === 'pulse') {
          // Pulse stars memiliki glow yang berubah-ubah
          glowMultiplier = Math.sin(star.pulsePhase) * 0.3 + 0.7
        } else if (star.behavior === 'twinkle') {
          // Twinkle stars memiliki glow yang lebih intens saat terang
          glowMultiplier = Math.sin(star.twinkle) * 0.2 + 0.8
        } else if (star.behavior === 'static') {
          // Static stars memiliki glow yang konsisten (lebih subtle)
          glowMultiplier = 0.7
        } else if (star.behavior === 'moving') {
          // Moving stars memiliki glow yang sedikit berubah
          glowMultiplier = Math.sin(star.twinkle) * 0.1 + 0.85
        }
        
        // Draw star dengan radius yang bervariasi untuk pulse
        let drawRadius = star.radius
        if (star.behavior === 'pulse') {
          // Pulse stars berubah ukuran
          drawRadius = star.radius * (Math.sin(star.pulsePhase) * 0.2 + 0.9)
        }
        
        // White stars dengan glow putih
        if (star.color === '#ffffff') {
          // Outer glow untuk white stars (lebih subtle untuk static)
          const glowOpacity = star.behavior === 'static' ? 0.3 : 0.5
          ctx.fillStyle = `rgba(255, 255, 255, ${glowOpacity * glowMultiplier})`
          ctx.shadowBlur = drawRadius * 5 * glowMultiplier
          ctx.shadowColor = '#ffffff'
          ctx.beginPath()
          ctx.arc(star.x, star.y, drawRadius + 0.8, 0, Math.PI * 2)
          ctx.fill()
          
          // Core star
          ctx.fillStyle = '#ffffff'
          ctx.shadowBlur = drawRadius * 3 * glowMultiplier
          ctx.shadowColor = '#ffffff'
        } else {
          // Blue stars dengan glow biru
          // Outer glow untuk blue stars
          const blueColor = star.color
          const glowOpacity = star.behavior === 'static' ? 0.3 : 0.5
          ctx.fillStyle = blueColor.replace('1)', `${glowOpacity * glowMultiplier})`)
          ctx.shadowBlur = drawRadius * 6 * glowMultiplier
          ctx.shadowColor = blueColor
          ctx.beginPath()
          ctx.arc(star.x, star.y, drawRadius + 1.2, 0, Math.PI * 2)
          ctx.fill()
          
          // Core star
          ctx.fillStyle = blueColor
          ctx.shadowBlur = drawRadius * 4 * glowMultiplier
          ctx.shadowColor = blueColor
        }
        
        ctx.beginPath()
        ctx.arc(star.x, star.y, drawRadius, 0, Math.PI * 2)
        ctx.fill()
        
        // Inner bright core untuk bintang besar (tidak untuk static kecil)
        if (drawRadius > 1.0 && star.behavior !== 'static') {
          ctx.fillStyle = '#ffffff'
          ctx.shadowBlur = drawRadius * 1.5
          ctx.beginPath()
          ctx.arc(star.x, star.y, drawRadius * 0.5, 0, Math.PI * 2)
          ctx.fill()
        }
        
        ctx.restore()

        // Move star berdasarkan behavior
        if (star.behavior === 'moving' && star.radius > 0.8) {
          // Moving stars bergerak lebih cepat
          star.y += star.speed * 0.3
          if (star.y > canvas.height) {
            star.y = 0
            star.x = Math.random() * canvas.width
          }
        } else if (star.radius > 1.2) {
          // Large stars (static/twinkle/pulse) bergerak sangat lambat (parallax subtle)
          star.y += star.speed * 0.05
          if (star.y > canvas.height) {
            star.y = 0
            star.x = Math.random() * canvas.width
          }
        }
        // Small static stars tidak bergerak sama sekali
      })

      // Update and draw shooting stars dengan warna biru dan putih
      shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
        star.life -= 0.015
        if (star.life <= 0) return false

        // Update position
        star.x += Math.cos(star.angle) * star.speed
        star.y += Math.sin(star.angle) * star.speed

        // Draw shooting star trail dengan gradient yang lebih keren
        ctx.save()
        ctx.globalAlpha = star.opacity * star.life
        
        // Create gradient for trail (dari tail ke head)
        const tailX = star.x - Math.cos(star.angle) * star.length
        const tailY = star.y - Math.sin(star.angle) * star.length
        const gradient = ctx.createLinearGradient(tailX, tailY, star.x, star.y)
        
        if (star.color === '#ffffff') {
          // White shooting star dengan glow putih
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
          gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)')
          gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.8)')
          gradient.addColorStop(1, 'rgba(255, 255, 255, 1)')
          ctx.strokeStyle = gradient
          ctx.shadowBlur = 15
          ctx.shadowColor = '#ffffff'
        } else {
          // Blue shooting star dengan glow biru yang lebih terang
          gradient.addColorStop(0, 'rgba(100, 150, 255, 0)')
          gradient.addColorStop(0.3, 'rgba(120, 180, 255, 0.5)')
          gradient.addColorStop(0.7, 'rgba(150, 200, 255, 0.9)')
          gradient.addColorStop(1, star.color)
          ctx.strokeStyle = gradient
          ctx.shadowBlur = 20
          ctx.shadowColor = star.color
        }
        
        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(star.x, star.y)
        ctx.stroke()

        // Draw head (bright point) dengan glow effect yang lebih terang
        if (star.color === '#ffffff') {
          // White core dengan glow putih terang
          ctx.fillStyle = '#ffffff'
          ctx.shadowBlur = 25
          ctx.shadowColor = '#ffffff'
        } else {
          // Blue core dengan glow biru terang
          ctx.fillStyle = star.color
          ctx.shadowBlur = 30
          ctx.shadowColor = star.color
        }
        
        // Outer glow
        ctx.beginPath()
        ctx.arc(star.x, star.y, 4, 0, Math.PI * 2)
        ctx.fill()
        
        // Middle bright ring
        ctx.fillStyle = star.color === '#ffffff' ? '#ffffff' : '#aaccff'
        ctx.shadowBlur = 15
        ctx.beginPath()
        ctx.arc(star.x, star.y, 2.5, 0, Math.PI * 2)
        ctx.fill()
        
        // Inner bright core (sangat terang)
        ctx.fillStyle = '#ffffff'
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(star.x, star.y, 1.5, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()

        return true
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      clearInterval(shootingStarInterval)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="game-space-background-wrapper">
      <canvas
        ref={canvasRef}
        className="game-space-background"
      />
    </div>
  )
}

export default GameSpaceBackground

