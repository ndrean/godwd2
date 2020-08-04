class SendDemandJob < ApplicationJob
    queue_as :default

  def perform(current_user_email, owner_email, itinary_id)
    UserMailer.accept(current_user_email, owner_email, itinary_id).deliver
  end
end