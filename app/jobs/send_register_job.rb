class SendInvitationJob < ApplicationJob
  queue_as :default

  def perform(user_email, user_confirmation_token)
    if user_email && user_confirmation_token
      UserMailer.register(user_email, user_confirmation_token).deliver
    end
  end
  
end