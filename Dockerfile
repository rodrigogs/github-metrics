FROM node:8.6.0

RUN curl -o- -L https://yarnpkg.com/install.sh | bash

ENV HOME=/usr/src/app

RUN mkdir -p $HOME

WORKDIR $HOME

COPY package.json yarn.lock $HOME/

RUN yarn install

COPY . $HOME

EXPOSE 3000

CMD ["yarn", "start"]
