// Enable ECMAScript module loader
require = require("esm")(module); // eslint-disable-line

const { getRandomInt } = require('../test/utils/mock-factory');
const { createObservation } = require('../app/models/observations');

function generateAnswerValue (q) {
  switch (q.type) {
    case 'boolean':
      return Math.random() > 0.3;
    default:
      return [
        'Nostrud consequat veniam et eu minim ex minim labore magna cupidatat Lorem Lorem proident ad.',
        'Amet mollit velit labore dolor sint id minim tempor nisi ullamco aute',
        'Id esse tempor sunt sit ut. Id dolore aliquip non ea excepteur. Id sint incididunt',
        'Lorem tempor ex enim occaecat ullamco ad Lorem commodo.',
        'Officia velit quis labore ipsum sunt id reprehenderit duis fugiat consectetur.',
        'Cillum velit adipisicing ex do enim ullamco ea eiusmod ad veniam reprehenderit.',
        'Aute magna officia duis reprehenderit reprehenderit officia minim sint adipisicing deserunt officia anim.'
      ][getRandomInt(6)];
  }
}

exports.seed = async function (knex) {
  console.log("Seeding surveys..."); // eslint-disable-line

  const surveys = await knex('surveys').select('*');

  // For each survey
  for (let s = 0; s < surveys.length; s++) {
    const survey = surveys[s];
    const questions = await knex('questions').whereIn('id', survey.questions);

    const places = await knex('osm_objects')
      .select('id', 'attributes as properties')
      .offset(500)
      .limit(1 + getRandomInt(200));
    for (let p = 0; p < places.length; p++) {
      const place = places[p];

      const users = await knex('users')
        .select('*')
        .limit(1 + getRandomInt(10));

      for (let u = 0; u < users.length; u++) {
        const user = users[u];

        const observation = {
          surveyId: survey.id,
          osmObject: place,
          userId: user.osmId,
          createdAt: new Date().toISOString(),
          answers: questions.map(q => {
            return {
              questionId: q.id,
              questionVersion: q.version,
              answer: {
                value: generateAnswerValue(q)
              }
            };
          })
        }

        await createObservation(observation);
      }
    }
  }
};
