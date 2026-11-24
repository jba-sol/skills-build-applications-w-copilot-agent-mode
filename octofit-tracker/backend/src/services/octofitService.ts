import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw httpError(400, 'A valid activity payload is required');
  }

  const body = input as Record<string, unknown>;
  const { userId, teamId, type, minutes } = body;
  if (!isObjectId(userId) || !isObjectId(teamId)) {
    throw httpError(400, 'Valid userId and teamId values are required');
  }
  if (typeof type !== 'string' || type.trim().length === 0) {
    throw httpError(400, 'Activity type is required');
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw httpError(400, 'Minutes must be a positive number');
  }

  const [user, team] = await Promise.all([
    User.findById(userId).lean(),
    Team.findById(teamId).lean(),
  ]);
  if (!user || !team) {
    throw httpError(404, 'User or team not found');
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw httpError(400, 'A valid team payload is required');
  }

  const body = input as Record<string, unknown>;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const mascot = typeof body.mascot === 'string' ? body.mascot.trim() : '';
  if (!name) {
    throw httpError(400, 'Team name is required');
  }
  if (!mascot) {
    throw httpError(400, 'Team mascot is required');
  }

  const rawMembers = body.members ?? [];
  if (!Array.isArray(rawMembers) || rawMembers.some((member) => !isObjectId(member))) {
    throw httpError(400, 'Team members must be valid user IDs');
  }

  const memberIds = [...new Set(rawMembers)] as string[];
  const users = await User.find({ _id: { $in: memberIds } }).select('_id').lean();
  if (users.length !== memberIds.length) {
    throw httpError(404, 'One or more team members were not found');
  }

  const team = await Team.create({
    name,
    mascot,
    members: memberIds,
  });
  if (memberIds.length > 0) {
    await User.updateMany({ _id: { $in: memberIds } }, { $set: { team: team._id } });
  }
  return team;
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
  ]);
  const teams = await Team.find({
    _id: { $in: totals.map((entry) => entry._id) },
  }).lean();
  const teamsById = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return totals
    .map((entry) => ({
      teamName: teamsById.get(entry._id.toString()) ?? 'Unknown team',
      totalPoints: entry.totalPoints,
    }))
    .filter((entry) => entry.teamName !== 'Unknown team')
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const normalizedEmail = decodeURIComponent(userEmail).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).lean();
  if (!user) {
    throw httpError(404, 'User not found');
  }

  const recentActivities = await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .limit(5)
    .lean();
  const recentTypes = recentActivities.map((activity) => activity.type.toLowerCase());
  const goal = typeof user.fitnessGoal === 'string' ? user.fitnessGoal.toLowerCase() : '';
  const preferredFocuses = [goal, ...recentTypes].filter((focus, index, all) => focus && all.indexOf(focus) === index);

  const workouts = await Workout.find().lean();
  const matched = workouts.filter((workout) =>
    preferredFocuses.includes(workout.focus.toLowerCase()),
  );
  const suggestions = (matched.length > 0 ? matched : workouts).map((workout) => ({
    ...workout,
    reason: recentTypes.length > 0
      ? `Matches your recent ${recentTypes.join(', ')} activity and ${goal || workout.focus} goal.`
      : `Matches your ${goal || workout.focus} fitness goal.`,
  }));

  return suggestions;
}

export { User };
