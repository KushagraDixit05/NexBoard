import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}));

describe('AuthStore Integration', () => {
  let localStorageMock: { [key: string]: string } = {};

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
      },
      writable: true,
    });
  });

  beforeEach(() => {
    localStorageMock = {};
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  });

  it('should authenticate user and store tokens on successful login', async () => {
    const mockUser = { _id: '1', username: 'testuser', email: 'test@test.com' };
    const mockResponse = {
      data: {
        user: mockUser,
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
      },
    };

    (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    await useAuthStore.getState().login({ email: 'test@test.com', password: 'password123' });

    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'password123' });
    expect(window.localStorage.setItem).toHaveBeenCalledWith('accessToken', 'access_token_123');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh_token_123');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should format state correctly on unsuccessful login (error throwing)', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));
    
    await expect(useAuthStore.getState().login({ email: 'test@test.com', password: 'wrongpassword' })).rejects.toThrow('Invalid credentials');
    
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
