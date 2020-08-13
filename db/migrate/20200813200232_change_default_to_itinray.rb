class ChangeDefaultToItinray < ActiveRecord::Migration[6.0]
  def change
    remove_column :itinaries, :start_gps, array: true
    remove_column :itinaries, :end_gps, array: true
  end
end
