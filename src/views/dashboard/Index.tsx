'use client';
import { useState, useEffect } from 'react';
import { Navbar } from '../../components/layout';
import { QuickActions } from '../../components/overview';
import { useGeneral } from '../../context/GeneralContext';
import membersService from '../../services/members.service';
import type { Member } from '../../services/members.service';
import { APP_NAME } from '../../Globals';
import { formatDate } from '../../utils/formatters';
import { DetailSkeleton } from '../../components/skeletons';

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="xui-font-sz-80 xui-opacity-5" style={{ margin: '0 0 4px' }}>{label}</p>
    <p className="xui-font-sz-90 xui-font-w-500" style={{ margin: 0 }}>
      {value !== null && value !== undefined && value !== '' ? value : <span className="xui-opacity-4">Not set</span>}
    </p>
  </div>
);

const cardClass = 'xui-bg-white xui-bdr-rad-half xui-p-2 xui-mb-2';
const cardStyle: React.CSSProperties = { border: '1px solid var(--neutral-200)' };

const Dashboard = () => {
  const { user, acls } = useGeneral();
  const [profile, setProfile] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const roleName = profile?.MemberRole?.name || acls[0]?.Role?.name || '';

  const statesCovered = profile?.SupportGroup?.states_covered ?? [];
  const coverage = statesCovered.length === 0
    ? ''
    : statesCovered.length <= 5
      ? statesCovered.join(', ')
      : `${statesCovered.length} states covered`;

  useEffect(() => {
    membersService.portalGetProfile()
      .then(res => { if (res.success && res.data) setProfile(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fullName = profile?.User
    ? [profile.User.firstname, profile.User.middlename, profile.User.lastname].filter(Boolean).join(' ')
    : user?.fullname || 'Member';

  const initials = (profile?.User
    ? `${profile.User.firstname?.charAt(0) || ''}${profile.User.lastname?.charAt(0) || ''}`
    : (user?.fullname || 'M').charAt(0)).toUpperCase();

  return (
    <div>
      <Navbar title="Dashboard" />

      <div className="xui-py-1-half">
        <div className="xui-mb-2">
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--neutral-900)', margin: 0 }}>
            Welcome back, {user?.fullname?.split(' ')[0] || 'Member'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--neutral-500)', margin: '4px 0 0' }}>
            Here&apos;s what&apos;s happening in your support group.
          </p>
        </div>

        {loading ? <DetailSkeleton /> : (
          <div className={cardClass} style={cardStyle}>
            <div className="xui-d-flex xui-flex-ai-center xui-grid-gap-1 xui-mb-2">
              {profile?.User?.profile_image ? (
                <img
                  src={profile.User.profile_image}
                  alt={fullName}
                  style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--neutral-200)', flexShrink: 0 }}
                />
              ) : (
                <div
                  className="xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-font-w-700 xui-text-white"
                  style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#111827', fontSize: '26px', flexShrink: 0 }}
                >
                  {initials}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <h3 className="xui-font-sz-[18px] xui-font-w-600" style={{ margin: 0 }}>{fullName}</h3>
                <div className="xui-d-flex xui-flex-ai-center xui-flex-wrap-wrap xui-grid-gap-half xui-mt-half">
                  {roleName && (
                    <span className="xui-font-sz-75 xui-font-w-500" style={{ padding: '2px 10px', borderRadius: '20px', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                      {roleName}
                    </span>
                  )}
                  {profile?.SupportGroup?.name && (
                    <span className="xui-font-sz-75 xui-font-w-500" style={{ padding: '2px 10px', borderRadius: '20px', backgroundColor: 'var(--neutral-100)', color: 'var(--neutral-700)' }}>
                      {profile.SupportGroup.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <hr className="xui-my-1" />

            <div className="xui-d-grid xui-grid-col-1 xui-md-grid-col-2 xui-lg-grid-col-3 xui-grid-gap-1-half">
              <Field label="Email" value={profile?.User?.email} />
              <Field label="Phone Number" value={profile?.User?.phone_number} />
              <Field label="Gender" value={profile?.User?.gender} />
              <Field label="Date of Birth" value={profile?.User?.date_of_birth ? formatDate(profile.User.date_of_birth) : ''} />
              <Field label="NIN" value={profile?.nin} />
              <Field label="Member Since" value={profile?.createdAt ? formatDate(profile.createdAt) : ''} />
            </div>
          </div>
        )}

        <QuickActions />

        <div className={cardClass} style={{ ...cardStyle, marginTop: '16px' }}>
          <div className="xui-d-flex xui-flex-ai-center xui-grid-gap-1">
            {profile?.SupportGroup?.image && (
              <img
                src={profile.SupportGroup.image}
                alt={profile.SupportGroup.name}
                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--neutral-200)', flexShrink: 0 }}
              />
            )}
            <h3 className="xui-font-sz-[16px] xui-font-w-600" style={{ margin: 0 }}>About {APP_NAME}</h3>
          </div>
          <p className="xui-font-sz-90 xui-mt-1" style={{ color: 'var(--neutral-600)', margin: '8px 0 0', lineHeight: 1.6 }}>
            The Dickson Movement for Democracy brings supporters together through support groups across the country.
            This portal is where your group shares announcements, events and posts with its members.
          </p>
          {coverage && (
            <div className="xui-d-flex xui-flex-ai-center xui-flex-wrap-wrap xui-grid-gap-half xui-mt-1">
              {profile?.SupportGroup?.scope_option && (
                <span className="xui-font-sz-75 xui-font-w-500" style={{ padding: '2px 10px', borderRadius: '20px', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                  {profile.SupportGroup.scope_option}
                </span>
              )}
              <span className="xui-font-sz-85" style={{ color: 'var(--neutral-600)' }}>{coverage}</span>
            </div>
          )}

          <a
            href="https://thedicksonmovement.com"
            target="_blank"
            rel="noopener noreferrer"
            className="xui-d-inline-flex xui-font-sz-85 xui-font-w-500 xui-mt-1"
            style={{ color: 'var(--primary-600)' }}
          >
            Visit thedicksonmovement.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
