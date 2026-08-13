import React from 'react';

export interface WorkspaceProfileOption { id: string; name: string; description: string; accent?: string; }

export function WorkspaceProfileSwitcher({ profiles, activeId, onSelect }: { profiles: WorkspaceProfileOption[]; activeId: string; onSelect: (id: string) => void }) {
  return <nav className="workspace-profile-switcher" aria-label="Workspace profiles">{profiles.map((profile) => <button key={profile.id} className={profile.id === activeId ? 'active' : ''} onClick={() => onSelect(profile.id)} title={profile.description}><span className="profile-accent" style={{ background: profile.accent ?? 'var(--cyber-accent)' }} />{profile.name}</button>)}</nav>;
}
