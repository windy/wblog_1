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
        create(:check_in, member: member, checkin_time: 2.hours.ago)
        create(:check_in, member: member, checkin_time: 1.hour.ago)
        expect(member.can_checkin_normally?).to be false
      end
    end

    context 'when membership is expired' do
      let(:member) { create(:member, :expired) }

      it 'returns false for any check-in' do
        expect(member.can_checkin_normally?).to be false
      end
    end

    context 'when class-based membership' do
      context 'when member has remaining credits' do
        let(:member) { create(:member, :class_based) }

        it 'returns true for check-in with remaining credits' do
          expect(member.can_checkin_normally?).to be true
        end

        it 'deducts one credit after check-in' do
          expect {
            create(:check_in, member: member, checkin_time: Time.current)
          }.to change { member.reload.remaining_credits }.by(-1)
        end
      end

      context 'when member has no remaining credits' do
        let(:member) { create(:member, :class_based_no_credits) }

        it 'returns false for can_checkin_normally?' do
          expect(member.can_checkin_normally?).to be false
        end

        it 'allows check-in but marks as extra' do
          check_in = create(:check_in, member: member, checkin_time: Time.current)
          expect(check_in.checkin_type).to eq('extra')
        end
      end
    end

    describe 'new member handling' do
      context 'when member is newly created' do
        let(:member) { create(:member, :new_member) }

        it 'is marked as new member by default' do
          expect(member.is_new_member).to be true
        end

        it 'marks first check-in as extra' do
          check_in = create(:check_in, member: member)
          expect(check_in.checkin_type).to eq('extra')
        end

        it 'updates is_new_member to false after first check-in' do
          expect {
            create(:check_in, member: member)
            member.mark_as_not_new
          }.to change { member.reload.is_new_member }.from(true).to(false)
        end
      end
    end

    describe 'duplicate name handling' do
      it 'appends timestamp to duplicate names' do
        original = create(:member, name: 'John Doe')
        duplicate = create(:member, name: 'John Doe')
        
        expect(duplicate.name).to match(/John Doe #\d+/)
        expect(duplicate.name).not_to eq(original.name)
      end

      it 'does not modify unique names' do
        member = create(:member, name: 'Unique Name')
        expect(member.name).to eq('Unique Name')
      end
    end

    describe 'data integrity' do
      it 'cascades deletion of check-ins when member is deleted' do
        member = create(:member)
        check_in = create(:check_in, member: member)
        
        expect { member.destroy }.to change(CheckIn, :count).by(-1)
      end

      it 'maintains membership expiry consistency' do
        member = create(:member, :single_daily)
        expect(member.membership_expiry).to be > Time.current
        
        member.update(membership_expiry: 1.day.ago)
        expect(member).not_to be_able_to_checkin_normally
      end

      it 'maintains daily check-in limit consistency' do
        member = create(:member, :single_daily)
        create(:check_in, member: member)
        
        expect(member.can_checkin_normally?).to be false
      end
    end

    describe '.search_by_name' do
      let!(:john_doe) { create(:member, name: 'John Doe') }
      let!(:john_smith) { create(:member, name: 'John Smith') }
      let!(:jane_doe) { create(:member, name: 'Jane Doe') }

      it 'returns members with matching names' do
        results = Member.search_by_name('John')
        expect(results).to include(john_doe, john_smith)
        expect(results).not_to include(jane_doe)
      end

      it 'returns empty when no matches found' do
        results = Member.search_by_name('XYZ')
        expect(results).to be_empty
      end

      it 'returns empty for blank query' do
        results = Member.search_by_name('')
        expect(results).to be_empty
      end

      it 'is case insensitive' do
        results = Member.search_by_name('john')
        expect(results).to include(john_doe, john_smith)
      end
    end

    describe '.find_exact_match' do
      let!(:john_doe) { create(:member, name: 'John Doe') }
      let!(:john_doe_duplicate) { create(:member, name: 'John Doe #123456789') }

      it 'finds exact name match' do
        results = Member.find_exact_match('John Doe')
        expect(results).to include(john_doe)
        expect(results).not_to include(john_doe_duplicate)
      end

      it 'returns empty for no exact match' do
        results = Member.find_exact_match('John D')
        expect(results).to be_empty
      end

      it 'returns empty for blank name' do
        results = Member.find_exact_match('')
        expect(results).to be_empty
      end
    end

    describe 'error handling' do
      it 'validates presence of required fields' do
        member = build(:member, name: nil)
        expect(member).not_to be_valid
        expect(member.errors[:name]).to include(I18n.t('errors.messages.blank'))
      end

      it 'validates email format when present' do
        member = build(:member, email: 'invalid_email')
        expect(member).not_to be_valid
        expect(member.errors[:email]).to include(I18n.t('errors.messages.invalid'))
      end

      it 'allows blank email' do
        member = build(:member, email: '')
        expect(member).to be_valid
      end

      it 'accepts valid email format' do
        member = build(:member, email: 'test@example.com')
        expect(member).to be_valid
      end

      it 'validates membership type inclusion' do
        member = build(:member, membership_type: 'invalid_type')
        expect(member).not_to be_valid
        expect(member.errors[:membership_type]).to include(I18n.t('errors.messages.inclusion'))
      end

      it 'validates daily checkins allowed for non-class-based memberships' do
        member = build(:member, :single_daily, daily_checkins_allowed: nil)
        expect(member).not_to be_valid
        expect(member.errors[:daily_checkins_allowed]).to include(I18n.t('errors.messages.blank'))
      end

      it 'validates membership expiry for non-class-based memberships' do
        member = build(:member, :single_daily, membership_expiry: nil)
        expect(member).not_to be_valid
        expect(member.errors[:membership_expiry]).to include(I18n.t('errors.messages.blank'))
      end

      it 'validates remaining credits numericality for class-based memberships' do
        member = build(:member, :class_based, remaining_credits: -1)
        expect(member).not_to be_valid
        expect(member.errors[:remaining_credits]).to include(I18n.t('errors.messages.greater_than_or_equal_to', count: 0))
      end
    end
  end
end
