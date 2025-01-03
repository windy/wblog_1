class CreateCheckIns < ActiveRecord::Migration[6.1]
  def change
    create_table :check_ins do |t|
      t.references :member, null: false, foreign_key: true
      t.string :checkin_type
      t.datetime :checkin_time

      t.timestamps
    end
  end
end
