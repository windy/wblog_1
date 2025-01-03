class AddRemainingCreditsToMembers < ActiveRecord::Migration[6.1]
  def change
    add_column :members, :remaining_credits, :integer
  end
end
