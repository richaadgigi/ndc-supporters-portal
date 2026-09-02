'use client';
import { Blog, EventSchedule, Bullhorn, UserMultiple, Image } from '@carbon/icons-react';
import { useRouter } from 'next/navigation';
import { useGeneral } from '../../context/GeneralContext';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  path: string;
  subModule: string;
}

const QuickActions = () => {
  const router = useRouter();
  const { acls } = useGeneral();

  const canAddTo = new Set(
    acls.filter((a) => a.add && a.status === 1 && a.SubModule?.stripped).map((a) => a.SubModule!.stripped)
  );

  const allActions: QuickAction[] = [
    {
      label: 'Add Post',
      icon: <Blog size={20} />,
      bgColor: 'var(--primary-100)',
      iconColor: 'var(--primary-700)',
      path: '/dashboard/supporter-portal/posts/add',
      subModule: 'posts',
    },
    {
      label: 'Add Event',
      icon: <EventSchedule size={20} />,
      bgColor: 'var(--info-light)',
      iconColor: 'var(--info)',
      path: '/dashboard/supporter-portal/events/add',
      subModule: 'events',
    },
    {
      label: 'Add Announcement',
      icon: <Bullhorn size={20} />,
      bgColor: 'var(--success-light)',
      iconColor: 'var(--success)',
      path: '/dashboard/supporter-portal/announcements/add',
      subModule: 'announcements',
    },
    {
      label: 'Add Member',
      icon: <UserMultiple size={20} />,
      bgColor: 'var(--warning-light)',
      iconColor: 'var(--warning)',
      path: '/dashboard/supporter-portal/members/add',
      subModule: 'members',
    },
    {
      label: 'Add Gallery',
      icon: <Image size={20} />,
      bgColor: 'var(--neutral-200)',
      iconColor: 'var(--neutral-700)',
      path: '/dashboard/supporter-portal/gallery/add',
      subModule: 'gallery',
    },
  ];

  const actions = allActions.filter((a) => canAddTo.has(a.subModule));

  if (actions.length === 0) return null;

  return (
    <div className="xui-bg-white xui-bdr-rad-half xui-overflow-hidden" style={{ border: '1px solid var(--neutral-200)' }}>
      <div className="xui-p-1 xui-d-flex xui-flex-ai-center xui-flex-jc-between" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
        <h3 className="xui-font-sz-90 xui-font-w-600" style={{ color: 'var(--neutral-900)' }}>Quick Actions</h3>
      </div>
      <div className="xui-p-1">
        <div className="xui-d-grid xui-grid-col-2 xui-lg-grid-col-5 xui-grid-gap-1">
          {actions.map((action) => (
            <button
              key={action.label}
              className="xui-d-flex xui-flex-ai-center xui-flex-dir-column xui-text-center xui-p-half xui-bdr-rad-half xui-cursor-pointer"
              style={{ background: '#FFFFFF', border: '1px solid var(--neutral-200)', transition: 'all 0.24s ease' }}
              onClick={() => router.push(action.path)}
            >
              <div
                className="xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-bdr-rad-half"
                style={{ width: '36px', height: '36px', backgroundColor: action.bgColor, color: action.iconColor }}
              >
                <span className="icon-container">{action.icon}</span>
              </div>
              <span className="xui-font-sz-80 xui-mt-half" style={{ color: 'var(--neutral-700)' }}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
