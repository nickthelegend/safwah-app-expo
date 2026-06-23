import { Redirect } from 'expo-router';

import { useSession } from '../provider/SessionProvider';

/// Entry gate: send users to onboarding until they connect a wallet (or enter demo mode).
export default function Index() {
  const { isAuthed } = useSession();
  return <Redirect href={isAuthed ? '/(tabs)' : '/onboarding'} />;
}
