import { renderAuthenticationPage } from '../../../lib/authentication-page';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return renderAuthenticationPage(
    'sign-in',
    Array.isArray(next) ? next[0] : next,
  );
}

