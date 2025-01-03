class CheckIn < ApplicationRecord
  belongs_to :member, required: true
  
  validates :checkin_type, presence: true, inclusion: { in: %w[normal extra] }
  validates :checkin_time, presence: true
  validate :no_duplicate_checkin_in_time_slot
  
  before_validation :set_checkin_type, if: :should_set_checkin_type?
  
  private
  
  def should_set_checkin_type?
    member.present? && checkin_type.blank?
  end
  
  def set_checkin_type
    return unless should_set_checkin_type?

    if member.is_new_member?
      member.mark_as_not_new
      self.checkin_type = 'extra'
      return
    end

    if member.can_checkin_normally?
      member.deduct_credit if member.class_based?
      self.checkin_type = 'normal'
    else
      self.checkin_type = 'extra'
    end
  end

  def no_duplicate_checkin_in_time_slot
    return unless member && checkin_time

    time_slot_start = checkin_time.beginning_of_hour
    time_slot_end = checkin_time.end_of_hour

    duplicate = member.check_ins.where(
      'checkin_time >= ? AND checkin_time < ? AND id != ?',
      time_slot_start, time_slot_end, id.to_i
    ).exists?

    errors.add(:checkin_time, 'already has a check-in in this time slot') if duplicate
  end
end
