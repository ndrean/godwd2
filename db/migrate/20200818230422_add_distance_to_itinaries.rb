class AddDistanceToItinaries < ActiveRecord::Migration[6.0]
  def change
    add_column :itinaries, :distance, :decimal
  end
end
