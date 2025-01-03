require 'rails_helper'

RSpec.describe Member, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:membership_type) }
    it { should validate_presence_of(:daily_checkins_allowed) }
    it { should validate_presence_of(:membership_expiry) }
  end

  describe 'associations' do
    it { should have_many(:check_ins).dependent(:destroy) }
  end

  describe '#can_checkin_normally?' do
    context 'when single daily membership' do
      let(:member) { create(:member, :single_daily) }

      it 'returns true for first check-in of the day' do
        expect(member.can_checkin_normally?).to be true
      end

      it 'returns false for second check-in of the day' do
        create(:check_in, member: member, checkin_time: Time.current)
        expect(member.can_checkin_normally?).to be false
      end
    end

    context 'when double daily membership' do
      let(:member) { create(:member, :double_daily) }

      it 'returns true for first check-in of the day' do
        expect(member.can_checkin_normally?).to be true
      end

      it 'returns true for second check-in of the day' do
        create(:check_in, member: member, checkin_time: Time.current)
        expect(member.can_checkin_normally?).to be true
      end

      it 'returns false for third check-in of the day' do
        create(:check_in, member: member, checkin_time: Time.current)
        create(:check_in, member: member, checkin_time: Time.current)
        expect(member.can_checkin_normally?).to be false
      end
    end

    context 'when membership is expired' do
      let(:member) { create(:member, :expired) }

      it 'returns false for any check-in' do
        expect(member.can_checkin_normally?).to be false
      end
    end
  end
end
