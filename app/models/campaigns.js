import db from '../services/db';
import { stringify as geojsonTowkt } from 'wellknown';

export async function createCampaign (data) {
  const { name, aoi, slug, surveys } = data;
  const wkt = geojsonTowkt(aoi);
  const [id] = await db('campaigns').insert(
    {
      name: name,
      slug: slug,
      aoi: wkt,
      surveys: surveys
    },
    'id'
  );
  return id;
}
