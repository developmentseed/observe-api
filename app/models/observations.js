import db from '../services/db';
import logger from '../services/logger';
import { createAnswer, getAnswers, getAnswerSummary } from './answers';
import { createOsmObject, getOsmObject } from './osm-objects';

export async function createObservation (data) {
  try {
    return await db.transaction(async trx => {
      const { surveyId, campaignId, userId, createdAt, osmObject, answers } = data;

      const osmObjectId = osmObject.id;
      const osmObjectVersion = osmObject.properties.version;

      const osmObjectExists = await getOsmObject(osmObjectId);
      if (!osmObjectExists) {
        await createOsmObject(osmObject, trx);
      }

      const [observationId] = await db('observations')
        .insert(
          {
            surveyId,
            campaignId,
            userId,
            createdAt,
            osmObjectId,
            osmObjectVersion
          },
          'id'
        )
        .transacting(trx);

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

export async function fetchObservations (campaignId, surveyId, osmObjectId, userId) {
  const filterBy = {
    campaignId,
    surveyId,
    osmObjectId,
    userId
  };

  const observations = await db('observations')
    .select(
      [
        'observations.id',
        'observations.createdAt',
        'observations.uploadedAt',
        'observations.campaignId',
        'userId',
        'surveyId',
        'osmObjectId',
        'osmObjectVersion',
        'users.osmId',
        'users.osmDisplayName',
        'users.osmCreatedAt',
        'users.isAdmin',
        'users.displayName',
        'users.email'
      ]
    )
    .join('users', 'users.id', '=', 'observations.userId')
    .where(builder => whereBuilder(builder, filterBy));

  return observations;
}

export async function getObservationsWithAnswers (
  campaignId,
  surveyId,
  osmObjectId,
  userId
) {
  const observations = await fetchObservations(campaignId, surveyId, osmObjectId, userId);

  if (!observations) return null;

  for (let index = 0; index < observations.length; index++) {
    const observation = observations[index];
    const answers = await getAnswers(observation.id);
    observation.answers = answers;
  }

  return observations;
}

export async function getObservationsSummary (
  campaignId,
  surveyId,
  questionId,
  osmObjectId,
  userId
) {
  const observations = await fetchObservations(campaignId, surveyId, osmObjectId, userId);

  if (!observations) return null;

  const observationIds = observations.map(o => {
    return o.id;
  });

  const locationCount = await countObservationLocations(surveyId, userId);
  const summary = {
    totalObservations: observationIds.length,
    locationCount: locationCount
  };

  if (questionId) {
    summary['answerSummary'] = await getAnswerSummary(
      observationIds,
      questionId
    );
  }

  return summary;
}

export async function countObservationLocations (surveyId, userId) {
  const filterBy = {
    surveyId,
    userId
  };

  const [counter] = await db('observations')
    .join('users', 'users.id', '=', 'observations.userId')
    .where(builder => whereBuilder(builder, filterBy))
    .countDistinct('osmObjectId');

  return parseInt(counter.count);
}

function whereBuilder (builder, filterBy) {
  const { campaignId, surveyId, osmObjectId, userId } = filterBy;

  if (campaignId) {
    builder.where('campaignId', campaignId);
  }

  if (surveyId) {
    builder.where('surveyId', surveyId);
  }

  if (osmObjectId) {
    builder.where('osmObjectId', osmObjectId);
  }

  if (userId) {
    builder.where('users.id', userId);
  }
}
