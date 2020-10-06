/** Google OAuth Strategy */
import config from 'config';
const appUrl = config.get('appUrl');

const {
  clientSecret,
  clientId
} = config.get('googleOAuth');

const serverStrategy = {
  provider: 'google',
  password: 'cookie_encryption_password_secure',
  isSecure: false,
  clientId,
  clientSecret,
  location: appUrl
};

export default serverStrategy;
