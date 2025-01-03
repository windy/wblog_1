export default function MemberDetails() {
  const { memberId } = useParams<{ memberId: string }>();
  const { member, loading, error } = useMember(memberId || '');

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!member) return <ErrorMessage message="未找到会员信息" />;

  return (
    <div className="space-y-6">
      <MemberInfo member={member} />
      <CheckInRecordsContainer 
        memberId={member.id}
        showFilter={false}
        limit={30}
      />
    </div>
  );
} 