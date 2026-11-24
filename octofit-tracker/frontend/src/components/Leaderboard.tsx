import { CapabilityCard } from './CapabilityCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return (
    <CapabilityCard<{ leaderboard: Entry[] }>
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      emptyText="No leaderboard rankings yet."
      getItems={(data) => data.leaderboard}
      renderItems={(items) => (
        <ol className="list-group list-group-numbered">
          {(items as Entry[]).map((entry) => (
            <li className="list-group-item d-flex justify-content-between" key={entry.teamName}>
              <span>{entry.teamName}</span>
              <strong>{entry.totalPoints} points</strong>
            </li>
          ))}
        </ol>
      )}
    />
  );
}
