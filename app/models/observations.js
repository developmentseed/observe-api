import db from '../services/db';
import logger from '../services/logger';
import { createAnswer, getAnswers, getAnswerSummary } from './answers';
import { createOsmObject, getOsmObject } from './osm-objects';

export async function createObservation (data) {
  try {
    return await db.transaction(async trx => {
      const {
        surveyId,
        userId,
        createdAt,
        osmObject,
        answers
      } = data;

      const osmObjectId = osmObject.id;
      const osmObjectVersion = osmObject.properties.version;
      osmObject.id = osmObjectId;

      const osmObjectExists = await getOsmObject(osmObjectId);
      if (!osmObjectExists) {
        await createOsmObject(osmObject, trx);
      }

      const [ observationId ] = await db('observations')
        .insert({
          surveyId,
          userId,
          createdAt,
          osmObjectId,
          osmObjectVersion
        }, 'id').transacting(trx);

      for (let index = 0; index < answers.length; index++) {
        const answer = answers[index];
        answer['observationId'] = observationId;
        await createAnswer(answer, trx);
      }
      return observationId;
    });
  } catch (error) {
    logger.error(error);
  }
}

export async function fetchObservations (surveyId, osmObjectId, username) {
  const filterBy = {
    surveyId,
    osmObjectId,
    username
  };

  const observations = await db('observations')
    .select()
    .join('users', 'users.osmId', '=', 'observations.userId')
    .where(builder => whereBuilder(builder, filterBy));

  return observations;
}

export async function getObservationsWithAnswers (surveyId, osmObjectId, username) {
  const observations = await fetchObservations(surveyId, osmObjectId, username);

  if (!observations) return null;

  for (let index = 0; index < observations.length; index++) {
    const observation = observations[index];
    const answers = await getAnswers(observation.id);
    observation.answers = answers;
  }

  return observations;
}

export async function getObservationsSummary (surveyId, questionId, osmObjectId, username) {
  const observations = await fetchObservations(surveyId, osmObjectId, username);

  if (!observations) return null;

  const observationIds = observations.map(o => {
    return o.id;
  });

  const locationCount = await countObservationLocations(surveyId, username);
  const summary = {
    'totalObservations': observationIds.length,
    'locationCount': locationCount
  };

  if (questionId) {
    summary['answerSummary'] = await getAnswerSummary(observationIds, questionId);
  }

  return summary;
}

export async function countObservationLocations (surveyId, username) {
  const filterBy = {
    surveyId,
    username
  };

  const [ counter ] = await db('observations')
    .join('users', 'users.osmId', '=', 'observations.userId')
    .where(builder => whereBuilder(builder, filterBy))
    .countDistinct('osmObjectId');

  return parseInt(counter.count);
}

function whereBuilder (builder, filterBy) {
  const { surveyId, osmObjectId, username } = filterBy;

  if (surveyId) {
    builder.where('surveyId', surveyId);
  }

  if (osmObjectId) {
    builder.where('osmObjectId', osmObjectId);
  }

  if (username) {
    builder.where('users.osmDisplayName', username);
  }
}
