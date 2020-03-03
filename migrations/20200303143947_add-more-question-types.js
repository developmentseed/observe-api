
exports.up = function (knex) {
  return knex.schema.raw(`
    ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "questions_type_check",
    ADD CONSTRAINT "questions_type_check" CHECK (type = ANY (ARRAY['boolean'::text, 'multiple_choice'::text, 'range'::text, 'text'::text, 'date'::text, 'timestamp'::text, 'number'::text, 'photo'::text, 'radio'::text, 'checkbox'::text]))`
  );
};

exports.down = function (knex) {
  return knex.schema.raw(`
    ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "questions_type_check",
    ADD CONSTRAINT "questions_type_check" CHECK (type = ANY (ARRAY['boolean'::text, 'multiple_choice'::text, 'range'::text, 'text'::text, 'date'::text, 'timestamp'::text]))`
  );
};
