import db from '../services/db';
import { stringify as geojsonTowkt } from 'wellknown';
import { getSurveys } from './surveys';

export async function createCampaign (data) {
  const { name, aoi, slug, surveys, ownerId } = data;
  const wkt = geojsonTowkt(aoi);
  const [id] = await db('campaigns').insert(
    {
      name: name,
      slug: slug,
      aoi: wkt,
      surveys: surveys,
      ownerId: ownerId
    },
    'id'
  );
  return id;
}

export async function getCampaign (id) {
  const campaign = await db('campaigns')
    .select({
      id: 'campaigns.id',
      ownerId: 'campaigns.ownerId',
      name: 'campaigns.name',
      slug: 'campaigns.slug',
      createdAt: 'campaigns.createdAt',
      surveys: 'campaigns.surveys',
      aoi: db.raw('ST_AsGeoJSON(aoi)')
    })
    .where('id', '=', id)
    .first();

  if (campaign && campaign.surveys) {
    return populateSurveys(campaign);
  }

  return campaign;
}

export async function getCampaigns () {
  const campaigns = await db('campaigns')
    .select({
      id: 'campaigns.id',
      ownerId: 'campaigns.ownerId',
      name: 'campaigns.name',
      slug: 'campaigns.slug',
      createdAt: 'campaigns.createdAt',
      surveys: 'campaigns.surveys',
      aoi: db.raw('ST_AsGeoJSON(aoi)')
    })
    .map(populateSurveys);

  return campaigns;
}

async function populateSurveys (campaign) {
  if (campaign.surveys) {
    campaign.surveys = await getSurveys(campaign.surveys);
  }
  return campaign;
}

export async function updateCampaign (id, data) {
  const wkt = data.hasOwnProperty('aoi') ? geojsonTowkt(data.aoi) : undefined;
  if (wkt) {
    data.aoi = wkt;
  }
  const [ thisId ] = await db('campaigns')
    .where('id', '=', id)
    .update({
      ...data
    }, 'id');

  return thisId;
}

export async function deleteCampaign (id) {
  await db('campaigns')
    .delete()
    .where('id', id);
}
