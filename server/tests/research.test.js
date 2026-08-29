/**
 * Research Survey API Unit Tests
 * File: server/tests/research.test.js
 */

const { getSurveyData, updateSurveyData, DEFAULT_SURVEY_DATA } = require('../src/controllers/researchController');

describe('Research Survey Controller Unit Tests', () => {
  it('should return default research survey benchmarks with valid fields', async () => {
    const req = {};
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(payload) {
        this.body = payload;
        return this;
      }
    };
    const next = jest.fn();

    await getSurveyData(req, res, next);

    expect(res.body).toBeDefined();
    expect(res.body.success).toBe(true);
    expect(res.body.data.survey).toBeDefined();
    expect(res.body.data.survey.totalRespondents).toBeGreaterThan(1000);
    expect(res.body.data.survey.accessTimeByDistance.length).toBeGreaterThan(0);
    expect(res.body.data.survey.pharmacyDensityVsStockOut.length).toBeGreaterThan(0);
  });

  it('should update research survey metrics when valid payload is passed', async () => {
    const req = {
      body: {
        totalRespondents: 1850,
        avgQuickMedsEtaMins: 17.5,
        emergencyStockOutRatePercent: 39.5
      }
    };
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(payload) {
        this.body = payload;
        return this;
      }
    };
    const next = jest.fn();

    await updateSurveyData(req, res, next);

    expect(res.body).toBeDefined();
    expect(res.body.success).toBe(true);
    expect(res.body.data.survey.totalRespondents).toBe(1850);
    expect(res.body.data.survey.avgQuickMedsEtaMins).toBe(17.5);
    expect(res.body.data.survey.emergencyStockOutRatePercent).toBe(39.5);
  });
});
