// src/tests/LoginScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../app/login';
import { authApi } from '../../src/api/auth.api';
import { AuthProvider } from '../../src/store/auth.store';

jest.mock('../../src/api/auth.api');

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('LoginScreen', () => {
  it('calls API and updates store on success', async () => {
    (authApi.login as jest.Mock).mockResolvedValueOnce({
      token: 'jwt',
      user: { id: '1', email: 't@test.com', username: 'test' },
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />, { wrapper });

    fireEvent.changeText(getByPlaceholderText('Email'), 't@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'secret');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 't@test.com',
        password: 'secret',
      });
    });
  });

  it('shows error on failure', async () => {
    (authApi.login as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

    const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />, { wrapper });

    fireEvent.changeText(getByPlaceholderText('Email'), 't@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrong');
    fireEvent.press(getByText('Login'));

    expect(await findByText(/Invalid credentials/i)).toBeTruthy();
  });
});
