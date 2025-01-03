class Member < ApplicationRecord
  has_many :check_ins, dependent: :destroy
  
  validates :name, presence: true
  validates :membership_type, presence: true, inclusion: { in: %w[single_daily_monthly double_daily_monthly class_based] }
  validates :daily_checkins_allowed, presence: true, numericality: { only_integer: true, greater_than: 0 }, unless: :class_based?
  validates :membership_expiry, presence: true, unless: :class_based?
  validates :remaining_credits, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  
  after_initialize :set_default_new_member_status
  after_create :handle_duplicate_names

  def can_checkin_normally?
    return false if is_new_member?
    
    if class_based?
      remaining_credits.to_i > 0
    else
      return false if membership_expired?
      today_checkins = check_ins.where('checkin_time >= ? AND checkin_time <= ?', 
                                     Time.current.beginning_of_day, 
                                     Time.current.end_of_day).count
      today_checkins < daily_checkins_allowed
    end
  end

  def membership_expired?
    return false if class_based?
    membership_expiry < Time.current
  end

  alias_method :able_to_checkin_normally?, :can_checkin_normally?

  def class_based?
    membership_type == 'class_based'
  end

  def deduct_credit
    return unless class_based? && remaining_credits.to_i > 0
    update(remaining_credits: remaining_credits - 1)
  end

  def mark_as_not_new
    update(is_new_member: false) if is_new_member?
  end

  private

  def set_default_new_member_status
    self.is_new_member = true if is_new_member.nil?
  end

  def handle_duplicate_names
    return unless name.present?
    
    if Member.where(name: name).where.not(id: id).exists?
      self.name = "#{name} ##{Time.current.to_i}"
      save
    end
  end

  def self.search_by_name(query)
    return none if query.blank?
    where('name ILIKE ?', "%#{query}%")
  end

  def self.find_exact_match(name)
    return none if name.blank?
    where('name = ?', name)
  end
end
