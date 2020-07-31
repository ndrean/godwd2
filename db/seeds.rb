puts "cleaning"
Event.destroy_all
Itinary.destroy_all
User.destroy_all

puts "creating..."
User.create!(email:"toto@test.fr", name:"toto", password: "password", confirm_email: "true")
User.create!(email:"t@test.fr", name:"t", password:"password", confirm_email: "true")
# User.create!(email: "nevendrean@yahoo.fr", password:"password")

2.times do
    Itinary.create!(start: Faker::Address.city, end:Faker::Address.city, date: Faker::Date.between(from: Date.today, to: '2020-09-01') )
end

a = User.first.id
b = User.last.id


kiters = []
Array(a..b).each { |i| kiters << User.find(i).email}

puts kiters
c= Itinary.first.id
d=Itinary.last.id

arr_i = Array(c..d)


Array(a..b).each do |idx|
    participants = []
    kiters.each { |k| participants << {email: k, notif: false}}
    Event.create!(user: User.find(idx), itinary: Itinary.find(arr_i.sample), participants: participants)
end

puts "done!"
