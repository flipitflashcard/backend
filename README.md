# How to start the project database

## First Step
Start MySQL database and create a databases named `flipit` into it.

## Second Step
Create a `.env` file exactly same as `.env.example` and modify the `DATABASE_URL`

Note: to set the DATABASE_URL in corrent way, please refer to [prisma docs](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/connect-your-database-node-mysql)

## Third Step
Run `npx prisma migrate dev --name init` to create prisma migrations and deploy it on database