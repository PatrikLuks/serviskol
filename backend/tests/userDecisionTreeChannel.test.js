const mongoose = require('mongoose');
const User = require('../models/User');

describe('User.decisionTreeChannel', () => {
  it('returns preferred channel if engagement > 0', () => {
    const user = {
      preferredChannel: 'email',
      channelEngagement: { email: 5, push: 0, inApp: 0, sms: 0 }
    };
    const result = User.decisionTreeChannel(user);
    expect(result).toEqual({ channel: 'email', reason: expect.stringContaining('Preferovaný') });
  });

  it('returns push for young user with higher push engagement', () => {
    const user = {
      age: 25,
      channelEngagement: { email: 1, push: 10, inApp: 0, sms: 0 }
    };
    const result = User.decisionTreeChannel(user);
    expect(result.channel).toBe('push');
  });

  it('returns email for old user with higher email engagement', () => {
    const user = {
      age: 60,
      channelEngagement: { email: 8, push: 2, inApp: 0, sms: 0 }
    };
    const result = User.decisionTreeChannel(user);
    expect(result.channel).toBe('email');
  });

  it('returns in-app for Praha region with highest inApp engagement', () => {
    const user = {
      region: 'Praha',
      channelEngagement: { email: 2, push: 1, inApp: 5, sms: 0 }
    };
    const result = User.decisionTreeChannel(user);
    expect(result.channel).toBe('in-app');
  });

  it('returns channel with highest engagement if no other rule matches', () => {
    const user = {
      channelEngagement: { email: 1, push: 3, inApp: 7, sms: 2 }
    };
    const result = User.decisionTreeChannel(user);
    expect(result.channel).toBe('in-app');
  });

  it('returns fallback if no engagement or preferred channel', () => {
    const user = {
      channelEngagement: { email: 0, push: 0, inApp: 0, sms: 0 }
    };
    const result = User.decisionTreeChannel(user);
    expect(result.channel).toBe('in-app');
    expect(result.reason).toMatch(/fallback/i);
  });

  it('returns fallback if no channelEngagement at all', () => {
    const user = {};
    const result = User.decisionTreeChannel(user);
    expect(result.channel).toBe('in-app');
  });
});
