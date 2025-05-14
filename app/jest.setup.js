// Import Jest DOM matchers
/* eslint-disable no-undef */
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Note: If you add NextAuth to your project, uncomment this mock
// jest.mock('next-auth/react', () => ({
//   useSession: jest.fn(() => ({
//     data: null,
//     status: 'unauthenticated',
//   })),
//   signIn: jest.fn(),
//   signOut: jest.fn(),
//   getSession: jest.fn(),
// }));

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
