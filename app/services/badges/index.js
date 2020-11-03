import * as badges from '../../models/badges';
import * as observations from '../../models/observations';
import db from '../db';
import { concat } from 'ramda';
import metrics from './metrics';
/**
 * Calculates badges and assigns them to users
 */
export default async function () {
  const badgeDescriptions = await badges.listBadges();
  const allObservations = await observations.fetchObservations();

  // for each badge description
  // check the metric, and pass it to the appropriate
  // badge calculator along with the list of observations
  let calculatedBadges = [];
  badgeDescriptions.forEach(({ description, id }) => {
    const { metric } = description;
    let achievedMetric = metrics[metric](description, allObservations); // Returns [{ userId, timeAchieved }]
    let calculatedBadgesForMetric = achievedMetric.map(({ userId, timeAchieved }) => {
      return { badgeId: id, userId, createdAt: timeAchieved };
    });
    calculatedBadges = concat(calculatedBadges, calculatedBadgesForMetric);
  });

  // Push all badges to the badges_users table
  return db.transaction(trx => {
    return trx('badges_users')
      .truncate()
      .then(() => {
        return trx('badges_users').insert(calculatedBadges);
      });
  })
    .catch(err => {
      throw new Error('Could not complete badge calculation', err);
    });
}
