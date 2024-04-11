# codecaptain.ai

A dev advisor to ask about your code and project

## Development

You can start developing on this project by using [![Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/geprog/codecaptain).

Or you can run it locally. You will need to have

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [pnpm](https://pnpm.io/installation)
- [Node.js](https://nodejs.org/en/download/)
  installed.

You need an OpenAI API key to run the project. You can get one by signing up at [OpenAI](https://platform.openai.com/signup).

And you need a Github OAuth app to run the project. You can create one at [Github Developer Settings](https://github.com/settings/applications/new).

Enter the OpenAI API key and Github OAuth app credentials in the `.env` file. You can use the `.env.sample` file as a template.

Start the project by running the following commands:

```bash
# start vectorstore
docker-compose up -d

# install dependencies and set up the database
pnpm install
pnpm db:up

# start the server
pnpm start
```

### Migrations

- To generate new migrations run: `pnpm db:generate-migration`
- To migrate the database and seed it run: `pnpm db:up`
- To open the database explorer run: `pnpm db:explorer`

## Appreciations

- https://hackernoon.com/reverse-engineering-reddits-source-code-with-langchain-and-gpt-4
- https://js.langchain.com/docs/use_cases/code_understanding
