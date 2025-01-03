class CheckIn < ApplicationRecord
  belongs_to :member, required: true
  
  validates :checkin_type, presence: true, inclusion: { in: %w[normal extra] }
  validates :checkin_time, presence: true
  
  before_validation :set_checkin_type, if: :should_set_checkin_type?
  
  private
  
  def should_set_checkin_type?
    member.present? && checkin_type.blank?
  end
  
  def set_checkin_type
    self.checkin_type = member.can_checkin_normally? ? 'normal' : 'extra'
  end
end
