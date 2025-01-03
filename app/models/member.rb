class Member < ApplicationRecord
  has_many :check_ins, dependent: :destroy
  
  validates :name, presence: true
  validates :membership_type, presence: true, inclusion: { in: %w[single_daily_monthly double_daily_monthly] }
  validates :daily_checkins_allowed, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :membership_expiry, presence: true

  def can_checkin_normally?
    return false if membership_expired?
    
    today_checkins = check_ins.where('checkin_time >= ? AND checkin_time <= ?', 
                                   Time.current.beginning_of_day, 
                                   Time.current.end_of_day).count
    today_checkins < daily_checkins_allowed
  end

  def membership_expired?
    membership_expiry < Time.current
  end
end
