# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_08_13_185921) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "events", force: :cascade do |t|
    t.jsonb "participants"
    t.string "directCLurl"
    t.string "publicID"
    t.string "url"
    t.bigint "user_id", null: false
    t.bigint "itinary_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["itinary_id"], name: "index_events_on_itinary_id"
    t.index ["user_id"], name: "index_events_on_user_id"
  end

  create_table "itinaries", force: :cascade do |t|
    t.date "date"
    t.string "start"
    t.string "start_gps", array: true
    t.string "end"
    t.string "end_gps", array: true
    t.string "picture"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "distance"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "name"
    t.string "password_digest"
    t.string "confirm_token"
    t.boolean "confirm_email"
    t.string "access_token"
    t.string "uid"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  add_foreign_key "events", "itinaries"
  add_foreign_key "events", "users"
end
