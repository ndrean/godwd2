  Rails.application.routes.draw do
    namespace :api do
      namespace :v1 do
        resources :users, only: [:index, :show, :profile]
        post '/getUserToken', to: 'user_token#create'
        get '/profile', to: 'users#profile'
        post '/createUser', to: 'users#create_user'
        get '/mailconfirmation', to: 'users#confirmed_email'
        post '/findCreateFbUser', to: 'users#find_create_with_fb'

      end
    end
    
  end

