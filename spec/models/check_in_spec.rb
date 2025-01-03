require 'rails_helper'

RSpec.describe CheckIn, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:checkin_type) }
    it { should validate_presence_of(:checkin_time) }
    it { should validate_inclusion_of(:checkin_type).in_array(%w[normal extra new_member]) }
  end

  describe 'associations' do
    it { should belong_to(:member) }
  end

  describe '#set_checkin_type' do
    context 'when member is a new member' do
      let(:member) { create(:member, :new_member) }
      
      it 'marks the first check-in as new_member' do
        check_in = build(:check_in, member: member)
        check_in.valid?
        expect(check_in.checkin_type).to eq('new_member')
        expect(member.reload.is_new_member).to be false
      end
    end

    context 'when member can check in normally' do
      let(:member) { create(:member, :single_daily) }
      
      it 'sets checkin_type to normal' do
        check_in = build(:check_in, member: member)
        check_in.valid?
        expect(check_in.checkin_type).to eq('normal')
      end
    end

    context 'when member cannot check in normally due to daily limit' do
      let(:member) { create(:member, :single_daily) }
      let(:first_check_in) { create(:check_in, member: member, checkin_type: 'normal') }
      
      before do
        first_check_in # Create first check-in for today
        allow(member).to receive(:can_checkin_normally?).and_return(false)
      end
      
      it 'sets checkin_type to extra' do
        check_in = build(:check_in, member: member, checkin_type: nil)
        check_in.valid?
        expect(check_in.checkin_type).to eq('extra')
      end
    end

    context 'when class-based member has no remaining credits' do
      let(:member) { create(:member, :class_based_no_credits) }
      
      it 'sets checkin_type to extra' do
        check_in = build(:check_in, member: member)
        check_in.valid?
        expect(check_in.checkin_type).to eq('extra')
      end
    end
  end

  describe 'duplicate check-in validation' do
    let(:member) { create(:member, :single_daily) }
    let(:time) { Time.current.beginning_of_hour + 30.minutes }

    context 'when attempting duplicate check-in in same time slot' do
      it 'does not allow the same member to check in twice in the same time slot' do
        create(:check_in, member: member, checkin_time: time)
        duplicate_check_in = build(:check_in, member: member, checkin_time: time + 15.minutes)
        
        expect(duplicate_check_in).not_to be_valid
        expect(duplicate_check_in.errors[:checkin_time]).to include('already has a check-in in this time slot')
      end
    end

    context 'when checking in different time slots' do
      it 'allows check-in in a different time slot' do
        create(:check_in, member: member, checkin_time: time)
        next_slot_check_in = build(:check_in, member: member, checkin_time: time + 2.hours)
        
        expect(next_slot_check_in).to be_valid
      end
    end
  end

  describe 'error handling' do
    it 'validates presence of member' do
      check_in = build(:check_in, member: nil)
      expect(check_in).not_to be_valid
      expect(check_in.errors[:member]).to include(I18n.t('activerecord.errors.messages.must_exist'))
    end

    it 'validates presence of checkin_time' do
      check_in = build(:check_in, checkin_time: nil)
      expect(check_in).not_to be_valid
      expect(check_in.errors[:checkin_time]).to include(I18n.t('errors.messages.blank'))
    end

    it 'validates checkin_type inclusion' do
      check_in = build(:check_in)
      check_in.checkin_type = 'invalid_type'
      expect(check_in).not_to be_valid
      expect(check_in.errors[:checkin_type]).to include(I18n.t('errors.messages.inclusion'))
    end

    it 'handles invalid time slot format' do
      check_in = build(:check_in)
      check_in.checkin_time = 'invalid_time'
      expect(check_in).not_to be_valid
    end
  end
end
