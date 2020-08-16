class SendInvitationJob < ApplicationJob
  queue_as :default

  def _perform(pemail, eventID)
    if pemail && eventID
      EventMailer.invitation(pemail, eventID).deliver
    end
  end

end
