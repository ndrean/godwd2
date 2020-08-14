class AddCommentsToItinaries < ActiveRecord::Migration[6.0]
  def change
    add_column :events, :comment, :text
  end
end
