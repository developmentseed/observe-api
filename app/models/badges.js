import db from '../services/db'

/**
 * Get list of badges and their descriptions
 */
export async function listBadges() {
  return db('badges').select()
}

/**
 * Helper for knex filter
 * @param {*} builder - Knex object
 */
function whereBuilder(builder, filterBy) {
  const {
    userId
  } = filterBy

  if (userId) {
    builder.where('userId', userId)
  }
}

/**
 * Get all badges assigned to users
 * 
 * @param {*} filterBy - Filter object
 * @param {*} filterBy.userId - user id
 */
export async function listUserBadges(filterBy = {}) {
  return db('badges_users')
    .select()
    .where(builder => whereBuilder(builder, filterBy))
}