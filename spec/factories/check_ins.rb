FactoryBot.define do
  factory :check_in do
    association :member
    checkin_time { Time.current }
    checkin_type { nil }

    trait :extra do
      checkin_type { 'extra' }
    end

    trait :normal do
      checkin_type { 'normal' }
    end
  end
end
