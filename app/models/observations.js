import db from '../services/db';
import logger from '../services/logger';
import { createAnswer } from './answers';
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

      const osmObjectId = `${osmObject.id}/${osmObject.properties.version}`;
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
          osmObject: osmObjectId
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
