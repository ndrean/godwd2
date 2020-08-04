class Api::V1::EventsController < ApplicationController
  #skip_before_action :verify_authenticity_token
  before_action :authenticate_user, only: 
    [:create, :update, :destroy, :receive_demand ]

  #e GET '/api/v1/events
  def index 
    render json:  
      Event.joins(:user, :itinary)
      .where('itinaries.date > ?', Date.today-1)
      .to_json( include: [
        user: {only: [:email]},
        itinary: {only: [:date, :start, :end]}
        ]
      )
  end

  # GET '/api/v1/events/:id'
  def show
    event = Event.find(params[:id])
    return render json: event.to_json(
      include: [
        user: {only: :email},
        itinary: {only: [:date, :start, :end]},
      ]
    )
  end

  # POST '/api/v1/events'
  def create
    event = Event.new(event_params)
    event.user = current_user
    return render json: event.errors.full_messages, status: :unprocessable_entity if !event.save
    
    if event.participants
      event.participants.each do |participant|
        # 'jsonb' format => participant['email'], not symbol :email
        participant['notif'] = true
        EventMailer.invitation(participant['email'], event.id)
        .deliver_later
      end
      event.save
    end
    return render json:  {status: 201}
    
    # Active Storage: get the Cloudinary url if a photo is passed in the form
    #event.url = event.photo.url if event.photo.attached?    
  end

  #  PATCH 'api/v1/events/:id'
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
    RemoveDirectLink.perform_later(event.publicID) if event_params[:directCLurl] && event.directCLurl

    if event.update(event_params)
      # if a new picture is saved to Active Storage, update link
      # if a direct link to CL is done, the links will be in the params
      #event.update(url: event.photo.url) if event_params[:photo]
      if event.participants
        event.participants.each do |participant|
          # 'jsonb' format => participant['email'], not :email
          participant['notif'] = true
          EventMailer.invitation(participant['email'], event.id)
          .deliver_later
        end
        event.save
      end

      return render json: {status: 200}
    else
      return render json: {errors: event.errors.full_messages},
        status: :unprocessable_entity
    end
  end

  # DELETE '/api/v1/events/:id'
  def destroy
    event = Event.find(params[:id])   
    return render json: { status: 401 } if event.user != current_user

    # async Active_Job for Active Storage
    # if event.photo.attached?
    #   PurgeCl.perform_later(event.photo.key)
    #   event.photo.purge_later
    # end
    
    #async Active_Job  for Cloudinary
    RemoveDirectLink.perform_later(event.publicID) if event.publicID

    event.itinary.destroy
    event.destroy
    return render json: {status: 200}
  end

  
  # POST '/api/v1/pushDemand'
  # send mail to owner of an event for user to join
  def receive_demand
    owner = User.find_by(email: params[:owner])
    return render json: { status: :unprocessable_entity} if !owner

    itinary_id = params[:event][:itinary_id]
    token = SecureRandom.urlsafe_base64.to_s
    event = Event.find(params[:event][:id])
    event.participants << {email: params[:user][:email], notif: false, ptoken: token}
    event.save
    EventMailer.demand(current_user.email , owner.email, itinary_id, token )
      .deliver_later
    
      return render status: 200
    
  end

  
  # GET 'api/v1/confirmDemand/?name=XXX?user=YYY?ptoken=ZZZ'
  # token sent from link in mail for owner to accept user
  def confirm_demand
    owner = params[:name]
    itinary = Itinary.find(params[:itinary])
    events = Event.joins(:user).where("users.email LIKE ?", owner)
    events.each do |event|
      event.participants.each do |p|
        # logger.debug "........T1..#{p['email']} #{p['email'] == params[:user]}"
        if p['ptoken'] && p['ptoken']== params[:ptoken]
          # logger.debug ".......T2..#{p['ptoken']}...#{p['ptoken']== params[:ptoken]}"          
          p['notif']=true
          p['ptoken'] = ''
          event.save
          
        end
      end
    end
    user = params[:user]
    UserMailer.accept(user, owner, itinary.id).deliver_later
    return true
  end

  private
    def event_params
      #logger.debug "................#{params.require(:event).fetch(:participants,[]).map(&:keys.to_sym).flatten.uniq}"
      params.require(:event).permit( :user,  :directCLurl, :publicID,  itinary_attributes: [:date, :start, :end], participants: [:email, :notif, :id, :ptoken]) #photo for Active Storage
      #:participants => sp_keys)#, [:email, :id])
    end
    
    def handle_unauthorized(current, user)
      unless current == user
        render json: {status: 401, errors: ['unauthorized']}
      end
    end

    # def find_value_in_nested_hash(data, desired_value)
    #   data.values.each do |value| 
    #     case value
    #     when desired_value
    #       return data
    #     when Hash
    #       f = find_value_in_nested_hash(value, desired_value)
    #       return f if f
    #     end
    #   end
    #   nil
    # end
    
end
