import axios from 'axios'

let cachedSchools = null

const CDN_SOURCES = [
  // GitHub raw for province->all[] dataset
  'https://raw.githubusercontent.com/codeudan/crawler-china-mainland-universities/master/china_mainland_universities.json',
  // Generic flat list fallbacks (if available)
  'https://unpkg.com/@extra-data/cn-universities@latest/universities.json',
  'https://cdn.jsdelivr.net/npm/@extra-data/cn-universities@latest/universities.json'
]

export async function fetchSchoolList() {
  if (cachedSchools && Array.isArray(cachedSchools) && cachedSchools.length > 0) {
    return cachedSchools
  }

  // Try CDN sources first
  for (const url of CDN_SOURCES) {
    try {
      const { data } = await axios.get(url, { timeout: 8000 })
      const normalized = normalizeFromAnyShape(data)
      if (Array.isArray(normalized) && normalized.length) {
        cachedSchools = normalized
        return cachedSchools
      }
    } catch (e) {
      // continue to next source
    }
  }

  // Fallback to local bundled list
  try {
    const local = await import(/* webpackChunkName: "universities" */ '@/assets/data/universities.json')
    const list = local.default || local
    cachedSchools = normalizeFromAnyShape(list)
    return cachedSchools
  } catch (e) {
    // Last resort: empty list
    cachedSchools = []
    return cachedSchools
  }
}

function normalizeSchoolNames(items) {
  // Accepts either array of strings or array of objects with name property
  return items
    .map(item => {
      if (typeof item === 'string') return item
      if (item && (item.name || item.label || item.title)) return item.name || item.label || item.title
      return null
    })
    .filter(Boolean)
}

function normalizeFromAnyShape(payload) {
  // If it's already an array -> normalize by names
  if (Array.isArray(payload)) {
    return normalizeSchoolNames(payload)
  }
  // If it's an object like { 省份: { all: [..] } } or { 省份: [..] }
  if (payload && typeof payload === 'object') {
    const collected = []
    Object.keys(payload).forEach(province => {
      const group = payload[province]
      const arr = Array.isArray(group) ? group : (group && group.all) || []
      if (Array.isArray(arr)) {
        collected.push(...normalizeSchoolNames(arr))
      }
    })
    // 去重并排序（按字典序）
    return Array.from(new Set(collected)).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
  }
  return []
}

export function clearSchoolCache() {
  cachedSchools = null
}

