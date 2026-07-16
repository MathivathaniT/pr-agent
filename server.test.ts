/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createServerApp } from './server';
import { Express } from 'express';

describe('Server API Endpoints', () => {
  let app: Express;

  beforeAll(async () => {
    // Set NODE_ENV to test to prevent server from starting and Vite from using middleware mode which could take long
    process.env.NODE_ENV = 'test';
    const serverResult = await createServerApp();
    app = serverResult.app;
  });

  it('GET /api/health should return healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'healthy', engine: 'Vite + Express Simulation Backend' });
  });

  it('GET /api/repositories should return a list of repositories', async () => {
    const res = await request(app).get('/api/repositories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
  });

  it('POST /api/repositories should create a new repository', async () => {
    const newRepo = {
      name: 'test-repo',
      fullName: 'org/test-repo',
      branchesWhitelist: 'main',
      customReviewInstructions: 'Test instructions'
    };

    const res = await request(app)
      .post('/api/repositories')
      .send(newRepo);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('test-repo');
  });

  it('POST /api/repositories without required fields should return 400', async () => {
    const res = await request(app)
      .post('/api/repositories')
      .send({ name: 'test' }); // missing fullName

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing required properties');
  });

});
