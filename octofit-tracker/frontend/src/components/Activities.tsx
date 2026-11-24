import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  return (
    <CapabilityCard<{ activities: Activity[] }>
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      emptyText="No activities yet."
      getItems={(data) => data.activities}
      renderItems={(items) => (
        <ul className="list-group">
          {(items as Activity[]).map((activity, index) => (
            <li className="list-group-item" key={`${activity.type}-${index}`}>
              {activity.type} - {activity.minutes} minutes - {activity.points} points
            </li>
          ))}
        </ul>
      )}
    />
  );
}
