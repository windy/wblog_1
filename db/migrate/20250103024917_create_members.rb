class CreateMembers < ActiveRecord::Migration[6.1]
  def change
    create_table :members do |t|
      t.string :name
      t.string :email
      t.string :membership_type
      t.datetime :membership_expiry
      t.integer :daily_checkins_allowed

      t.timestamps
    end
  end
end
