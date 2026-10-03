export type HealthStatus = {
  status: 'ok';
};

export type UserRole = 'student' | 'mentor' | 'administrator';

export type UserProfileDto = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
};

export type SignInDto = {
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number | null;
  };
  user: UserProfileDto;
};

export type MessageDto = {
  message: string;
};

export type ApiErrorDto = {
  message: string;
};
