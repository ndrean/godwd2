# Sidekiq.configure_server do |config|
#   config.redis = { url: 'redis://redis.example.com:7372/0' }
# end

Sidekiq.configure_client do |config|
  config.redis = { 
    host: ENV['REDIS_HOST'],
    port: ENV['REDIS_PORT'] || '6379' 
  }
end

Sidekiq.configure_server do |config|
  config.redis = {
    host: ENV['REDIS_HOST'],
    port: ENV['REDIS_PORT'] || '6379'
  }
end