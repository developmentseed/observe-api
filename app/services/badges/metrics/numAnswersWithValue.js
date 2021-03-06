import { compose, groupBy, equals, path, prop, mapObjIndexed, map, filter, sort, forEachObjIndexed, any } from 'ramda';
import { compareAsc } from 'date-fns';

/**
 * Given all observations a threshold and a value, return the users that have had
 * _threshold_ observations with that answer as a value
 * and the time when they recorded that number of answers
 *
 * @param {Object} attributes
 * @param {integer} attributes.threshold - number of observations to achieve badge
 * @param {string} attributes.answerValue - value of answers to filter by
 * @param {Observation[]} observations
 */
export default function numAnswersWithValue (attributes, observations) {
  const { threshold, answerValue } = attributes;
  if (!threshold || threshold < 1) {
    throw new Error('numObservations needs a positive integer threshold');
  }

  // Filter observations for questions with the answerValue = value
  const answerPredicate = compose(
    any(equals(answerValue)),
    map(path(['answer', 'value'])),
    prop('answers')
  );
  const filteredObservations = filter(answerPredicate, observations);

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
