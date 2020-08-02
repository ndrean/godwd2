class EventMailer < ApplicationMailer

  def invitation(p_email, event_ID)
    @p_email = p_email
    @event = Event.find(event_ID)
    return if @event.nil? || p_email.nil?
    mail(to: @p_email,  subject: "Invitation to a downwind event")
  end

  def demand(u_email, owner_email, itinary_id)
    @user = u_email
    @owner = owner_email
    @itinary = Itinary.find(itinary_id)
    mail(to: @owner, subject: "Demand to join")
  end
end
