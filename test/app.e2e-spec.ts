import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { Repository } from 'typeorm';
import { sign as jwtSign } from 'jsonwebtoken';
import { User } from '../src/users/user.entity';
import * as bcrypt from 'bcrypt';
import { Product } from '../src/products/product.entity';
import { Roles } from '../src/constants/Roles';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = '3GL^xTzmEWcd8-g';
describe('App (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let userRepository: Repository<User>;
  let productRepository: Repository<Product>;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    productRepository = moduleFixture.get<Repository<Product>>(
      getRepositoryToken(Product),
    );

    await app.init();
  });

  afterEach(async () => {
    await getConnection().synchronize(true);
  });

  afterAll(async () => {
    await moduleFixture.close();
    await app.close();
  });

  it('/health (GET)', async () => {
    const { body, status } = await request(app.getHttpServer()).get('/health');
    expect(status).toBe(200);
    expect(body).toMatchObject({
      status: true,
      message: 'System is up',
    });
  });

  describe('UserModule', () => {
    describe('POST /users', () => {
      it('Should throw error when no payload is not provided', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/users')
          .send({});

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });

        expect(body.message).toEqual(
          expect.arrayContaining([
            'username should not be empty',
            'username must be a string',
            'password should not be empty',
            'password must be a string',
            'Role must be `BUYER` or `SELLER`',
            'Role must be `BUYER` or `SELLER`',
          ]),
        );
      });

      it('Error should not be username related', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/users')
          .send({
            username: 'iamraphson',
          });

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });

        expect(body.message).toEqual(
          expect.arrayContaining([
            'password should not be empty',
            'password must be a string',
            'Role must be `BUYER` or `SELLER`',
            'Role must be `BUYER` or `SELLER`',
          ]),
        );

        expect(body.message).toEqual(
          expect.not.arrayContaining([
            'username should not be empty',
            'username must be a string',
          ]),
        );
      });

      it('Error should not be password related', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/users')
          .send({
            username: 'iamraphson',
            password: 'vibesKiller',
          });

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });

        expect(body.message).toEqual(
          expect.arrayContaining([
            'Role must be `BUYER` or `SELLER`',
            'Role must be `BUYER` or `SELLER`',
          ]),
        );

        expect(body.message).toEqual(
          expect.not.arrayContaining([
            'password should not be empty',
            'password must be a string',
            'username should not be empty',
            'username must be a string',
          ]),
        );
      });

      it('Error should if role is not valid', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/users')
          .send({
            username: 'iamraphson',
            password: 'vibesKiller',
            role: 'ADMIN',
          });

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });

        expect(body.message).toEqual(
          expect.arrayContaining([
            'Role must be `BUYER` or `SELLER`',
            'Role must be `BUYER` or `SELLER`',
          ]),
        );
      });

      it('Should create seller account', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/users')
          .send({
            username: 'iamraphson-seller',
            password: 'vibesKiller',
            role: 'SELLER',
          });

        expect(status).toBe(201);
        expect(body).toMatchObject({
          message: 'User Created',
          data: {
            username: 'iamraphson-seller',
            role: 'SELLER',
          },
        });

        expect(Object.keys(body.data)).toEqual(
          expect.arrayContaining(['id', 'created_at', 'updated_at']),
        );
      });

      it('Should create buyer account', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/users')
          .send({
            username: 'iamraphson-buyer',
            password: 'vibesKiller',
            role: 'BUYER',
          });

        expect(status).toBe(201);
        expect(body).toMatchObject({
          message: 'User Created',
          data: {
            username: 'iamraphson-buyer',
            role: 'BUYER',
          },
        });

        expect(Object.keys(body.data)).toEqual(
          expect.arrayContaining(['id', 'created_at', 'updated_at']),
        );
      });
    });

    describe('GET /users', () => {
      it('Should throw error because user is not authentication', async () => {
        const { body, status } = await request(app.getHttpServer()).get(
          '/users',
        );

        expect(status).toBe(401);
        expect(body).toMatchObject({
          statusCode: 401,
          message: 'Unauthorized',
        });
      });

      it('Should fail because jwt user is not found', async () => {
        await userRepository.save([
          {
            username: 'iamraphson-seller',
            password: await bcrypt.hash('iamraphson-seller', 10),
            role: 'SELLER',
            id: 1,
          },
        ]);

        const token = jwtSign(
          {
            userId: 191,
            role: 'SELLER',
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '1d',
          },
        );

        const { body, status } = await request(app.getHttpServer())
          .get('/users')
          .set({ Authorization: `Bearer ${token}` });

        expect(status).toBe(401);
        expect(body.message).toBe('Unauthorized user');
      });

      it('Should return users', async () => {
        await userRepository.save([
          {
            username: 'iamraphson-seller',
            password: await bcrypt.hash('iamraphson-seller', 10),
            role: 'SELLER',
            id: 1,
          },
          {
            username: 'iamraphson-buyer',
            password: await bcrypt.hash('iamraphson-buyer', 10),
            role: 'BUYER',
            id: 2,
          },
        ]);

        const token = jwtSign(
          {
            userId: 1,
            role: 'SELLER',
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '1d',
          },
        );

        const { body, status } = await request(app.getHttpServer())
          .get('/users')
          .set({ Authorization: `Bearer ${token}` });

        expect(status).toBe(200);
        expect(body.message).toBe('Users Retrieved');
        expect(Object.keys(body.data[0])).toEqual(
          expect.arrayContaining([
            'id',
            'created_at',
            'updated_at',
            'username',
            'deposit',
            'role',
          ]),
        );
        expect(body.data[0]).toEqual(
          expect.objectContaining({
            id: 1,
            username: 'iamraphson-seller',
            deposit: 0,
            role: 'SELLER',
          }),
        );
      });
    });

    describe('GET /users/me', () => {
      it('Should throw error because user is not authentication', async () => {
        const { body, status } = await request(app.getHttpServer()).get(
          '/users/me',
        );

        expect(status).toBe(401);
        expect(body).toMatchObject({
          statusCode: 401,
          message: 'Unauthorized',
        });
      });

      it('Should return current login user', async () => {
        await userRepository.save([
          {
            username: 'iamraphson-seller',
            password: await bcrypt.hash('iamraphson-seller', 10),
            role: 'SELLER',
            id: 1,
          },
        ]);

        const token = jwtSign(
          {
            userId: 1,
            role: 'SELLER',
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '1d',
          },
        );

        const { body, status } = await request(app.getHttpServer())
          .get('/users/me')
          .set({ Authorization: `Bearer ${token}` });

        expect(status).toBe(200);
        expect(body.message).toBe('User Retrieved');
        expect(Object.keys(body.data)).toEqual(
          expect.arrayContaining([
            'id',
            'created_at',
            'updated_at',
            'username',
            'deposit',
            'role',
          ]),
        );
        expect(body.data).toEqual(
          expect.objectContaining({
            id: 1,
            username: 'iamraphson-seller',
            deposit: 0,
            role: 'SELLER',
          }),
        );
      });
    });

    describe('GET /users/:id', () => {
      it('Should throw error because user is not authentication', async () => {
        const { body, status } = await request(app.getHttpServer()).get(
          '/users/1',
        );

        expect(status).toBe(401);
        expect(body).toMatchObject({
          statusCode: 401,
          message: 'Unauthorized',
        });
      });

      it('Should return a user detail', async () => {
        await userRepository.save([
          {
            username: 'iamraphson-seller',
            password: await bcrypt.hash('iamraphson-seller', 10),
            role: 'SELLER',
            id: 1,
          },
          {
            username: 'iamraphson-buyer',
            password: await bcrypt.hash('iamraphson-buyer', 10),
            role: 'BUYER',
            id: 2,
          },
        ]);

        const token = jwtSign(
          {
            userId: 1,
            role: 'SELLER',
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '1d',
          },
        );

        const { body, status } = await request(app.getHttpServer())
          .get('/users/2')
          .set({ Authorization: `Bearer ${token}` });

        expect(status).toBe(200);
        expect(body.message).toBe('User Retrieved');
        expect(Object.keys(body.data)).toEqual(
          expect.arrayContaining([
            'id',
            'created_at',
            'updated_at',
            'username',
            'deposit',
            'role',
          ]),
        );
        expect(body.data).toEqual(
          expect.objectContaining({
            id: 2,
            username: 'iamraphson-buyer',
            deposit: 0,
            role: 'BUYER',
          }),
        );
      });
    });

    describe('PUT /users/me', () => {
      it('Should throw error because user is not authentication', async () => {
        const { body, status } = await request(app.getHttpServer()).put(
          '/users/me',
        );

        expect(status).toBe(401);
        expect(body).toMatchObject({
          statusCode: 401,
          message: 'Unauthorized',
        });
      });

      it('Should update current login user', async () => {
        await userRepository.save([
          {
            username: 'iamraphson-seller',
            password: await bcrypt.hash('iamraphson-seller', 10),
            role: 'SELLER',
            id: 1,
          },
        ]);

        const token = jwtSign(
          {
            userId: 1,
            role: 'SELLER',
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '1d',
          },
        );

        const { body, status } = await request(app.getHttpServer())
          .put('/users/me')
          .send({ username: 'iamraphson-seller-II' })
          .set({ Authorization: `Bearer ${token}` });

        expect(status).toBe(200);
        expect(body.message).toBe('User Updated');
        expect(Object.keys(body.data)).toEqual(
          expect.arrayContaining([
            'id',
            'created_at',
            'updated_at',
            'username',
            'deposit',
            'role',
          ]),
        );
        expect(body.data).toEqual(
          expect.objectContaining({
            id: 1,
            username: 'iamraphson-seller-II',
            deposit: 0,
            role: 'SELLER',
          }),
        );
      });
    });

    describe('PUT /users/:id', () => {
      it('Should throw error because user is not authentication', async () => {
        const { body, status } = await request(app.getHttpServer())
          .put('/users/2')
          .send({ username: '411' });

        expect(status).toBe(401);
        expect(body).toMatchObject({
          statusCode: 401,
          message: 'Unauthorized',
        });
      });

      it('Should throw error if user is not found', async () => {
        await userRepository.save([
          {
            username: 'iamraphson-seller',
            password: await bcrypt.hash('iamraphson-seller', 10),
            role: 'SELLER',
            id: 1,
          },
        ]);
        const token = jwtSign(
          {
            userId: 1,
            role: 'SELLER',
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '1d',
          },
        );
        const { body, status } = await request(app.getHttpServer())
          .put('/users/911')
          .set({ Authorization: `Bearer ${token}` })
          .send({ username: '411' });

        expect(status).toBe(404);
        expect(body).toMatchObject({
          statusCode: 404,
          message: 'User not found',
        });
      });

      it('Should update current user', async () => {
        await userRepository.save([
          {
            username: 'iamraphson-seller',
            password: await bcrypt.hash('iamraphson-seller', 10),
            role: 'SELLER',
            id: 1,
          },
          {
            username: 'iamraphson-buyer',
            password: await bcrypt.hash('iamraphson-buyer', 10),
            role: 'BUYER',
            id: 2,
          },
        ]);

        const token = jwtSign(
          {
            userId: 1,
            role: 'SELLER',
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '1d',
          },
        );

        const { body, status } = await request(app.getHttpServer())
          .put('/users/2')
          .send({
            username: 'iamraphson-seller-007',
            role: 'SELLER',
          })
          .set({ Authorization: `Bearer ${token}` });

        expect(status).toBe(200);
        expect(body.message).toBe('User Updated');
        expect(Object.keys(body.data)).toEqual(
          expect.arrayContaining([
            'id',
            'created_at',
            'updated_at',
            'username',
            'deposit',
            'role',
          ]),
        );
        expect(body.data).toEqual(
          expect.objectContaining({
            id: 2,
            username: 'iamraphson-seller-007',
            deposit: 0,
            role: 'SELLER',
          }),
        );
      });
    });

    describe('DELETE /users/:id', () => {
      it('Should throw error because user is not authentication', async () => {
        const { body, status } = await request(app.getHttpServer()).delete(
          '/users/2',
        );

        expect(status).toBe(401);
        expect(body).toMatchObject({
          statusCode: 401,
          message: 'Unauthorized',
        });
      });

      it('Should throw error if user is not found during delete', async () => {
        await userRepository.save([
          {
            username: 'iamraphson-seller',
            password: await bcrypt.hash('iamraphson-seller', 10),
            role: 'SELLER',
            id: 1,
          },
        ]);
        const token = jwtSign(
          {
            userId: 1,
            role: 'SELLER',
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '1d',
          },
        );
        const { body, status } = await request(app.getHttpServer())
          .delete('/users/911')
          .set({ Authorization: `Bearer ${token}` });

        expect(status).toBe(404);
        expect(body).toMatchObject({
          statusCode: 404,
          message: 'User not found',
        });
      });

      it('Should update current user', async () => {
        await userRepository.save([
          {
            username: 'iamraphson-seller',
            password: await bcrypt.hash('iamraphson-seller', 10),
            role: 'SELLER',
            id: 1,
          },
          {
            username: 'iamraphson-buyer',
            password: await bcrypt.hash('iamraphson-buyer', 10),
            role: 'BUYER',
            id: 2,
          },
        ]);

        const token = jwtSign(
          {
            userId: 1,
            role: 'SELLER',
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '1d',
          },
        );

        const { status } = await request(app.getHttpServer())
          .delete('/users/2')
          .set({ Authorization: `Bearer ${token}` });

        expect(status).toBe(204);
      });
    });
  });

  describe('AuthModule', () => {
    describe('POST /auth/login', () => {
      it('Should throw error because credential is not correct', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            username: 'Evergreen',
            password: 'babalola',
          });

        expect(status).toBe(401);
        expect(body).toMatchObject({
          statusCode: 401,
          message: 'Incorrect Credential',
        });
      });

      it('Should login successful', async () => {
        await userRepository.save([
          {
            username: 'iamraphson-seller',
            password: await bcrypt.hash('iamraphson-seller-password', 10),
            role: 'SELLER',
            id: 1,
          },
        ]);
        const { body, status } = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            username: 'iamraphson-seller',
            password: 'iamraphson-seller-password',
          });

        expect(status).toBe(200);
        expect(body.message).toBe('Login Successful');
        expect(Object.keys(body.data)).toEqual(
          expect.arrayContaining(['role', 'username', 'access_token']),
        );
        expect(body.data).toEqual(
          expect.objectContaining({
            username: 'iamraphson-seller',
            role: 'SELLER',
          }),
        );
      });
    });
  });

  describe('ProductModule', () => {
    let newUsers: User[] = [];
    let tokens: Record<string, string> = {};
    beforeEach(async () => {
      newUsers = await userRepository.save([
        {
          username: 'iamraphson-seller',
          password: await bcrypt.hash('iamraphson-seller', 10),
          role: 'SELLER',
        },
        {
          username: 'iamraphson-buyer',
          password: await bcrypt.hash('iamraphson-buyer', 10),
          role: 'BUYER',
        },
      ]);

      tokens = newUsers.reduce((acc, user) => {
        return {
          ...acc,
          [user.role]: jwtSign(
            {
              userId: user.id,
              role: user.role,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: '1d',
            },
          ),
        };
      }, {});
    });

    describe('POST /products', () => {
      it('Should throw error when buyer tries to create a product', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/products')
          .set({ Authorization: `Bearer ${tokens[Roles.BUYER]}` })
          .send({});

        expect(status).toBe(403);
        expect(body).toMatchObject({
          statusCode: 403,
          message: 'Forbidden resource',
        });
      });

      it('Should throw error when payload is not provided', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/products')
          .set({ Authorization: `Bearer ${tokens[Roles.SELLER]}` })
          .send({});

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });

        expect(body.message).toEqual(
          expect.arrayContaining([
            'amount_available must be an integer number',
            'amount_available should not be empty',
            'amount_available must not be less than 1',
            'cost must be an integer number',
            'cost should not be empty',
            'cost must not be less than 5',
            'product_name should not be empty',
            'product_name must be a string',
          ]),
        );
      });

      it('Should throw error when cost and amount available is not provided', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/products')
          .set({ Authorization: `Bearer ${tokens[Roles.SELLER]}` })
          .send({
            product_name: 'Fanta Drink',
          });

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });

        expect(body.message).toEqual(
          expect.arrayContaining([
            'amount_available must be an integer number',
            'amount_available should not be empty',
            'amount_available must not be less than 1',
            'cost must be an integer number',
            'cost should not be empty',
            'cost must not be less than 5',
          ]),
        );

        expect(body.message).toEqual(
          expect.not.arrayContaining([
            'product_name should not be empty',
            'product_name must be a string',
          ]),
        );
      });

      it('Should throw error when cost is less than 5', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/products')
          .set({ Authorization: `Bearer ${tokens[Roles.SELLER]}` })
          .send({
            product_name: 'Fanta Drink',
            cost: 2,
          });

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });

        expect(body.message).toEqual(
          expect.arrayContaining([
            'amount_available must be an integer number',
            'amount_available should not be empty',
            'amount_available must not be less than 1',
            'cost must not be less than 5',
          ]),
        );

        expect(body.message).toEqual(
          expect.not.arrayContaining([
            'product_name should not be empty',
            'product_name must be a string',
            'cost must be an integer number',
            'cost should not be empty',
          ]),
        );
      });

      it('Should throw error when amount available is not provided', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/products')
          .set({ Authorization: `Bearer ${tokens[Roles.SELLER]}` })
          .send({
            product_name: 'Fanta Drink',
            cost: 5,
          });

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });

        expect(body.message).toEqual(
          expect.arrayContaining([
            'amount_available must be an integer number',
            'amount_available should not be empty',
            'amount_available must not be less than 1',
          ]),
        );

        expect(body.message).toEqual(
          expect.not.arrayContaining([
            'product_name should not be empty',
            'product_name must be a string',
            'cost must be an integer number',
            'cost should not be empty',
            'cost must not be less than 5',
          ]),
        );
      });

      it('Should throw error when cost is not multiple of 5', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/products')
          .set({ Authorization: `Bearer ${tokens[Roles.SELLER]}` })
          .send({
            product_name: 'Fanta Drink',
            cost: 7,
            amount_available: 100,
          });

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          message: 'Product cost is not multiple of 5',
        });
      });

      it('Should create product successful', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/products')
          .set({ Authorization: `Bearer ${tokens[Roles.SELLER]}` })
          .send({
            product_name: 'Fanta Drink',
            cost: 15,
            amount_available: 100,
          });

        expect(status).toBe(201);
        expect(body).toMatchObject({
          message: 'Product Created',
          data: {
            amount_available: 100,
            cost: 15,
            product_name: 'Fanta Drink',
            seller: 1,
          },
        });

        expect(Object.keys(body.data)).toEqual(
          expect.arrayContaining(['id', 'created_at', 'updated_at']),
        );
      });
    });

    describe('GET /products', () => {
      it('Should return products', async () => {
        await productRepository.save([
          {
            amount_available: 100,
            cost: 15,
            product_name: 'Fanta',
            seller: 1,
          },
          {
            amount_available: 200,
            cost: 20,
            product_name: 'Cola',
            seller: 1,
          },
        ]);

        const { body, status } = await request(app.getHttpServer()).get(
          '/products',
        );

        expect(status).toBe(200);
        expect(body.message).toBe('Products Retrieved');
        expect(Object.keys(body.data[0])).toEqual(
          expect.arrayContaining([
            'id',
            'created_at',
            'updated_at',
            'amount_available',
            'cost',
            'product_name',
            'seller',
          ]),
        );
        expect(body.data[0]).toEqual(
          expect.objectContaining({
            id: 1,
            amount_available: 100,
            cost: 15,
            product_name: 'Fanta',
          }),
        );
        expect(typeof body.data[0].seller).toBe('object');
      });
    });

    describe('GET /products/:id', () => {
      it('Should return a product', async () => {
        const products: Product[] = await productRepository.save([
          {
            amount_available: 100,
            cost: 15,
            product_name: 'Fanta',
            seller: 1,
          },
          {
            amount_available: 200,
            cost: 20,
            product_name: 'Cola',
            seller: 1,
          },
        ]);

        const { body, status } = await request(app.getHttpServer()).get(
          `/products/${products[0].id}`,
        );

        expect(status).toBe(200);
        expect(body.message).toBe('Product Retrieved');
        expect(Object.keys(body.data)).toEqual(
          expect.arrayContaining([
            'id',
            'created_at',
            'updated_at',
            'amount_available',
            'cost',
            'product_name',
            'seller',
          ]),
        );
        expect(body.data).toEqual(
          expect.objectContaining({
            id: products[0].id,
            amount_available: products[0].amount_available,
            cost: products[0].cost,
            product_name: products[0].product_name,
          }),
        );
        expect(typeof body.data.seller).toBe('object');
      });
    });

    describe('PUT /products/:id', () => {
      let products: Product[] = [];
      beforeEach(async () => {
        products = await productRepository.save([
          {
            amount_available: 100,
            cost: 15,
            product_name: 'Fanta',
            seller: newUsers[0].id,
          },
          {
            amount_available: 200,
            cost: 20,
            product_name: 'Cola',
            seller: newUsers[0].id,
          },
          {
            amount_available: 200,
            cost: 20,
            product_name: '5 Alive',
            seller: newUsers[1].id,
          },
        ]);
      });

      it('Should throw error when buyer tries to edit a product', async () => {
        const { body, status } = await request(app.getHttpServer())
          .put(`/products/${products[0]}.id`)
          .set({ Authorization: `Bearer ${tokens[Roles.BUYER]}` })
          .send({});

        expect(status).toBe(403);
        expect(body).toMatchObject({
          statusCode: 403,
          message: 'Forbidden resource',
        });
      });

      it('Should throw error when seller tries to edit a product with different seller', async () => {
        const { body, status } = await request(app.getHttpServer())
          .put(`/products/${products[2].id}`)
          .set({ Authorization: `Bearer ${tokens[Roles.SELLER]}` })
          .send({});

        expect(status).toBe(403);
        expect(body).toMatchObject({
          statusCode: 403,
          message: "You can't edit this product.",
        });
      });

      it('Should update product successfully', async () => {
        const { body, status } = await request(app.getHttpServer())
          .put(`/products/${products[0].id}`)
          .set({ Authorization: `Bearer ${tokens[Roles.SELLER]}` })
          .send({
            cost: 25,
            product_name: 'Fanta II',
          });

        expect(status).toBe(200);
        expect(body.message).toBe('Product Updated');
        expect(Object.keys(body.data)).toEqual(
          expect.arrayContaining([
            'id',
            'created_at',
            'updated_at',
            'amount_available',
            'cost',
            'product_name',
            'seller',
          ]),
        );
        expect(body.data).toEqual(
          expect.objectContaining({
            id: products[0].id,
            amount_available: products[0].amount_available,
            cost: 25,
            product_name: 'Fanta II',
          }),
        );
        expect(typeof body.data.seller).toBe('object');
      });
    });

    describe('DELETE /products/:id', () => {
      let products: Product[] = [];
      beforeEach(async () => {
        products = await productRepository.save([
          {
            amount_available: 100,
            cost: 15,
            product_name: 'Fanta',
            seller: newUsers[0].id,
          },
          {
            amount_available: 200,
            cost: 20,
            product_name: 'Cola',
            seller: newUsers[0].id,
          },
          {
            amount_available: 200,
            cost: 20,
            product_name: '5 Alive',
            seller: newUsers[1].id,
          },
        ]);
      });

      it('Should throw error when buyer tries to delete a product', async () => {
        const { body, status } = await request(app.getHttpServer())
          .delete(`/products/${products[0]}.id`)
          .set({ Authorization: `Bearer ${tokens[Roles.BUYER]}` });

        expect(status).toBe(403);
        expect(body).toMatchObject({
          statusCode: 403,
          message: 'Forbidden resource',
        });
      });

      it('Should throw error when seller tries to delete a product with different seller', async () => {
        const { body, status } = await request(app.getHttpServer())
          .delete(`/products/${products[2].id}`)
          .set({ Authorization: `Bearer ${tokens[Roles.SELLER]}` });

        expect(status).toBe(403);
        expect(body).toMatchObject({
          statusCode: 403,
          message: "You can't delete this product.",
        });
      });

      it('Should delete product successfully', async () => {
        const { body, status } = await request(app.getHttpServer())
          .delete(`/products/${products[0].id}`)
          .set({ Authorization: `Bearer ${tokens[Roles.SELLER]}` });

        expect(status).toBe(204);
      });
    });
  });

  describe('SystemModule', () => {
    let newUsers: User[] = [];
    let products: Product[] = [];
    let tokens: Record<string, string> = {};
    beforeEach(async () => {
      newUsers = await userRepository.save([
        {
          username: 'iamraphson-seller',
          password: await bcrypt.hash('iamraphson-seller', 10),
          role: 'SELLER',
        },
        {
          username: 'iamraphson-buyer',
          password: await bcrypt.hash('iamraphson-buyer', 10),
          deposit: 50,
          role: 'BUYER',
        },
      ]);

      products = await productRepository.save([
        {
          amount_available: 100,
          cost: 15,
          product_name: 'Fanta',
          seller: newUsers[0].id,
        },
        {
          amount_available: 200,
          cost: 20,
          product_name: 'Cola',
          seller: newUsers[0].id,
        },
        {
          amount_available: 200,
          cost: 20,
          product_name: '5 Alive',
          seller: newUsers[0].id,
        },
      ]);

      tokens = newUsers.reduce((acc, user) => {
        return {
          ...acc,
          [user.role]: jwtSign(
            {
              userId: user.id,
              role: user.role,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: '1d',
            },
          ),
        };
      }, {});
    });

    describe('POST /deposit', () => {
      it('Should throw error when seller tries to deposit money', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/deposit')
          .set({ Authorization: `Bearer ${tokens[Roles.SELLER]}` })
          .send({});

        expect(status).toBe(403);
        expect(body).toMatchObject({
          statusCode: 403,
          message: 'Forbidden resource',
        });
      });

      it("Should throw error when buyer didn't  add payload", async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/deposit')
          .set({ Authorization: `Bearer ${tokens[Roles.BUYER]}` })
          .send({});

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });

        expect(body.message).toEqual(
          expect.arrayContaining(['Amount can either be 5, 10, 20,50 or 100']),
        );
      });

      it('Should throw error if amount is not 5, 10, 20, 50 or 100', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/deposit')
          .set({ Authorization: `Bearer ${tokens[Roles.BUYER]}` })
          .send({ amount: 150 });

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });

        expect(body.message).toEqual(
          expect.arrayContaining(['Amount can either be 5, 10, 20,50 or 100']),
        );
      });

      it('Should deposit money into buyer account.', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/deposit')
          .set({ Authorization: `Bearer ${tokens[Roles.BUYER]}` })
          .send({ amount: 50 });

        expect(status).toBe(200);
        expect(body).toMatchObject({
          message: 'Deposit Completed',
          data: { new_deposit: 100 },
        });
      });
    });

    describe('POST /reset', () => {
      it('Should throw error when seller tries to reset account', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/reset')
          .set({ Authorization: `Bearer ${tokens[Roles.SELLER]}` })
          .send({});

        expect(status).toBe(403);
        expect(body).toMatchObject({
          statusCode: 403,
          message: 'Forbidden resource',
        });
      });

      it('Should reset buyer account.', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/reset')
          .set({ Authorization: `Bearer ${tokens[Roles.BUYER]}` })
          .send({ amount: 50 });

        expect(status).toBe(200);
        expect(body).toMatchObject({
          message: 'Reset Complete',
          data: { new_deposit: 0 },
        });
      });
    });

    describe('POST /buy', () => {
      it('Should throw error when seller tries to reset account', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/buy')
          .set({ Authorization: `Bearer ${tokens[Roles.SELLER]}` })
          .send({});

        expect(status).toBe(403);
        expect(body).toMatchObject({
          statusCode: 403,
          message: 'Forbidden resource',
        });
      });

      it('Should throw error when payload is not provided', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/buy')
          .set({ Authorization: `Bearer ${tokens[Roles.BUYER]}` })
          .send({});

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });

        expect(body.message).toEqual(
          expect.arrayContaining([
            'product_id must be an integer number',
            'product_quantity must be an integer number',
            'product_quantity must not be less than 1',
          ]),
        );
      });

      it('Should throw error when product quantity is not provided', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/buy')
          .set({ Authorization: `Bearer ${tokens[Roles.BUYER]}` })
          .send({ product_id: 911 });

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
        });

        expect(body.message).toEqual(
          expect.arrayContaining([
            'product_quantity must be an integer number',
            'product_quantity must not be less than 1',
          ]),
        );

        expect(body.message).toEqual(
          expect.not.arrayContaining(['product_id must be an integer number']),
        );
      });

      it('Should throw error when product is not found', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/buy')
          .set({ Authorization: `Bearer ${tokens[Roles.BUYER]}` })
          .send({
            product_id: 911,
            product_quantity: 300,
          });

        expect(status).toBe(404);
        expect(body).toMatchObject({
          statusCode: 404,
          message: 'Product not found!',
        });
      });

      it('Should throw error if product is out of stock', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/buy')
          .set({ Authorization: `Bearer ${tokens[Roles.BUYER]}` })
          .send({
            product_id: products[0].id,
            product_quantity: 300,
          });

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          message: 'Product is out of stock!',
        });
      });

      it('Should throw error if buyer has insufficient balance', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/buy')
          .set({ Authorization: `Bearer ${tokens[Roles.BUYER]}` })
          .send({
            product_id: products[0].id,
            product_quantity: 75,
          });

        expect(status).toBe(400);
        expect(body).toMatchObject({
          statusCode: 400,
          message: 'Insufficient deposit!',
        });
      });

      it('Should throw error if buyer has insufficient balance', async () => {
        const { body, status } = await request(app.getHttpServer())
          .post('/buy')
          .set({ Authorization: `Bearer ${tokens[Roles.BUYER]}` })
          .send({
            product_id: products[0].id,
            product_quantity: 1,
          });

        console.log(status, body);
        expect(status).toBe(200);
        expect(body.total_spent).toBe(15);
        expect(typeof body.products).toBe('object');
        expect(body.products.length).toBe(1);
        expect(body.change).toMatchObject({
          balance: 35,
          breakdown: {
            '5': 1,
            '10': 1,
            '20': 1,
            '50': 0,
            '100': 0,
          },
        });
      });
    });
  });
});
