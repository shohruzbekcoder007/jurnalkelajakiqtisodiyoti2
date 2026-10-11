import { useState } from 'react';
import CalendarWidget from './CalendarWidget.jsx';
import { SIDEBAR_S1_TITLE, SIDEBAR_S2_TITLE } from '../config.js';

function Sidebar({ id, position, children, topTitle }) {
  // The theme keeps sidebars collapsed and lets a toggle button expand them
  // on mid-size screens; wider viewports show them expanded regardless.
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div
      className={`sidebar ${id} ${collapsed ? 'collapsed' : 'expanded'}`}
      data-position={position}
      data-layout="col-3cm"
      data-sb-id={id}
    >
      <button
        className="sidebar-toggle"
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        onClick={() => setCollapsed((v) => !v)}
        type="button"
      >
        <i className="fas sidebar-toggle-arrows" />
      </button>

      <div className="sidebar-content">
        {topTitle && (
          <div className="sidebar-top group">
            <p>{topTitle}</p>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/**
 * "Qisqa havolalar" — the original site has this sidebar registered with its
 * heading but no widgets assigned to it, so it renders as a title bar only.
 * Drop widgets in as children to fill it.
 */
export function SidebarLeft() {
  return <Sidebar id="s1" position="left" topTitle={SIDEBAR_S1_TITLE} />;
}

/** "Ruknlar" — holds the calendar block, as on the original. */
export function SidebarRight() {
  return (
    <Sidebar id="s2" position="right" topTitle={SIDEBAR_S2_TITLE}>
      <CalendarWidget />
    </Sidebar>
  );
}

export default Sidebar;
