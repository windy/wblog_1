FactoryBot.define do
  factory :check_in do
    association :member
    checkin_time { Time.current }
    
    after(:build) do |check_in|
      check_in.checkin_type = check_in.member.can_checkin_normally? ? 'normal' : 'extra'
    end
  end
end
