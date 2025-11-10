import { useEffect, useRef } from 'react'
import './SpaceBackground.css'

interface Star {
  x: number
  y: number
  radius: number
  speed: number
  opacity: number
  twinkle: number
  twinkleSpeed: number
}

interface ShootingStar {
  x: number
  y: number
  speed: number
  length: number
  opacity: number
  angle: number
  life: number
}

const SpaceBackground = () => {
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

    // Initialize stars
    const initStars = () => {
      const stars: Star[] = []
      const starCount = Math.floor((canvas.width * canvas.height) / 12000) // Increased density for more stars

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 0.3,
          speed: Math.random() * 0.3 + 0.05,
          opacity: Math.random() * 0.9 + 0.3,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.03 + 0.01
        })
      }
      starsRef.current = stars
    }

    // Initialize shooting stars
    const createShootingStar = () => {
      const angle = Math.random() * Math.PI * 0.5 + Math.PI * 0.25 // 45-135 degrees
      const x = Math.random() * canvas.width
      const y = -50

      shootingStarsRef.current.push({
        x,
        y,
        speed: Math.random() * 4 + 3, // Faster shooting stars
        length: Math.random() * 100 + 60, // Longer trails
        opacity: Math.random() * 0.9 + 0.6, // Brighter
        angle,
        life: 1
      })
    }

    // Spawn shooting stars periodically
    const shootingStarInterval = setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance every interval for more shooting stars
        createShootingStar()
      }
    }, 2500) // Spawn every 2.5 seconds

    initStars()

    // Animation loop
    const animate = () => {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const now = Date.now()

      // Update and draw stars
      starsRef.current.forEach((star) => {
        // Twinkle effect
        star.twinkle += star.twinkleSpeed
        const twinkleOpacity = Math.sin(star.twinkle) * 0.3 + 0.7
        const finalOpacity = star.opacity * twinkleOpacity

        // Draw star
        ctx.save()
        ctx.globalAlpha = finalOpacity
        ctx.fillStyle = '#ffffff'
        ctx.shadowBlur = star.radius * 3
        ctx.shadowColor = '#ffffff'
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // Move star slightly (parallax effect for larger stars)
        if (star.radius > 1) {
          star.y += star.speed * 0.1
          if (star.y > canvas.height) {
            star.y = 0
            star.x = Math.random() * canvas.width
          }
        }
      })

      // Update and draw shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
        star.life -= 0.02
        if (star.life <= 0) return false

        // Update position
        star.x += Math.cos(star.angle) * star.speed
        star.y += Math.sin(star.angle) * star.speed

        // Draw shooting star (trail)
        ctx.save()
        ctx.globalAlpha = star.opacity * star.life
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.shadowBlur = 10
        ctx.shadowColor = '#00ffff'
        ctx.beginPath()
        ctx.moveTo(star.x, star.y)
        ctx.lineTo(
          star.x - Math.cos(star.angle) * star.length,
          star.y - Math.sin(star.angle) * star.length
        )
        ctx.stroke()

        // Draw head (bright point)
        ctx.fillStyle = '#00ffff'
        ctx.shadowBlur = 15
        ctx.shadowColor = '#00ffff'
        ctx.beginPath()
        ctx.arc(star.x, star.y, 2, 0, Math.PI * 2)
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
    <div className="space-background-wrapper">
      <canvas
        ref={canvasRef}
        className="space-background"
      />
    </div>
  )
}

export default SpaceBackground

