class AddDistanceToItinary < ActiveRecord::Migration[6.0]
  def change
    add_column :itinaries, :distance, :integer
  end
end
