import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { TestingModule, Test } from '@nestjs/testing';
import { UserModule } from '../user.module';
import { AuthGuard } from '../../auth/guard';
import { authSetTokens, buildDefaultModules } from '../../../test';
import { resetData } from '../../../test/setup';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  let token: string;
  let csrfToken: string;

  beforeAll(async () => {
    await resetData();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [...buildDefaultModules(), UserModule],
      providers: [AuthGuard],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());

    await app.init();
    app.setGlobalPrefix('api');

    const tokens = await authSetTokens(app);
    token = tokens.jwtToken;
    csrfToken = tokens.csrfToken;
  });

  afterAll(() => {
    app.close();
  });

  describe('GET /me', () => {
    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/me').expect(401);
    });

    it('should return 200 and user data if authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/me')
        .set('Cookie', [`token=${token}`, `csrf-token=${csrfToken}`])
        .set('x-csrf-token', csrfToken)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 101,
        name: 'Alice',
        email: 'alice@example.com',
      });
    });
  });
});
