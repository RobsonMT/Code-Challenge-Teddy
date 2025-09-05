import { Url } from 'src/urls/entities/url.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(String(process.env.DB_PORT), 10) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Url],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: true, // use migrações!
  logging: false,
};

export default new DataSource(dataSourceOptions);
