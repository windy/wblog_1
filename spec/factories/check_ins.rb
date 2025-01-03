FactoryBot.define do
  factory :check_in do
    association :member
    checkin_time { Time.current }
    checkin_type { 'normal' }

    trait :extra do
      checkin_type { 'extra' }
    end
  end
end
