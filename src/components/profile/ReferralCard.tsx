'use client';
import { useState, useEffect, useMemo } from 'react';
import { Link as LinkIcon, Checkmark, Copy } from '@carbon/icons-react';
import { useGeneral } from '../../context/GeneralContext';
import membersService from '../../services/members.service';
import analyticsService from '../../services/analytics.service';

const ReferralCard = () => {
  const { getAccessIds, acls } = useGeneral();
  const [referralId, setReferralId] = useState('');
  const [origin, setOrigin] = useState('');
  const [totalReferred, setTotalReferred] = useState<number | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const overviewIds = useMemo(
    () => getAccessIds('supporter-portal', 'support-group-profile') || getAccessIds('supporter-portal', 'supporter-portal-overview'),
    [acls]
  );

  useEffect(() => {
    setOrigin(window.location.origin);
    membersService.portalGetProfile()
      .then((res) => {
        if (res.success && res.data?.User) {
          setReferralId(res.data.User.email || res.data.User.phone_number || '');
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!overviewIds) return;
    analyticsService.getPortalSupportGroupPortalStats({
      module_unique_id: overviewIds.module_unique_id,
      sub_module_unique_id: overviewIds.sub_module_unique_id,
    })
      .then((res) => { if (res.success && res.data) setTotalReferred(res.data.total_ref_members ?? 0); })
      .catch(() => {});
  }, [overviewIds?.module_unique_id]);

  const referralLink = referralId && origin ? `${origin}/signup?ref_id=${encodeURIComponent(referralId)}` : '';

  const copyReferralLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (!referralLink) return null;

  return (
    <div
      className="xui-bdr-rad-[12px] xui-lg-bdr-rad-half xui-p-1 xui-lg-p-1-half"
      style={{ background: '#fff', border: '1px solid var(--neutral-200)' }}
    >
      <div className="xui-d-flex xui-flex-ai-center xui-flex-jc-space-between xui-grid-gap-[10px] xui-mb-[10px]">
        <div className="xui-d-flex xui-flex-ai-center xui-grid-gap-[10px]">
          <div className="xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-bdr-rad-[8px]" style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary-100)', flexShrink: 0 }}>
            <LinkIcon size={16} style={{ color: 'var(--primary-600)' }} />
          </div>
          <div>
            <p className="xui-font-sz-[13px] xui-lg-font-sz-[14px] xui-font-w-600" style={{ color: 'var(--neutral-800)', margin: 0 }}>Your Referral Link</p>
            <p className="xui-font-sz-[11px]" style={{ color: 'var(--neutral-500)', margin: 0, marginTop: '1px' }}>Share to register members under your name</p>
          </div>
        </div>
        {totalReferred !== null && (
          <span className="xui-font-sz-[12px] xui-font-w-600 xui-flex-shrink-0" style={{ padding: '4px 10px', borderRadius: '20px', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
            {totalReferred.toLocaleString()} referred
          </span>
        )}
      </div>
      <div className="xui-d-flex xui-grid-gap-[8px]" style={{ flexWrap: 'nowrap' }}>
        <div
          className="xui-flex-1 xui-bdr-rad-[8px] xui-py-[8px] xui-px-[12px] xui-font-sz-[12px] xui-overflow-hidden"
          style={{ backgroundColor: 'var(--neutral-50)', border: '1px solid var(--neutral-200)', color: 'var(--neutral-600)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0 }}
        >
          {referralLink}
        </div>
        <button
          onClick={copyReferralLink}
          className="xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-grid-gap-[4px] xui-bdr-rad-[8px] xui-px-[14px] xui-font-sz-[12px] xui-font-w-600 xui-cursor-pointer xui-flex-shrink-0"
          style={{
            backgroundColor: linkCopied ? 'var(--primary-100)' : 'var(--primary-600)',
            color: linkCopied ? 'var(--primary-700)' : '#fff',
            border: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {linkCopied ? <><Checkmark size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
        </button>
      </div>
    </div>
  );
};

export default ReferralCard;
