const fs = require('fs');
const path = require('path');

const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

function readSessions() {
  try {
    const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function writeSessions(sessions) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

function updateSession(email, browserId) {
  const sessions = readSessions();
  sessions[email] = browserId;
  writeSessions(sessions);
}

function getSession(email) {
  const sessions = readSessions();
  return sessions[email];
}

function deleteSession(email) {
  const sessions = readSessions();
  delete sessions[email];
  writeSessions(sessions);
}

module.exports = {
  readSessions,
  writeSessions,
  updateSession,
  getSession,
  deleteSession
};
