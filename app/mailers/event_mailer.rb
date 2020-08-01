class EventMailer < ApplicationMailer

  def invitation(p_email, event_ID)
    @p_email = p_email
    @event = Event.find(event_ID)
    return if @event.nil? || p_email.nil?
    mail(to: @p_email,  subject: "Invitation to a downwind event")
  end

end
