web: cd client && PORT=3000 yarn run start
api: PORT=3001 && bundle exec puma -C config/puma.rb
worker: bundle exec sidekiq
redis: redis-server --port 6379