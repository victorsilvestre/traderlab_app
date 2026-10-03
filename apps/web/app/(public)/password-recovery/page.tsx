import { renderAuthenticationPage } from '../../../lib/authentication-page';

export default async function PasswordRecoveryPage() {
  return renderAuthenticationPage('recovery');
}

