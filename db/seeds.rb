puts "cleaning"
Event.destroy_all
Itinary.destroy_all
User.destroy_all

puts "creating..."
User.create!(email:"toto@test.fr", name:"toto", password: "password", confirm_email: "true")
User.create!(email:"t@test.fr", name:"t", password:"password", confirm_email: "true")
# User.create!(email: "nevendrean@yahoo.fr", password:"password")

Itinary.create!(start: "Tibau do sul", end:"Fortaleza", date: Faker::Date.between(from: Date.today, to: '2020-12-01'), start_gps:[-6.2339824, -35.0487455 ], end_gps:[-3.7304512, -38.5217989] )
Itinary.create!(start: "Barranquilla", end:Faker::Address.city, date: Faker::Date.between(from: Date.today, to: '2020-12-01'), start_gps:[10.9799669,-74.8013085 ], end_gps:[10.4195841,-75.5271224] )
Itinary.create!(start: "Soulac s/Mer", end: "Lège-Ca-Ferret", date: Faker::Date.between(from: Date.today, to: '2020-12-01'), start_gps:[45.513149,-1.1228789], end_gps:[44.7245776,-1.2232052])
Itinary.create!(start: "Chichester", end: "Worthing", date: Faker::Date.between(from: Date.today, to: '2020-12-01'))




a = User.first.id
b = User.last.id


kiters = []
Array(a..b).each { |i| kiters << User.find(i).email}

puts kiters
c= Itinary.first.id
d = c+1
e = d+1
f=Itinary.last.id


Array(c..f).each do |idx|
    id = Array(a..b).sample
    participants = []
    kiters.each { |k| participants << {email: k, notif: true, ptoken:""}}
    Event.create!(user: User.find(id), itinary: Itinary.find(idx), participants: participants)
    
end

puts "done!"
