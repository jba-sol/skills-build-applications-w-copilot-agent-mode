import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; reason?: string; focus?: string };

export default function Workouts() {
  const email = 'mona@example.com';
  return (
    <CapabilityCard<{ suggestions: Workout[] }>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path={`/api/workouts/suggestions/${encodeURIComponent(email)}`}
      emptyText="No workout suggestions available."
      getItems={(data) => data.suggestions}
      renderItems={(items) => (
        <ul className="list-group">
          {(items as Workout[]).map((workout, index) => (
            <li className="list-group-item" key={`${workout.title}-${index}`}>
              <strong>{workout.title}</strong>
              {workout.reason ? ` - ${workout.reason}` : ''}
            </li>
          ))}
        </ul>
      )}
    />
  );
}
