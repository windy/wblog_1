require 'rails_helper'

RSpec.describe CheckIn, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:checkin_type) }
    it { should validate_presence_of(:checkin_time) }
    it { should validate_inclusion_of(:checkin_type).in_array(%w[normal extra]) }
  end

  describe 'associations' do
    it { should belong_to(:member) }
  end

  describe '#set_checkin_type' do
    context 'when member can check in normally' do
      let(:member) { create(:member, :single_daily) }
      
      it 'sets checkin_type to normal' do
        check_in = build(:check_in, member: member)
        check_in.valid?
        expect(check_in.checkin_type).to eq('normal')
      end
    end

    context 'when member cannot check in normally' do
      let(:member) { create(:member, :single_daily) }
      
      before do
        create(:check_in, member: member) # First check-in
      end
      
      it 'sets checkin_type to extra' do
        check_in = build(:check_in, member: member)
        check_in.valid?
        expect(check_in.checkin_type).to eq('extra')
      end
    end
  end
end
