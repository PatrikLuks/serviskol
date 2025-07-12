// Utility pro převod segmentu na MongoDB query
// Podporuje: role, email, region, age, ageMin, ageMax, lastLoginSince, engagementMin

module.exports = function buildSegmentQuery(segment = {}) {
  const query = {};
  if (segment.email) query.email = segment.email;
  if (segment.role) query.role = segment.role;
  if (segment.region) query.region = segment.region;
  if (segment.age) query.age = segment.age;
  if (segment.ageMin || segment.ageMax) {
    query.age = {};
    if (segment.ageMin) query.age.$gte = segment.ageMin;
    if (segment.ageMax) query.age.$lte = segment.ageMax;
  }
  if (segment.lastLoginSince) {
    query.lastLogin = { $gte: new Date(segment.lastLoginSince) };
  }
  if (segment.engagementMin) {
    query.engagementScore = { $gte: segment.engagementMin };
  }
  return query;
};
