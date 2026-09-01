import { useState, useEffect } from 'react'
import type React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

interface SplashScreenProps {
  onDismiss: () => void
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const fullText = 'Welcome to InkDabba'
  const [displayedText, setDisplayedText] = useState<string>('')
  const [isTypingDone, setIsTypingDone] = useState<boolean>(false)

  // Type-in effect next to her hand
  useEffect(() => {
    let index = 0
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (index <= fullText.length) {
          setDisplayedText(fullText.slice(0, index))
          index++
        } else {
          setIsTypingDone(true)
          clearInterval(interval)
        }
      }, 50)

      return () => clearInterval(interval)
    }, 450)

    return () => clearTimeout(startTimeout)
  }, [])

  // Auto-transition after ~2.4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, 2400)

    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onDismiss}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onDismiss()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#F7F5F1] text-[#1A1A1A] overflow-hidden select-none cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.4, ease: 'easeInOut' } }}
    >
      {/* Subtle background ambient radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-[#2B4C7E]/8 via-transparent to-transparent" />

      {/* Decorative Brand Header watermark */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute top-8 left-8 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-2xl bg-[#2B4C7E] text-white flex items-center justify-center font-black text-sm shadow-xs tracking-tight">
          ID
        </div>
        <div>
          <span className="font-mono text-xs font-black uppercase tracking-widest text-[#2B4C7E]">
            Inkdabba Hub
          </span>
          <span className="text-[10px] text-[#8C827A] block font-medium">
            Agency Operations Platform
          </span>
        </div>
      </motion.div>

      {/* Main Stage: Character on Left, Welcome Message on Right */}
      <div className="relative max-w-5xl w-full mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 min-h-[480px]">
        {/* welcome.png: fades/slides in from the left */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative shrink-0 flex items-center justify-center -mb-8 md:mb-0"
        >
          {/* Subtle soft backdrop glow behind character */}
          <div className="absolute inset-0 bg-radial from-[#2B4C7E]/15 to-transparent rounded-full blur-2xl transform scale-90 pointer-events-none" />

          <img
            src="/welcome.png"
            alt="Welcome Host"
            className="relative z-10 h-[300px] sm:h-[380px] md:h-[460px] lg:h-[500px] w-auto object-contain drop-shadow-2xl"
          />
        </motion.div>

        {/* Welcome Text & Badge next to her hand */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center md:items-start text-center md:text-left z-20 space-y-4 max-w-md"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E5DD] shadow-xs text-xs font-bold text-[#2B4C7E]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2B4C7E] animate-pulse" />
            <span>Digital Marketing & Dev Studio</span>
          </motion.div>

          {/* Animating "Welcome to InkDabba" text */}
          <div className="min-h-[72px] sm:min-h-[96px] flex items-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A1A1A] tracking-tight leading-tight">
              {displayedText.includes('Inkdabba') || displayedText.includes('InkDabba') ? (
                <>
                  {displayedText.split(/Inkdabba|InkDabba/i)[0]}
                  <span className="text-[#2B4C7E]">InkDabba</span>
                </>
              ) : (
                displayedText
              )}
              {!isTypingDone && (
                <span className="inline-block w-1 h-8 sm:h-10 ml-1.5 bg-[#2B4C7E] animate-pulse align-middle" />
              )}
            </h1>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-sm sm:text-base font-semibold text-[#57534E] leading-relaxed"
          >
            Your live workspace for campaigns, content pipelines, client accounts, and code deliverables.
          </motion.p>

          {/* Skip / Continue hint & Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="pt-4 flex items-center gap-3 text-xs font-bold text-[#8C827A]"
          >
            <div className="w-28 h-1.5 rounded-full bg-[#E5E1D8] overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.1, ease: 'linear' }}
                className="h-full bg-[#2B4C7E] rounded-full"
              />
            </div>
            <span className="inline-flex items-center gap-1 hover:text-[#1A1A1A] transition-colors">
              Click anywhere to continue <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default SplashScreen
