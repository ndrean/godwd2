class Api::V1::EventsController < ApplicationController
  #skip_before_action :verify_authenticity_token
  before_action :authenticate_user, only: [:create, :update, :destroy]

  # curl http://localhost:3000/api/v1/events => ok
  def index 
    render json:  Event.includes(:user, :itinary).to_json(
      include: [
        user: {only: [:email]},
        itinary: {only: [:date, :start, :end]}
      ]
    )

  end

  #api/v1/events/:id => ok
  def show
    event = Event.find(params[:id])
    return render json: event.to_json(
      include: [
        user: {only: :email},
        itinary: {only: [:date, :start, :end]},
      ]
    )
  end

  # POST
  def create
    event = Event.new(event_params)
    event.user = current_user

    # Active Storage: get the Cloudinary url if a photo is passed in the form
    #event.url = event.photo.url if event.photo.attached?

    if event.save
      # if any participant passed in the form, send async email
      if event.participants
        event.participants.each do |participant|
          # event.participant=[{email:xx,notif:xx},..] , 'jsonb' format => participant['email']
          EventMailer.invitation(participant['email'], event.id)
            .deliver_later
        end
      end
      return render json: { status: 201 }
    else
      return render json: event.errors.full_messages, status: :unprocessable_entity 
    end
  end

  # PATCH/PUT /events/:id
  def update
    event = Event.find(params[:id])   
    # early return
    return render json: {status: 401} if event.user != current_user
    # async purge only for Active Storage since direct upload data is in params
    # if event_params[:photo] && event.url
    #   PurgeCl.perform_later(event.photo.key)
    #   event.photo.purge_later
    # end

    # if we update direct link, then first remove from CL if one exists
    RemoveDirectLink.perform_later(event.publicID) if event_params[:directCLUrl] && event.directCLUrl

    if event.update(event_params)
      # if a new picture is saved to Active Storage, update link
      # if a direct link to CL is done, the links will be in the params
      #event.update(url: event.photo.url) if event_params[:photo]
      
      return render json: { status: 200 }
    else
      return render json: {errors: event.errors.full_messages},
        status: :unprocessable_entity
    end
  end

  
  def destroy
    event = Event.find(params[:id])   
    # early return if unauthorized
    logger.debug "...........#{event.user == current_user}"
    return render json: { status: 401 } if event.user != current_user

    # async Active_Job for Active Storage
    # if event.photo.attached?
    #   PurgeCl.perform_later(event.photo.key)
    #   event.photo.purge_later
    # end
    
    #async Active_Job  for Cloudinary
    logger.debug "......................#{event.publicID}"
    result = RemoveDirectLink.perform_later(event.publicID) if event.publicID
    logger.debug "...........................result CL.#{result}"

    event.itinary.destroy
    event.destroy
    return render json: {status: 200}
  end

  def search
  end

  private
    def event_params
      #logger.debug "................#{params.require(:event).fetch(:participants,[]).map(&:keys.to_sym).flatten.uniq}"
      params.require(:event).permit( :user,  :directCLurl, :publicID,  itinary_attributes: [:date, :start, :end], participants: [:email, :notif, :id]) #photo for Active Storage
      #:participants => sp_keys)#, [:email, :id])
    end

    def handle_unauthorized(current, user)
      unless current == user
        render :unauthorized, status: 401
      end
    end
    
end
