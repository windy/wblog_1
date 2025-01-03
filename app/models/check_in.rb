class CheckIn < ApplicationRecord
  belongs_to :member
  
  validates :checkin_type, presence: true, inclusion: { in: %w[normal extra] }
  validates :checkin_time, presence: true
  
  before_validation :set_checkin_type
  
  private
  
  def set_checkin_type
    self.checkin_type = member.can_checkin_normally? ? 'normal' : 'extra'
  end
end
