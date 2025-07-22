import Joi from 'joi';

export const validationSchema = Joi.object({
  // 데이터베이스 설정
  DB_TYPE: Joi.string()
    .valid('postgres', 'mysql', 'mariadb')
    .default('postgres'),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),

  // JWT 설정
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),

  // 네이버 OAuth
  NAVER_CLIENT_ID: Joi.string().required(),
  NAVER_CLIENT_SECRET: Joi.string().required(),
  NAVER_CALLBACK_URL: Joi.string().uri(),

  // 네이버 클라우드 플랫폼
  NCP_ACCESS_KEY: Joi.string(),
  NCP_SECRET_KEY: Joi.string(),
  NCP_SERVICE_ID: Joi.string(),
  NCP_CALLING_NUMBER: Joi.string(),

  // 관리자 계정
  ADMIN_EMAIL: Joi.string().email().required(),
  ADMIN_PASSWORD: Joi.string().min(6).required(),

  // 애플리케이션 설정
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  UPLOAD_PATH: Joi.string().default('./uploads'),
  MAX_FILE_SIZE: Joi.number().default(10485760), // 10MB
});
