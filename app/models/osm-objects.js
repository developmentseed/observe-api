import db from '../services/db';
import logger from '../services/logger';
import { stringify as geojsonTowkt } from 'wellknown';
import groupBy from 'lodash.groupby';

export async function createOsmObject (data, trx) {
  const wkt = geojsonTowkt(data.geometry);
  const response = await db('osm_objects')
    .insert({
      id: data.id,
      version: data.properties.version,
      geom: wkt,
      attributes: data.properties,
      quadkey: data.quadkey
    }, 'id')
    .transacting(trx);

  return response;
}

export async function getOsmObject (id) {
  const response = await db('osm_objects')
    .select()
    .where('id', id)
    .first();

  return response;
}

export async function insertFeatureCollection (geojson) {
  try {
    return await db.transaction(async trx => {
      for (let index = 0; index < geojson.features.length; index++) {
        const feature = geojson.features[index];
        await createOsmObject(feature, trx);
      }
      return geojson.features.length;
    });
  } catch (error) {
    logger.error(error);
  }
}

export async function getOsmObjects (quadkey, offset, limit) {
  const osmObjects = await db('osm_objects')
    .select(['id', db.raw('ST_AsGeoJSON(geom) as geometry'), 'attributes'])
    .where(builder => whereBuiler(builder, quadkey))
    .offset(offset)
    .limit(limit);

  if (!osmObjects) return null;

  const osmObjectIds = osmObjects.map(o => {
    return o.id;
  });

  const observationCounts = await getObservationData(osmObjectIds);
  const featureCollection = osmObjects.reduce((featureCollection, osmObject) => {
    const feature = {
      'id': osmObject.id,
      'type': 'Feature',
      'geometry': JSON.parse(osmObject.geometry),
      'properties': osmObject.attributes
    };

    feature.properties['observationCounts'] = null;
    if (observationCounts.hasOwnProperty(osmObject.id)) {
      feature.observationCounts = observationCounts[osmObject.id];
    }

    featureCollection.features.push(feature);
    return featureCollection;
  }, {
    'type': 'FeatureCollection',
    'features': []
  });
  return featureCollection;
}

export async function countOsmObjects (quadkey) {
  const [ counter ] = await db('osm_objects')
    .where(builder => whereBuiler(builder, quadkey))
    .countDistinct('osm_objects.id');

  return counter.count;
}

export async function getOsmObjectStats () {
  const [ countObservations ] = await db('osm_objects')
    .countDistinct('osm_objects.id')
    .join('observations', 'osm_objects.id', '=', 'observations.osmObjectId')
    .groupBy('osm_objects.id');

  const [ totalOsmObjects ] = await db('osm_objects')
    .countDistinct('id');

  const stats = {
    'total': parseInt(totalOsmObjects.count),
    'surveyed': parseInt(countObservations.count)
  };

  return stats;
}

function whereBuiler (builder, quadkey) {
  if (quadkey) {
    builder.whereRaw('quadkey LIKE ?', [`${quadkey}%`]);
  }
}

export async function getObservationData (osmObjectIds) {
  const counts = await db('observations')
    .select(db.raw('count(answers.id), answers."questionId", observations."osmObjectId", jsonb_array_elements((answers.answer->>\'answer\')::jsonb) as res'))
    .join('answers', 'answers.observationId', '=', 'observations.id')
    .whereIn('observations.osmObjectId', osmObjectIds)
    .groupBy(['answers.questionId', 'observations.osmObjectId', 'res']);

  const results = groupBy(counts, 'osmObjectId');
  return results;
}
