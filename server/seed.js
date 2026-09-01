import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { connectDB } from './db.js'
import { User } from './models/User.js'
import { Task } from './models/Task.js'
import { Leave } from './models/Leave.js'
import { Client } from './models/Client.js'

dotenv.config()

export async function seedDatabase(shouldExit = false) {
  try {
    console.log('🌱 [Seed] Connecting to database...')
    await connectDB()

    console.log('🧹 [Seed] Clearing existing collections...')
    await Task.deleteMany({})
    await User.deleteMany({})
    await Leave.deleteMany({})
    await Client.deleteMany({})

    // 1. Create 5-6 Sample Clients
    console.log('🏢 [Seed] Creating sample clients...')
    const sampleClients = [
      {
        name: 'Aura Skincare',
        industry: 'D2C & Beauty',
        status: 'active',
      },
      {
        name: 'NexaPay Global',
        industry: 'FinTech & Banking',
        status: 'active',
      },
      {
        name: 'Kestrel Athletics',
        industry: 'Athletic Apparel & Footwear',
        status: 'active',
      },
      {
        name: 'Zenith Living',
        industry: 'Interior & Luxury Real Estate',
        status: 'onboarding',
      },
      {
        name: 'UrbanBite Kitchens',
        industry: 'Food & Quick-Service Dining',
        status: 'active',
      },
      {
        name: 'PulseEd Learning',
        industry: 'EdTech & SaaS Platform',
        status: 'paused',
      },
      {
        name: 'Vertex Mobility',
        industry: 'EV Fleet & Logistics',
        status: 'active',
      },
      {
        name: 'Lumina Healthcare',
        industry: 'Digital Health & Telemedicine',
        status: 'active',
      },
      {
        name: 'NovaFin Capital',
        industry: 'Venture & Private Wealth',
        status: 'onboarding',
      },
      {
        name: 'Artisan Roast Co.',
        industry: 'Specialty Beverage & Retail',
        status: 'active',
      },
      {
        name: 'Echo Brand Labs',
        industry: 'Media, Audio & Entertainment',
        status: 'active',
      },
    ]

    const createdClients = await Client.insertMany(sampleClients)
    console.log(`✓ Inserted ${createdClients.length} clients`)
    const [aura, nexa, kestrel, zenith, urban, pulse, vertex, lumina, novafin, artisan, echo] =
      createdClients

    // 2. Create 8 Agency Users across Digital Marketing and Dev
    console.log('👥 [Seed] Creating 8 agency users...')
    const defaultPassword = await bcrypt.hash('password123', 10)

    const sampleUsers = [
      // Digital Marketing Team
      {
        name: 'Prakash',
        email: 'prakash@inkdabba.com',
        role: 'admin',
        designation: 'Client Coordinator',
        password: defaultPassword,
      },
      {
        name: 'Aswin',
        email: 'aswin@inkdabba.com',
        role: 'member',
        designation: 'Social Media Executive',
        password: defaultPassword,
      },
      {
        name: 'Divya',
        email: 'divya@inkdabba.com',
        role: 'member',
        designation: 'Graphic Designer',
        password: defaultPassword,
      },
      {
        name: 'Karthik',
        email: 'karthik@inkdabba.com',
        role: 'member',
        designation: 'Video Editor',
        password: defaultPassword,
      },
      {
        name: 'Meena',
        email: 'meena@inkdabba.com',
        role: 'member',
        designation: 'Ads Specialist',
        password: defaultPassword,
      },
      // Dev Team
      {
        name: 'Sanjay',
        email: 'sanjay@inkdabba.com',
        role: 'member',
        designation: 'Web Developer',
        password: defaultPassword,
      },
      {
        name: 'Ritika',
        email: 'ritika@inkdabba.com',
        role: 'member',
        designation: 'App Developer',
        password: defaultPassword,
      },
      {
        name: 'Vignesh',
        email: 'vignesh@inkdabba.com',
        role: 'member',
        designation: 'Full Stack Developer',
        password: defaultPassword,
      },
    ]

    const createdUsers = await User.insertMany(sampleUsers)
    console.log(`✓ Inserted ${createdUsers.length} agency team members`)
    const [prakash, aswin, divya, karthik, meena, sanjay, ritika, vignesh] = createdUsers

    // 3. Seed 24 Agency Tasks across users, clients, and the 8 color categories
    console.log('📋 [Seed] Creating realistic agency tasks...')
    const sampleTasks = [
      // Prakash - Client Coordinator (Meetings, Social, Video)
      {
        title: 'Weekly sprint review and quarterly deliverables sync',
        description: 'Review cross-channel campaign milestones and Q3 ad budget reallocation',
        category: 'meeting',
        client: aura._id,
        assignee: prakash._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 3), // in 3 hours
      },
      {
        title: 'Onboarding alignment meeting and brand discovery workshop',
        description: 'Define target persona, visual moodboards, and tech integration roadmap',
        category: 'meeting',
        client: zenith._id,
        assignee: prakash._id,
        status: 'review',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 6), // in 6 hours
      },
      {
        title: 'Monthly marketing ROI and performance analytics briefing',
        description: 'Present blended CAC, ROAS lift, and organic engagement reports to leadership',
        category: 'meeting',
        client: nexa._id,
        assignee: prakash._id,
        status: 'completed',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
      },

      // Aswin - Social Media Executive (Social, Shoot, Meeting)
      {
        title: 'Monthly content calendar and community engagement rollout',
        description: 'Draft 24 feed posts, stories, and carousel copy for active community review',
        category: 'social',
        client: kestrel._id,
        assignee: aswin._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 5),
      },
      {
        title: 'Creator influencer collaboration briefs & story templates',
        description: 'Dispatch seeding packages and coordinated talking points to 15 food creators',
        category: 'social',
        client: urban._id,
        assignee: aswin._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 9),
      },
      {
        title: 'On-location summer collection lifestyle content shoot',
        description: 'Coordinate talent, shot list, and BTS handheld capture in natural lighting',
        category: 'shoot',
        client: kestrel._id,
        assignee: aswin._id,
        status: 'review',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 12),
      },
      {
        title: 'Interactive polls and Q&A story graphics for product drop',
        description: 'Engage audience ahead of limited edition ceramic bottle launch',
        category: 'social',
        client: aura._id,
        assignee: aswin._id,
        status: 'completed',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 4),
        completedAt: new Date(Date.now() - 1000 * 60 * 120),
      },

      // Divya - Graphic Designer (Design, Shoot, Social)
      {
        title: '10-slide educational carousel on sun protection SPF science',
        description: 'Design typography layouts, infographic diagrams, and custom illustrations',
        category: 'design',
        client: aura._id,
        assignee: divya._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 4),
      },
      {
        title: 'Luxury penthouse interior showcase multi-image carousel',
        description: 'Architectural layout spreads with minimalist typography and foil accents',
        category: 'design',
        client: zenith._id,
        assignee: divya._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 8),
      },
      {
        title: 'Studio product photography and macro packaging stills',
        description: 'Capture high-res still life shots of matte glass packaging under diffused softboxes',
        category: 'shoot',
        client: aura._id,
        assignee: divya._id,
        status: 'review',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 14),
      },
      {
        title: 'Visual identity system and branding guidelines v2',
        description: 'Vector logo marks, spacing rules, color tokens, and typographic hierarchy',
        category: 'design',
        client: nexa._id,
        assignee: divya._id,
        status: 'completed',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
      },

      // Karthik - Video Editor (Video, Shoot)
      {
        title: '9:16 Instagram Reels cutdown with trending audio and motion captions',
        description: 'Fast-paced rhythmic edit showcasing kitchen prep and plating highlights',
        category: 'video',
        client: urban._id,
        assignee: karthik._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 5),
      },
      {
        title: 'Founder narrative video montage for brand anniversary campaign',
        description: 'Archive footage assembly with sound design, subtle grain, and color grade',
        category: 'video',
        client: nexa._id,
        assignee: karthik._id,
        status: 'review',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 10),
      },
      {
        title: 'Macro texture b-roll grading in DaVinci for skincare serum launch',
        description: 'Delicate droplet fluid dynamics graded for DCI-P3 color gamut display',
        category: 'video',
        client: aura._id,
        assignee: karthik._id,
        status: 'completed',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 3),
        completedAt: new Date(Date.now() - 1000 * 60 * 90),
      },

      // Meena - Ads Specialist (Ads, Meeting)
      {
        title: 'Q3 Meta conversion campaign setup and catalog feed optimization',
        description: 'Configure Advantage+ shopping campaigns, custom pixel events, and dynamic creatives',
        category: 'ads',
        client: kestrel._id,
        assignee: meena._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 7),
      },
      {
        title: 'High-intent Google Search ad copy & negative keyword expansion',
        description: 'Target B2B payment gateway queries with localized copy and sitelink extensions',
        category: 'ads',
        client: nexa._id,
        assignee: meena._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 11),
      },
      {
        title: 'Retargeting display ad creative A/B testing on ROAS threshold',
        description: 'Analyze CPA decay across frequency caps and deploy refresh creative variations',
        category: 'ads',
        client: urban._id,
        assignee: meena._id,
        status: 'revisions',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago (Overdue!)
      },
      {
        title: 'Audit ad account spend caps and attribution windows',
        description: 'Prevent budget pacing anomalies across weekend promotional spikes',
        category: 'ads',
        client: kestrel._id,
        assignee: meena._id,
        status: 'completed',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 6),
        completedAt: new Date(Date.now() - 1000 * 60 * 180),
      },

      // Sanjay - Web Developer (WebDev, Design)
      {
        title: 'High-converting headless Shopify landing page for sunscreen bundle',
        description: 'Develop responsive Liquid / React sections with sticky add-to-cart and bundle discounts',
        category: 'webdev',
        client: aura._id,
        assignee: sanjay._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 6),
      },
      {
        title: 'Interactive mortgage rate calculator landing page redesign',
        description: 'Real-time slider calculations, SVG amortization charts, and lead capture integration',
        category: 'webdev',
        client: nexa._id,
        assignee: sanjay._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 15),
      },
      {
        title: 'Resolve cart drawer re-render performance regression on Safari',
        description: 'Eliminate layout shift and memoize line-item price calculation hooks',
        category: 'webdev',
        client: kestrel._id,
        assignee: sanjay._id,
        status: 'completed',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 5),
        completedAt: new Date(Date.now() - 1000 * 60 * 150),
      },

      // Ritika - App Developer (AppDev, WebDev)
      {
        title: 'Push notification FCM service integration for order tracking app',
        description: 'Implement real-time driver delivery location updates and rich media push banners',
        category: 'appdev',
        client: urban._id,
        assignee: ritika._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 8),
      },
      {
        title: 'React Native biometric FaceID / fingerprint authentication module',
        description: 'Store encrypted session tokens in Secure Enclave and KeyStore with fallback PIN',
        category: 'appdev',
        client: nexa._id,
        assignee: ritika._id,
        status: 'review',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 12),
      },
      {
        title: 'iOS offline cache sync and background location tracking optimization',
        description: 'WatermelonDB local SQLite persistence layer with delta sync reconciliation',
        category: 'appdev',
        client: kestrel._id,
        assignee: ritika._id,
        status: 'completed',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      },

      // Vignesh - Full Stack Developer (WebDev, AppDev)
      {
        title: 'Production deployment of Next.js 15 client dashboard to AWS ECS',
        description: 'Configure multi-zone ALB, zero-downtime rolling deployments, and CloudWatch alarms',
        category: 'webdev',
        client: nexa._id,
        assignee: vignesh._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 4),
      },
      {
        title: 'Fix checkout address autocomplete and payment gateway webhook timeout',
        description: 'Handle idempotent webhook retry handling and address validation edge cases',
        category: 'webdev',
        client: kestrel._id,
        assignee: vignesh._id,
        status: 'revisions',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago (Overdue!)
      },
      {
        title: 'Stripe subscription webhooks and automated tax computation API',
        description: 'Multi-currency invoicing with Stripe Tax and webhook listener verification',
        category: 'appdev',
        client: pulse._id,
        assignee: vignesh._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 10),
      },
      {
        title: 'Staging environment CI/CD GitHub Actions pipeline migration',
        description: 'Containerized build caching and automated Jest / Playwright test execution',
        category: 'webdev',
        client: pulse._id,
        assignee: vignesh._id,
        status: 'completed',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
      {
        title: 'EV telematics telemetry dashboard UI & realtime map rendering',
        description: 'Mapbox GL vehicle tracking with WebSocket live battery level feeds',
        category: 'webdev',
        client: vertex._id,
        assignee: sanjay._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 6),
      },
      {
        title: 'Telehealth patient intake forms & HIPAA compliance review',
        description: 'Encrypted medical questionnaire with conditional logic and digital signature',
        category: 'appdev',
        client: lumina._id,
        assignee: ritika._id,
        status: 'review',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 8),
      },
      {
        title: 'Private wealth pitch deck typography & data viz infographic cards',
        description: 'Investor quarterly report with stylized portfolio performance matrices',
        category: 'design',
        client: novafin._id,
        assignee: divya._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 12),
      },
      {
        title: 'Single-origin espresso packaging label and foil stamp embossing proof',
        description: 'Matte black pouch mockups with holographic origin seals for release',
        category: 'design',
        client: artisan._id,
        assignee: divya._id,
        status: 'completed',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 8),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      },
      {
        title: 'Audio waveform animation teaser & YouTube shorts packaging',
        description: 'Engaging audio snippet visualizers with subtitle motion templates',
        category: 'video',
        client: echo._id,
        assignee: karthik._id,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 4),
      },
    ]

    const createdTasks = await Task.insertMany(sampleTasks)
    console.log(`✓ Inserted ${createdTasks.length} agency tasks across 8 categories`)

    // 4. Seed Leave Entries for Today (Preserve visual indicators)
    console.log('🏖️ [Seed] Creating sample leaves for today...')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sampleLeaves = [
      {
        user: ritika._id,
        date: today,
        type: 'half',
        reason: 'Midday offsite architecture workshop (Half Day)',
      },
      {
        user: karthik._id,
        date: today,
        type: 'full',
        reason: 'Commercial studio shoot equipment prep (Full Day Leave)',
      },
    ]

    const createdLeaves = await Leave.insertMany(sampleLeaves)
    console.log(`✓ Inserted ${createdLeaves.length} leave entries for today`)

    console.log('\n📊 [Seed] Summary:')
    console.log(`- Clients: ${createdClients.length}`)
    console.log(`- Users: ${createdUsers.length} (Digital Marketing & Dev)`)
    console.log(`- Tasks: ${createdTasks.length}`)
    console.log(`  • Active: ${createdTasks.filter((t) => t.status === 'active').length}`)
    console.log(`  • Review: ${createdTasks.filter((t) => t.status === 'review').length}`)
    console.log(`  • Revisions: ${createdTasks.filter((t) => t.status === 'revisions').length}`)
    console.log(`  • Completed: ${createdTasks.filter((t) => t.status === 'completed').length}`)
    console.log(`- Leaves Today: ${createdLeaves.length}`)
    console.log(`  • Ritika (Half Day - sweeping divider highlight)`)
    console.log(`  • Karthik (Full Day - grayscale + pulsing away badge)`)

    console.log('\n✨ Database seeding completed successfully!')
    if (shouldExit) {
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ [Seed] Error during seeding:', error)
    if (shouldExit) {
      process.exit(1)
    }
  }
}

// If run directly from CLI (e.g. npm run seed)
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('server/seed.js')) {
  seedDatabase(true)
}
