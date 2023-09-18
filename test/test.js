const request = require('supertest');
const cheerio = require('cheerio');
const app = require('../app');

describe('App', function() {
  it('has the default page with the expected message', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        const $ = cheerio.load(res.text);
        const message = '';
        const isMessageVisible = $(`*:contains("${message}")`).length > 0;

        if (isMessageVisible) {
          done();
        } else {
          done(new Error(`Expected message "${message}" not found on the page.`));
        }
      });
  });
});
