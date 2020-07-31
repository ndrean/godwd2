class CreateEvents < ActiveRecord::Migration[6.0]
  def change
    create_table :events do |t|
      t.jsonb :participants
      t.string :directCLurl
      t.string :publicID
      t.string :url
      t.references :user, null: false, foreign_key: true
      t.references :itinary, null: false, foreign_key: true

      t.timestamps

    end
  end
end
