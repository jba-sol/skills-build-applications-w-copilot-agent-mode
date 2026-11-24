import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot?: string; members?: string[] };

export default function Teams() {
  return (
    <CapabilityCard<{ teams: Team[] }>
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      emptyText="No teams found."
      getItems={(data) => data.teams}
      renderItems={(items) => (
        <ul className="list-group">
          {(items as Team[]).map((team, index) => (
            <li className="list-group-item" key={`${team.name}-${index}`}>
              {team.name}{team.mascot ? ` - ${team.mascot}` : ''}
              {team.members?.length ? ` (${team.members.length} members)` : ''}
            </li>
          ))}
        </ul>
      )}
    />
  );
}
