FactoryBot.define do
  factory :member do
    sequence(:name) { |n| "Test Member #{n}" }
    email { "test@example.com" }
    membership_type { "single_daily_monthly" }
    membership_expiry { 1.month.from_now }
    daily_checkins_allowed { 1 }
    is_new_member { false }
    remaining_credits { nil }

    trait :new_member do
      is_new_member { true }
    end

    trait :single_daily do
      membership_type { "single_daily_monthly" }
      daily_checkins_allowed { 1 }
    end

    trait :double_daily do
      membership_type { "double_daily_monthly" }
      daily_checkins_allowed { 2 }
    end

    trait :expired do
      membership_expiry { 1.day.ago }
    end

    trait :class_based do
      membership_type { "class_based" }
      membership_expiry { nil }
      daily_checkins_allowed { nil }
      remaining_credits { 10 }
    end

    trait :class_based_no_credits do
      membership_type { "class_based" }
      membership_expiry { nil }
      daily_checkins_allowed { nil }
      remaining_credits { 0 }
    end
  end
end
