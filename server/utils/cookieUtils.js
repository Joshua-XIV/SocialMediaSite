// Sets both access and refresh tokens in cookies
export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "prod",
    sameSite: 'strict',
    maxAge: process.env.ACCESS_TOKEN_DURATION,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "prod",
    sameSite: 'strict',
    maxAge: process.env.REFRESH_TOKEN_DURATION,
  });
}

// Sets only access token in cookies
export const setAccessAuthCookies = (res, accessToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "prod",
    sameSite: 'strict',
    maxAge: process.env.ACCESS_TOKEN_DURATION,
  });
}

// Clears tokens from cookies
export const clearAuthCookies = (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
}