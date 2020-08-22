
api: PORT=3001 && bundle exec rails server -p $PORT
worker: bundle exec sidekiq
redis: redis-server --port 6379
release: bin/rake db:migrate && bin/rake db:seed