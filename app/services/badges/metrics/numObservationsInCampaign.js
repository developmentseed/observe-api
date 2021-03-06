import { groupBy, prop, mapObjIndexed, map, filter, sort, forEachObjIndexed, propEq } from 'ramda';
import { compareAsc } from 'date-fns';

/**
 * Given all observations a threshold and a campaignId, return the users that have had
 * _threshold_ observations in that campaign
 *
 * @param {Object} attributes
 * @param {integer} attributes.threshold - number of observations to achieve badge
 * @param {integer} attributes.campaignId - campaignId to filter by
 * @param {Observation[]} observations
 */
export default function numObservationsInCampaign (attributes, observations) {
  const { threshold, campaignId } = attributes;
  if (!threshold || threshold < 1) {
    throw new Error('numObservations needs a positive integer threshold');
  }

  // Filter observations in campaign
  const filteredObservations = filter(propEq('campaignId', campaignId), observations);

  // Group observations by the user id
  const userObservations = groupBy(prop('userId'), filteredObservations);

  // Filter only users that have more than _threshold_ observations
  const winners = filter((arr) => arr.length >= threshold, userObservations);

  // Get only an array of times for each user id
  const userTimes = mapObjIndexed(map(prop('createdAt')), winners);

  // Sort the array of times
  const userTimesSorted = mapObjIndexed(sort(compareAsc), userTimes);

  // Build return object
  let retVal = [];
  forEachObjIndexed(
    (v, k) => retVal.push({ 'userId': k, 'timeAchieved': v[threshold - 1] }), // Get the time at which we reached the threshold
    userTimesSorted
  );
  return retVal;
}
