import { renderAuthenticationPage } from '../../../lib/authentication-page';

export default async function EmailConfirmationPage() {
  return renderAuthenticationPage('resend-confirmation');
}
