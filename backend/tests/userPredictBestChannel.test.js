const mongoose = require('mongoose');
const User = require('../models/User');

describe('User.predictBestChannel', () => {
  it('returns preferredChannel if engagement > 0', () => {
    const user = {
      preferredChannel: 'email',
      channelEngagement: { email: 5, push: 0, inApp: 0, sms: 0 }
    };
    const result = User.predictBestChannel(user);
    expect(result).toBe('email');
  });

  it('returns channel with highest engagement if preferredChannel has 0', () => {
    const user = {
      preferredChannel: 'push',
      channelEngagement: { email: 2, push: 0, inApp: 7, sms: 0 }
    };
    const result = User.predictBestChannel(user);
    expect(result).toBe('in-app');
  });

  it('returns fallback if no engagement', () => {
    const user = {
      preferredChannel: 'push',
      channelEngagement: { email: 0, push: 0, inApp: 0, sms: 0 }
    };
    const result = User.predictBestChannel(user);
    expect(result).toBe('push');
  });

  it('returns fallback if no channelEngagement', () => {
    const user = { preferredChannel: 'email' };
    const result = User.predictBestChannel(user);
    expect(result).toBe('email');
  });

  it('returns in-app if no preferredChannel or engagement', () => {
    const user = { channelEngagement: { email: 0, push: 0, inApp: 0, sms: 0 } };
    const result = User.predictBestChannel(user);
    expect(result).toBe('in-app');
  });

  it('returns in-app if no data at all', () => {
    const user = {};
    const result = User.predictBestChannel(user);
    expect(result).toBe('in-app');
  });

  it('returns correct channel if best is inApp', () => {
    const user = {
      channelEngagement: { email: 1, push: 2, inApp: 5, sms: 0 }
    };
    const result = User.predictBestChannel(user);
    expect(result).toBe('in-app');
  });

  it('returns correct channel if best is push', () => {
    const user = {
      channelEngagement: { email: 1, push: 5, inApp: 2, sms: 0 }
    };
    const result = User.predictBestChannel(user);
    expect(result).toBe('push');
  });
});
