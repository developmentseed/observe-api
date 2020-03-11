import db from '../services/db';
import logger from '../services/logger';
import { stringify as geojsonTowkt } from 'wellknown';

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

export async function getOsmObjectsByQuadkey (quadkey) {
  const osmObjects = await db('osm_objects')
    .select(['id', db.raw('ST_AsGeoJSON(geom) as geometry'), 'attributes'])
    .whereRaw('quadkey LIKE ?', [`${quadkey}%`]);

  if (!osmObjects) return null;

  const featureCollection = osmObjects.reduce((featureCollection, osmObject) => {
    const feature = {
      'id': osmObject.id,
      'type': 'Feature',
      'geometry': JSON.parse(osmObject.geometry),
      'properties': osmObject.attributes
    };
    featureCollection.features.push(feature);
    return featureCollection;
  }, {
    'type': 'FeatureCollection',
    'features': []
  });
  return featureCollection;
}
