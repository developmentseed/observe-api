import * as badges from '../../../models/badges'
import * as surveys from '../../../models/surveys'
import db from '../services/db'
import metrics from './metrics'
/**
 * Calculates badges and assigns them to users
 */
export default async function run() {
  const badgeDescriptions = await badges.listBadges()
  const allSurveys = await surveys.getSurveys()

  // for each badge description
  // check the metric, and pass it to the appropriate
  // badge calculator along with the list of surveys
  let calculatedBadges = []
  badges.forEach( ({ description, id }) => {
    const { metric } = description;
    let achievedMetric = metrics[metric](description, allSurveys) // Returns { user, timeAchieved}
    let calculatedBadgesForMetric = achievedMetric.map( (userId, timeAchieved) => {
      return { badgeId: id, userId, createdAt: timeAchieved }
    })
    calculatedBadges.push(calculatedBadgesForMetric)
  })

  // Push all badges to the badges_users table
  try {
    await db.transaction(trx => {
      await trx('badges_users').truncate()
      return trx('badges_users').insert(calculatedBadges)
    })
  } catch (error) {
    throw new Error('Could not complete badge calculation', error)
  }
}