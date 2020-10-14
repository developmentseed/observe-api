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

export async function getCampaign (id) {
  const campaign = await db('campaigns')
    .select({
      id: 'campaigns.id',
      name: 'campaigns.name',
      slug: 'campaigns.slug',
      createdAt: 'campaigns.createdAt',
      surveys: 'campaigns.surveys',
      aoi: db.raw('ST_AsGeoJSON(aoi)')
    })
    .where('id', '=', id)
    .first();

  return campaign;
}

export async function getCampaigns () {
  const campaigns = await db('campaigns')
    .select({
      id: 'campaigns.id',
      name: 'campaigns.name',
      slug: 'campaigns.slug',
      createdAt: 'campaigns.createdAt',
      surveys: 'campaigns.surveys',
      aoi: db.raw('ST_AsGeoJSON(aoi)')
    });

  return campaigns;
}
