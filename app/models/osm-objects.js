import db from '../services/db';
import logger from '../services/logger';
import { stringify as geojsonTowkt } from 'wellknown';

export async function createOsmObject (data, trx) {
  const wkt = geojsonTowkt(data.geometry);
  const response = await db('osm_objects')
    .insert(
      {
        id: data.id,
        version: data.properties.version,
        geom: wkt,
        attributes: data.properties,
        quadkey: data.quadkey
      },
      'id'
    )
    .transacting(trx);

  return response;
}

const observationsPerPlaceQuery = db('answers')
  .select('observations.osmObjectId')
  .count({
    total: 'answers.id',
    totalTrue: db.raw(`(
        CASE
          WHEN answer :: jsonb -> 'value' = 'true' THEN 1
        END
      )`),
    totalFalse: db.raw(`
    (
      CASE
        WHEN answer :: jsonb -> 'value' = 'false' THEN 1
      END
    )
  `)
  })
  .leftJoin('observations', 'answers.observationId', '=', 'observations.id')
  .leftJoin('questions', function () {
    this.on('answers.questionId', '=', 'questions.id').andOn(
      'answers.questionVersion',
      '=',
      'questions.version'
    );
  })
  .groupBy('observations.osmObjectId')
  .groupBy('answers.questionId')
  .groupBy('questions.type')
  .having('questions.type', '=', 'boolean');

export async function getOsmObject (id) {
  const osmObject = await db('osm_objects')
    .select(['id', db.raw('ST_AsGeoJSON(geom) as geometry'), 'attributes'])
    .select({
      total: 'observationCounts.total',
      totalTrue: 'observationCounts.totalTrue',
      totalFalse: 'observationCounts.totalFalse'
    })
    .with('observationCounts', observationsPerPlaceQuery)
    .leftJoin('observationCounts', 'observationCounts.osmObjectId', '=', 'id')
    .where('id', id)
    .first();

  // FIXME if osmObject is undefined should return here.
  // const comments = db('answers')
  const comments = await db('answers')
    .select(
      'observationId',
      // 'observations.osmObjectId',
      'observations.createdAt',
      'users.osmDisplayName',
      db.raw("answer::jsonb->'value' as text")
    )
    .joinRaw(db.raw(`
      left join users
        inner join observations
        On observations."userId" = users."id"
      ON answers."observationId" = observations.id
    `))
    .leftJoin('questions', 'answers.questionId', '=', 'questions.id')
    .orderBy('observations.createdAt', 'desc')
    .where({
      'questions.type': 'text',
      'observations.osmObjectId': id
    })
    .limit(10);

  return {
    id: osmObject.id,
    type: 'Feature',
    geometry: JSON.parse(osmObject.geometry),
    properties: {
      ...osmObject.attributes,
      comments,
      observations: {
        total: osmObject.total,
        totalTrue: osmObject.totalTrue,
        totalFalse: osmObject.totalFalse
      }
    }
  };
}

async function osmObjectExists (id) {
  const [{ count }] = await db('osm_objects')
    .count()
    .where('id', id);

  return parseInt(count) > 0;
}

export async function insertFeatureCollection (geojson) {
  try {
    return await db.transaction(async trx => {
      let insertedCount = 0;
      for (let index = 0; index < geojson.features.length; index++) {
        const feature = geojson.features[index];
        // check if this feature exists
        const exists = await osmObjectExists(feature.id);
        if (!exists) {
          insertedCount = insertedCount + 1;
          await createOsmObject(feature, trx);
        }
      }
      return insertedCount;
    });
  } catch (error) {
    logger.error(error);
  }
}

export async function getOsmObjects (filterBy, offset, limit) {
  const osmObjects = await db('osm_objects')
    .select({
      id: 'osm_objects.id',
      geometry: db.raw('ST_AsGeoJSON(geom)'),
      attributes: 'osm_objects.attributes',
      total: 'observationCounts.total',
      totalTrue: 'observationCounts.totalTrue',
      totalFalse: 'observationCounts.totalFalse'
    })
    .with('observationCounts', observationsPerPlaceQuery)
    .leftJoin('observationCounts', 'observationCounts.osmObjectId', '=', 'id')
    .where(builder => whereBuilder(builder, filterBy))
    .offset(offset)
    .limit(limit)
    .map(o => {
      // When there is no observations, totals are null. This sets them to 0.
      o.total = o.total || 0;
      o.totalTrue = o.totalTrue || 0;
      o.totalFalse = o.totalFalse || 0;
      return o;
    });

  if (!osmObjects) return null;

  const featureCollection = osmObjects.reduce(
    (featureCollection, osmObject) => {
      const feature = {
        id: osmObject.id,
        type: 'Feature',
        geometry: JSON.parse(osmObject.geometry),
        properties: {
          ...osmObject.attributes,
          observations: {
            total: osmObject.total,
            totalTrue: osmObject.totalTrue,
            totalFalse: osmObject.totalFalse
          }
        }
      };

      featureCollection.features.push(feature);
      return featureCollection;
    },
    {
      type: 'FeatureCollection',
      features: []
    }
  );
  return featureCollection;
}

export async function countOsmObjects (quadkey) {
  const [counter] = await db('osm_objects')
    .where(builder => whereBuilder(builder, { quadkey }))
    .countDistinct('osm_objects.id');

  return counter.count;
}

export async function getOsmObjectStats (campaignId) {
  let totalOsmObjectsPromise = db('osm_objects').countDistinct('osm_objects.id');
  let surveyorsPromise = db('observations').countDistinct('observations.userId');
  let observationsFilter = '';

  if (campaignId) {
    totalOsmObjectsPromise = totalOsmObjectsPromise
      .innerJoin('observations', 'osm_objects.id', '=', 'observations.osmObjectId')
      .where('campaignId', campaignId);
    surveyorsPromise = surveyorsPromise.where('campaignId', campaignId);
    observationsFilter = `where "campaignId"=${campaignId}`;
  }
  const [totalOsmObjects] = await totalOsmObjectsPromise;
  const [surveyors] = await surveyorsPromise;

  // This query first aggregates answers by places in a sub-query to determine
  // the most prevalent survey answer, for questions of type boolean. Then it
  // count places where the answer is mostly equal to true.
  const placeStats = (await db.raw(`
    select
      count("osmObjectId") as total,
      count(
        (
          CASE
            WHEN total_true > total_false THEN 1
          END
        )
      ) as mostly_true
    from (
        select
          observations."osmObjectId",
          answers."questionId",
          count(answers.id) as total,
          count(
            (
              CASE
                WHEN answer :: jsonb -> 'value' = 'true' THEN 1
              END
            )
          ) as total_true,
          count(
            (
              CASE
                WHEN answer :: jsonb -> 'value' = 'false' THEN 1
              END
            )
          ) as total_false
        from answers
        inner join observations ON answers."observationId" = observations.id
        left join questions ON answers."questionId" = questions.id
          AND answers."questionVersion" = questions.version
        ${observationsFilter}
        group By
          observations."osmObjectId",
          answers."questionId",
          questions.type
        having
          questions.type = 'boolean'
      ) as answer_totals
  `)).rows[0];

  const stats = {
    placesCount: parseInt(totalOsmObjects.count),
    nonPlasticPlacesCount: parseInt(placeStats.mostly_true),
    surveyedPlacesCount: parseInt(placeStats.total),
    surveyorsCount: parseInt(surveyors.count)
  };

  return stats;
}

function whereBuilder (builder, filterBy = {}) {
  const { observations, quadkey, q } = filterBy;

  if (quadkey) {
    builder.whereRaw('quadkey LIKE ?', [`${quadkey}%`]);
  }

  if (observations === 'true') {
    builder.whereRaw('"totalTrue" > "totalFalse"');
  } else if (observations === 'false') {
    builder.whereRaw('"totalTrue" < "totalFalse"');
  } else if (observations === 'no') {
    builder.where('total', 'is', null);
  }

  if (q) {
    builder.whereRaw("jsonb_to_tsvector('english', attributes, '[\"string\"]') @@ to_tsquery(?)", [q + ':*']);
  }
}

export async function getObservationData (osmObjectIds) {
  const { rows } = await db.raw(`
      select
        observations."osmObjectId",
        answers."questionId",
        count(answers.id)::int as total,
        count(
          (
            CASE
              WHEN answer :: jsonb -> 'value' = 'true' THEN 1
            END
          )
        )::int as total_true,
        count(
          (
            CASE
              WHEN answer :: jsonb -> 'value' = 'false' THEN 1
            END
          )
        )::int as total_false
      from answers
      left join observations ON answers."observationId" = observations.id
      left join questions ON answers."questionId" = questions.id
        AND answers."questionVersion" = questions.version
      group By
        observations."osmObjectId",
        answers."questionId",
        questions.type
      having
        questions.type = 'boolean'
        ${osmObjectIds &&
          osmObjectIds.length &&
          `AND array[observations."osmObjectId"]::text[]  <@ array['${osmObjectIds.join(
            "','"
          )}']::text[]`}
    `);

  return rows.reduce((acc, r) => {
    acc[r.osmObjectId] = r;
    delete acc[r.osmObjectId]['osmObjectId'];
    return acc;
  }, {});
}
