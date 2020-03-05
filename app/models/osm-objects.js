import db from '../services/db';
import { stringify as geojsonTowkt } from 'wellknown';

export async function createOsmObject (data, trx) {
  const wkt = geojsonTowkt(data.geometry);
  const response = await db('osm_objects')
    .insert({
      id: data.id,
      geom: wkt,
      attributes: data.properties
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
