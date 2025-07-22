
// Zajisti registraci všech modelů před importem userService
jest.mock('../models/User', () => {
  function User(data) {
    Object.assign(this, data);
    this._id = {
      toString: () => 'mocked-user-id'
    };
  }
  User.findOne = jest.fn();
  User.findById = jest.fn();
  User.prototype.save = jest.fn();
  return User;
});

// Zajisti registraci všech modelů před importem userService
require('../models');
const db = require('../db');
jest.mock('../models/User', () => {
  function MockUser(data) {
    Object.assign(this, data);
    this._id = {
      toString: () => 'mocked-user-id'
    };
  }
  MockUser.findOne = jest.fn();
  MockUser.findById = jest.fn();
  MockUser.prototype.save = jest.fn();
  return MockUser;
});
const User = require('../models/User');
// Explicitně zaregistruj mock do singletonu models v db.js
const modelsSingleton = require.cache[require.resolve('../db')].exports;
if (modelsSingleton && modelsSingleton.getModel && modelsSingleton.registerModel) {
  // Pokud je k dispozici registerModel, zaregistruj mock
  modelsSingleton.registerModel('User', User.schema || {});
  // Přepiš getModel, aby vracel mock
  const origGetModel = modelsSingleton.getModel;
  modelsSingleton.getModel = (name) => {
    if (name === 'User') return User;
    return origGetModel(name);
  };
}
const userService = require('../services/userService');
jest.mock('bcryptjs', () => ({ compare: jest.fn() }));
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'mocked-jwt-token') }));
jest.mock('../middleware/auditLog', () => ({ auditLog: jest.fn() }));
jest.mock('../utils/posthog', () => ({ captureEvent: jest.fn() }));
jest.mock('../utils/notificationUtils', () => ({ sendAdminNotification: jest.fn() }));

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register user', async () => {
    User.findOne.mockResolvedValue(null);
    User.prototype.save.mockResolvedValue();
    const user = await userService.registerUser({ name: 'Test', email: 'test@serviskol.cz', password: 'pass', role: 'client' });
    expect(user).toBeDefined();
    expect(User.prototype.save).toHaveBeenCalled();
  });

  it('should throw if user exists on register', async () => {
    User.findOne.mockResolvedValue({ email: 'test@serviskol.cz' });
    await expect(userService.registerUser({ name: 'Test', email: 'test@serviskol.cz', password: 'pass', role: 'client' })).rejects.toThrow('Uživatel již existuje.');
  });

  it('should login user and return token', async () => {
    User.findOne.mockResolvedValue({ _id: 'u1', email: 'test@serviskol.cz', passwordHash: 'hash', role: 'client', twoFactorEnabled: false });
    require('bcryptjs').compare.mockResolvedValue(true);
    const result = await userService.loginUser({ email: 'test@serviskol.cz', password: 'pass', ip: '127.0.0.1' });
    expect(result.token).toBe('mocked-jwt-token');
    expect(result.user).toBeDefined();
  });

  it('should require 2FA for admin', async () => {
    User.findOne.mockResolvedValue({ _id: 'u1', email: 'admin@serviskol.cz', passwordHash: 'hash', role: 'admin', twoFactorEnabled: false });
    require('bcryptjs').compare.mockResolvedValue(true);
    await expect(userService.loginUser({ email: 'admin@serviskol.cz', password: 'pass', ip: '127.0.0.1' })).rejects.toThrow('Pro tuto roli je povinné dvoufázové ověření. Aktivujte si 2FA.');
  });

  it('should throw on wrong password', async () => {
    User.findOne.mockResolvedValue({ _id: 'u1', email: 'test@serviskol.cz', passwordHash: 'hash', role: 'client', twoFactorEnabled: false });
    require('bcryptjs').compare.mockResolvedValue(false);
    await expect(userService.loginUser({ email: 'test@serviskol.cz', password: 'wrong', ip: '127.0.0.1' })).rejects.toThrow('Nesprávný email nebo heslo.');
  });

  it('should change user role', async () => {
    User.findById.mockResolvedValue({ _id: 'u2', email: 'user@serviskol.cz', role: 'client', save: jest.fn() });
    const adminUser = { role: 'admin', email: 'admin@serviskol.cz' };
    const user = await userService.changeUserRole({ adminUser, userId: 'u2', newRole: 'mechanic' });
    expect(user.role).toBe('mechanic');
  });

  it('should throw if not admin on changeUserRole', async () => {
    const adminUser = { role: 'client', email: 'user@serviskol.cz' };
    await expect(userService.changeUserRole({ adminUser, userId: 'u2', newRole: 'mechanic' })).rejects.toThrow('Pouze admin může měnit role.');
  });
});
