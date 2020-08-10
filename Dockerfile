# we build on top of an already existing image maode for running Ruby code from Docker hub
FROM ruby:2.6.6
# install rails dependencies
RUN apt-get update -qq  && apt-get install -y build-essential libpq-dev nodejs libsqlite3-dev -y nodejs postgresql-client

RUN gem install bundler
# create a folder /myapp in the docker container and go into that folder

RUN mkdir /myapp
WORKDIR /myapp
# Copy the Gemfile and Gemfile.lock from app root directory into the /myapp/ folder in the docker container

COPY Gemfile /myapp/Gemfile
COPY Gemfile.lock /myapp/Gemfile.lock
# Run bundle install to install gems inside the gemfile
RUN bundle install

COPY . /myapp

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
EXPOSE 3001
#CMD rails server -b 0.0.0.0
CMD ["rails", "server", "-b", "0.0.0.0"]

# https://medium.com/@She_Daddy/dockerizing-your-react-rails-fullstack-app-with-docker-compose-part-1-35283de6cdf