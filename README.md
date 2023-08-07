# codecaptain.ai

A dev advisor to ask about your code and project

## How to start the python server

Use the command `python uvicorn pyserver:app --reload --app-dir=ai` to start the python server. It takes default port 8000.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/geprog/codecaptain)

## Database

We are using Drizzle ORM and sqlite as of now. The schemas need to be inside db/schemas and the migrations will be inside db/migrations. checkout `drizzle.config.ts` for the settings.
use `pnpm push-schema` to directly update the database with new table schemas. This is only intended for development only. Use other commands along with `await migrate(db, { migrationsFolder: "" });` function call in a production environment. More information [https://orm.drizzle.team/kit-docs/quick](here). User `pnpm db-exporer` to open drizzle studio which is in beta state right now.

## Appreciations

- https://hackernoon.com/reverse-engineering-reddits-source-code-with-langchain-and-gpt-4
