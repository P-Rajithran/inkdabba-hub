import type React from 'react'

export interface CategoryStyle {
  id: string
  label: string
  dotClass: string
  dotHex: string
  borderLeftClass: string
  borderLeftHex: string
  tagBadgeClass: string
  tagBadgeStyle?: React.CSSProperties
}

/**
 * Category-Color-Coding System from the Design Spec:
 * - social/content = purple (#A855F7)
 * - shoot = coral (#F47266)
 * - video = orange (#F97316)
 * - design = pink (#EC4899)
 * - ads = teal (#14B8A6)
 * - meetings = amber (#F59E0B)
 * - web dev = blue (#3B82F6)
 * - app dev = indigo (#6366F1)
 */
export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  social: {
    id: 'social',
    label: 'Social / Content',
    dotClass: 'bg-purple-500',
    dotHex: '#A855F7',
    borderLeftClass: 'border-l-4 border-l-purple-500',
    borderLeftHex: '#A855F7',
    tagBadgeClass: 'bg-purple-100 text-purple-950 border-purple-300',
  },
  shoot: {
    id: 'shoot',
    label: 'Shoot',
    dotClass: 'bg-[#F47266]',
    dotHex: '#F47266',
    borderLeftClass: 'border-l-4 border-l-[#F47266]',
    borderLeftHex: '#F47266',
    tagBadgeClass: 'bg-[#FFF0ED] text-[#992617] border-[#FDCAC2]',
  },
  video: {
    id: 'video',
    label: 'Video',
    dotClass: 'bg-orange-500',
    dotHex: '#F97316',
    borderLeftClass: 'border-l-4 border-l-orange-500',
    borderLeftHex: '#F97316',
    tagBadgeClass: 'bg-orange-100 text-orange-950 border-orange-300',
  },
  design: {
    id: 'design',
    label: 'Design',
    dotClass: 'bg-pink-500',
    dotHex: '#EC4899',
    borderLeftClass: 'border-l-4 border-l-pink-500',
    borderLeftHex: '#EC4899',
    tagBadgeClass: 'bg-pink-100 text-pink-950 border-pink-300',
  },
  ads: {
    id: 'ads',
    label: 'Ads',
    dotClass: 'bg-teal-500',
    dotHex: '#14B8A6',
    borderLeftClass: 'border-l-4 border-l-teal-500',
    borderLeftHex: '#14B8A6',
    tagBadgeClass: 'bg-teal-100 text-teal-950 border-teal-300',
  },
  meeting: {
    id: 'meeting',
    label: 'Meeting',
    dotClass: 'bg-amber-500',
    dotHex: '#F59E0B',
    borderLeftClass: 'border-l-4 border-l-amber-500',
    borderLeftHex: '#F59E0B',
    tagBadgeClass: 'bg-amber-100 text-amber-950 border-amber-300',
  },
  meetings: {
    id: 'meeting',
    label: 'Meeting',
    dotClass: 'bg-amber-500',
    dotHex: '#F59E0B',
    borderLeftClass: 'border-l-4 border-l-amber-500',
    borderLeftHex: '#F59E0B',
    tagBadgeClass: 'bg-amber-100 text-amber-950 border-amber-300',
  },
  webdev: {
    id: 'webdev',
    label: 'Web Dev',
    dotClass: 'bg-blue-500',
    dotHex: '#3B82F6',
    borderLeftClass: 'border-l-4 border-l-blue-500',
    borderLeftHex: '#3B82F6',
    tagBadgeClass: 'bg-blue-100 text-blue-950 border-blue-300',
  },
  appdev: {
    id: 'appdev',
    label: 'App Dev',
    dotClass: 'bg-indigo-500',
    dotHex: '#6366F1',
    borderLeftClass: 'border-l-4 border-l-indigo-500',
    borderLeftHex: '#6366F1',
    tagBadgeClass: 'bg-indigo-100 text-indigo-950 border-indigo-300',
  },
}

/**
 * Resolves the CategoryStyle for a task based on its category or title keywords
 */
export function getCategoryStyle(rawCategory?: string, titleHint?: string): CategoryStyle {
  const catKey = (rawCategory || '').toLowerCase().trim()
  if (catKey === 'social' || catKey === 'content') return CATEGORY_STYLES.social
  if (catKey === 'shoot' || catKey === 'photography') return CATEGORY_STYLES.shoot
  if (catKey === 'video') return CATEGORY_STYLES.video
  if (catKey === 'design') return CATEGORY_STYLES.design
  if (catKey === 'ads' || catKey === 'ad') return CATEGORY_STYLES.ads
  if (catKey === 'meeting' || catKey === 'meetings') return CATEGORY_STYLES.meeting
  if (catKey === 'webdev' || catKey === 'web dev' || catKey === 'web') return CATEGORY_STYLES.webdev
  if (catKey === 'appdev' || catKey === 'app dev' || catKey === 'app') return CATEGORY_STYLES.appdev

  const text = `${rawCategory || ''} ${titleHint || ''}`.toLowerCase().trim()

  if (text.includes('social') || text.includes('content') || text.includes('copy') || text.includes('post') || text.includes('carousel')) {
    return CATEGORY_STYLES.social
  }

  if (text.includes('shoot') || text.includes('photo') || text.includes('camera') || text.includes('packaging')) {
    return CATEGORY_STYLES.shoot
  }

  if (text.includes('video') || text.includes('reel') || text.includes('motion') || text.includes('render')) {
    return CATEGORY_STYLES.video
  }

  if (text.includes('design') || text.includes('branding') || text.includes('typography') || text.includes('layout') || text.includes('poster')) {
    return CATEGORY_STYLES.design
  }

  if (text.includes('ad') || text.includes('campaign') || text.includes('marketing') || text.includes('roas') || text.includes('meta')) {
    return CATEGORY_STYLES.ads
  }

  if (text.includes('meeting') || text.includes('standup') || text.includes('sync') || text.includes('client review') || text.includes('briefing')) {
    return CATEGORY_STYLES.meeting
  }

  if (text.includes('web') || text.includes('frontend') || text.includes('landing') || text.includes('deployment') || text.includes('page')) {
    return CATEGORY_STYLES.webdev
  }

  if (text.includes('app') || text.includes('mobile') || text.includes('backend') || text.includes('api') || text.includes('bug')) {
    return CATEGORY_STYLES.appdev
  }

  // Fallback defaults to Design
  return CATEGORY_STYLES.design
}
