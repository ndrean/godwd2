class SendDemandJob < ApplicationJob
    queue_as :default

  def _perform(u_email, owner_email, itinary_id, token)
    EventMailer.demand(u_email, owner_email, itinary_id, token).deliver
  end
end