FROM node:6.12

WORKDIR /app

EXPOSE 80

COPY ./init /usr/local/bin/
RUN chmod +x /usr/local/bin/init
RUN ln -s usr/local/bin/init /app
RUN npm i -g serverless

ENTRYPOINT ["init"]
