FactoryBot.define do
  factory :member do
    name { "Test Member" }
    email { "test@example.com" }
    membership_type { "single_daily_monthly" }
    membership_expiry { 1.month.from_now }
    daily_checkins_allowed { 1 }

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
  end
end
