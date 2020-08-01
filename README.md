# Sidekiq

In './config/application', declare `config.active_job.queue_adapter = :sidekiq`

In '/config/Dev-prod', provide `routes.default_url_options[:host] = 'http://localhost:3001'` (otherwise you get ActionView::Template::error missing link, provide :hst parameter, set default_url_options[:host])

# Knock

gem bcrypt, jwt, knock, dotnev-rails, racks-cors

```bash
> rails g knock:install
> rails g knock:token_controller user
```

```ruby
# /config/knock.rb
  config.token_secret_signature_key = -> { Rails.application.secrets.secret_key_base }
```

Include `Knock` in all controllers, set in parent class `ActionController::API`:

```ruby
# controllers/application_controller
class ApplicationController < ActionController::API
    include Knock::Authenticable
end
```

# Models & migration

Generate 3 models, `User`, `Itinary` & `Event` where `Event` is a joint table of `users` and `itinaries` (so contains 2 keys).

```bash
>rails generate model User email name password_digest confirm_token confirm_email:boolean access_token uid

>rails generate model Event participants:jsonb user:references itinary:references directCLurl publicID

>rails g model Itinary start end start_gps:array end_gps:array date:date picture

```

## Model User

```ruby
# /app/models/User.rb
lass User < ApplicationRecord
  # bcrypt
  has_secure_password

  # user is secondary key in Event and destroys events created by user if user deleted
  has_many :events, dependent: :destroy

  validates :email, uniqueness: true, presence: true
  validates :password_digest, presence: true

  def auth_params
    params.require(:auth).permit( :access_token, :email, :password_digest, :access_token)
  end
end
```

## Model Itinary

## Model Event

# Namespace routes

Endpoints will be `/api/v1/...`:

```ruby
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :users
      post '/get_token', to: 'user_token#create'
    end
  end
end
```

# Bootstrap

Install in `/client`:

```bash
> yarn add react-bootstrap bootstrap
```

and add in `index.js`:

```js
import "bootstrap/dist/css/bootstrap.min.css";
```

and use:

```js
import Button from "react-bootstrap/Button";
```

# foreman

Do not install `foreman` in the `Gemfile` but do (server side):

```bash
> gem install foreman
> bundle install
```

Append the `ProcFile` with the process (React front end, Rails API back end, Sidekiq...):

```
# ProcFile
web: cd client && PORT=3000 yarn run start
api: PORT=3001 && bundle exec rails s
worker: sidekiq (-t 25)?
```

and run `foreman start` to run both Weback and Rails servers.
For production: <http://blog.daviddollar.org/2011/05/06/introducing-foreman.html>

# React-Modal-Login

Client side:

```bash
yarn add react-modal-login
```

# Kill Rails

```
> kill -9 $(lsof -t -i tcp:3001)
```

# Fontawesome

client:

```bash
yarn add @fortawesome/fontawesome-svg-core
yarn add @fortawesome/free-solid-svg-icons
yarn add @fortawesome/react-fontawesome
```

<https://fontawesome.com/how-to-use/on-the-web/using-with/react>

Example:

```js
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { faCheckSquare, faCoffee } from "@fortawesome/free-solid-svg-icons";

library.add(fab, faCheckSquare, faCoffee);
```

then don't need to import, just use strings

```js
<FontAwesomeIcon icon="coffee" />
```

# CLoudinary

Go to Cloudinary dashboard and download cloudinary.yml and place it into '/config/cloudinary.yml'.
