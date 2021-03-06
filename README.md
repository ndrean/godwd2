# overmind

`overind start` will run the `ProcFile`:

````
#ProcFile
web: cd client && PORT=3000 yarn run start
api: PORT=3001 && bundle exec rails s
worker: bundle exec sidekiq
redis: redis-server --port 6379
```

# Docker

<https://dev.to/raphael_jambalos/more-than-hello-world-in-docker-run-rails-sidekiq-web-apps-in-docker-1b37>

# OINK

Inspection of Active Record
<https://github.com/noahd1/oink/>

# Redis

```
# /config.redis.yml
development:
  host: ‘localhost’
  port: ‘6379’
test:
  host: ‘localhost’
  port: ‘6379’
production:
  host: ‘your-name.iz6wli.0001.use1.cache.amazonaws.com’
  port: ‘6379’
```

# Puma

In `puma.rb`, change port to 3001: `port ENV.fetch("PORT") { 3001 }`

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

To include `Knock` in all controllers, set in parent class: `ActionController::API` and make all other controllers inherite from `ApplicationController`:

```ruby
# controllers/application_controller
class ApplicationController < ActionController::API
    include Knock::Authenticable
end
```

# Models & migration

Generate 3 models, `User`, `Itinary` & `Event` where `Event` is a joint table of `users` and `itinaries` (so contains 2 keys). Since we use encrypted password with the gem `bcrypt`, we set `password_digest` (and not `password`) in the _user_ model and set `has_secure_password` in the model:

```bash
>rails generate model User email name password_digest confirm_token confirm_email:boolean access_token uid

>rails generate model Event participants:jsonb user:references itinary:references directCLurl publicID

>rails g model Itinary start end start_gps:array end_gps:array date:date picture

```

```ruby
# /app/models/User.rb
class User < ApplicationRecord
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

and for email validation, we use a regex:
`validates_format_of :email, :with => /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i`

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

and use for example:

```js
import Button from "react-bootstrap/Button";
```

# foreman

To use one command to launch Rails, webpack-dev-server, Sidekiq, we use the gem `foreman` and create a file `Procfile` (located at the root of the project).

Do not install `foreman` in the `Gemfile` but do:

```bash
> gem install foreman
> bundle install
```

Append the `ProcFile` with the required processes (React front end, Rails API back end, Sidekiq...):

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

# Local SSL certificate (macOS)

<https://flaviocopes.com/macos-install-ssl-local/>

> Change `http://localhost:3000/api/v1/..` to `/api/v1/...` in all `fetch` requests.
````

# ActionMailer

<https://dev.to/morinoko/sending-emails-in-rails-with-action-mailer-and-gmail-35g4>

# bug Select

index.js:1 Warning: Legacy context API has been detected within a strict-mode tree.

The old API will be supported in all 16.x releases, but applications using it should migrate to the new version.

Please update the following components: MenuPlacer

Learn more about this warning here: https://fb.me/react-legacy-context
in MenuPlacer (created by Select)
in div (created by Context.Consumer)
in EmotionCssPropInternal (created by SelectContainer)
in SelectContainer (created by Select)
in Select (created by StateManager)
in StateManager (at EventForm.jsx:84)
in div (created by FormGroup)
in FormGroup (at EventForm.jsx:82)
in form (created by Form)
in Form (at EventForm.jsx:46)
in EventForm (at CardList.jsx:368)
in div (created by ModalBody)
in ModalBody (at EventModal.jsx:16)
in div (created by ModalDialog)
in div (created by ModalDialog)
in ModalDialog (created by Modal)
in div (created by Modal)
in Transition (created by Fade)
in Fade (created by DialogTransition)
in DialogTransition (created by Modal)
in Modal (created by Modal)
in Modal (at EventModal.jsx:8)
in EventModal (at CardList.jsx:366)
in div (created by Row)
in Row (at CardList.jsx:351)
in div (created by Container)
in Container (at CardList.jsx:350)
in CardList (at App.js:93)
in App (at src/index.js:41)
in StrictMode (at src/index.js:40)
