import { renderAuthenticationPage } from '../../../lib/authentication-page';

export default async function PasswordResetPage() {
  return renderAuthenticationPage('reset');
}

