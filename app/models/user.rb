class User < ApplicationRecord
  has_secure_password
  has_many :events, dependent: :destroy
  validates :email, uniqueness: true, presence: true
  validates :password_digest, presence: true

  def auth_params
    params.require(:auth).permit( :access_token, :email, :password_digest, :access_token)
  end
end
