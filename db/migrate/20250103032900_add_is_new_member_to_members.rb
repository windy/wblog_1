class AddIsNewMemberToMembers < ActiveRecord::Migration[6.1]
  def change
    add_column :members, :is_new_member, :boolean
  end
end
