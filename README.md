# Running in dev mode:

The Rails API will run on port 3001 and the React fron end will run on port 3000. The Sidekiq background adapter along with Redis will run as a worker.
We wil use `racks-cors` to enable cross-site ('/config/initializers/cors.rb') and the endpoints will be `/api/v1/...`.

## Puma

In `/config/puma.rb`, change port to 3001: `port ENV.fetch("PORT") { 3001 }`

## Sidekiq

In './config/application', declare `config.active_job.queue_adapter = :sidekiq`

In '/config/Dev-prod', provide `routes.default_url_options[:host] = 'http://localhost:3001'` (otherwise you get ActionView::Template::error missing link, provide :hst parameter, set default_url_options[:host])

## Redis

To provision Redis by the provider.

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

## Cloudinary

All images corresponding to an event are saved in Cloudinary. We don't use ActiveStorage and we access directly to Cloudinary to save images. We only save the the 'url' and `publicID` ( this is the ID of the image given by Cloudinary).

We permit only one image by event, uploaded from the front end, so if we upload another image, we first destroy the image from Cloudinary and upload a new one. We use a background job, defined into '/app/jobs/remove_direct_link.rb' and use `RemoveDirectLink.perform_later(event.publicId)` in the controller .

Settings: from the account,download `cloudinary.yml` and place it into '/config/cloudinary.yml'.

# ActionMailer

All the mailing jobs can be found in '/app/mailers/' folder, with `event_mailer.rb` and `user_mailer.rb`. We defined methods that use short arguments (used by `Redis`):

- `invitation` : the creator/owner on an event sends a mail to invite buddies. This is sent on every change of the event.
- `demand`: a user sends a mail to the creator to ask to join. This uses a token. The owner receives this mail and clicks on the link to accept the demand (via the token, the endpoint 'users_controllers/confirmdemand' updates the database).
- `register`: when a new user wants to sign-up, we send a mail with a link/token so the user clicks on the link to confirm registration and sends a token to 'users_controller/confirmed_email'
- `accept`: a mail sent to a user when the owner accepts a buddie to join his event

We defined the corresponding 'html.erb' view in '/app/views/event_mailer/demand_html.erb', '/app/views/event_mailer/invitation.html.erb', '/app/views/user_mailer/register.html.erb', '/app/views/user_mailer/accept.html.erb').

We generate a secure token with `SecureRandom.urlsafe_base64.to_s` and append this token to a link in the mail. We store this token in the database. We append to the link the token with the needed info so the controller method of the endpoint can run. For example:

```
<a href=<%="#{ENV['DOMAIN_HOST']}/api/v1/confirmDemand?name=#{@owner}&ptoken=#{@token}&user=#{@user}&itinary=#{@itinary.id}"%>>link</a>
```

<https://dev.to/morinoko/sending-emails-in-rails-with-action-mailer-and-gmail-35g4>

## overmind

Launch with one command Postgres, Sidekiq, Redis, Rails/Puma server, webpack-dev-server with: `overind start` which will run the `Procfile`:

```
#Procfile
web: cd client && PORT=3000 yarn run start
api: PORT=3001 && bundle exec rails s
worker: bundle exec sidekiq
redis: redis-server --port 6379
```

### foreman

Alternatively, we can use the gem `foreman` and run `foreman start`

> Do not install `foreman` in the `Gemfile`

but do:

```bash
> gem install foreman
> bundle install
```

Append the `Procfile` with the required processes (React front end, Rails API back end, Sidekiq...):

```
# Procfile
web: cd client && PORT=3000 yarn run start
api: PORT=3001 && bundle exec rails s
worker: sidekiq (-t 25)?
```

and run `foreman start` to run both Weback and Rails servers.
For production: <http://blog.daviddollar.org/2011/05/06/introducing-foreman.html>

# Docker

To be done...
<https://dev.to/raphael_jambalos/more-than-hello-world-in-docker-run-rails-sidekiq-web-apps-in-docker-1b37>

# OINK

Inspection of Active Record: see <https://github.com/noahd1/oink/>

# Secrets-credentials

Run `EDITOR="code --wait" bin/rails credentials=edit`
Within `'rails c`, we can access `Rails.application.secrets.secret_key_base`for example.

The gem `dotenv-rails` is used for the `#env` file.

# Knock

We use the gems `bcrypt`, `jwt`, `knock`.

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

# Front end

Create a folder `/client`.

## Bootstrap

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

## React-Modal-Login

Client side:

```bash
yarn add react-modal-login
```

# Kill Rails

```
> kill -9 $(lsof -t -i tcp:3001)
```

## Fontawesome

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

# Local SSL certificate (macOS)

<https://flaviocopes.com/macos-install-ssl-local/>

> Change `http://localhost:3000/api/v1/..` to `/api/v1/...` in all `fetch` requests.
