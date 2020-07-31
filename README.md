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

  # destroy events created by user if user deleted
  has_many :events, dependent: :destroy

  validates :email, uniqueness: true, presence: true
  validates :password_digest, presence: true

  def auth_params
    params.require(:auth).permit( :access_token, :email, :password_digest, :access_token)
  end
end
```
