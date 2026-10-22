import { CONTACT_EMAIL, DocPage, H, Li, P } from '@/components/doc';

export default function DeleteAccount() {
  return (
    <DocPage title="Delete your WishChief account" updated="October 21, 2026">
      <P>You can delete your WishChief account and everything saved in it at any time.</P>

      <H>In the app</H>
      <Li>Open WishChief and sign in.</Li>
      <Li>Tap the gear icon on Home to open Settings.</Li>
      <Li>Scroll to Delete account. Email accounts enter their password to confirm; Google accounts must have signed in within the last day.</Li>
      <Li>Confirm. Deletion happens immediately.</Li>

      <H>On the web</H>
      <P>The same Settings screen is available after signing in at https://wishchief.expo.app.</P>

      <H>Can&apos;t sign in or no longer have the app?</H>
      <P>
        Email {CONTACT_EMAIL} from the address you signed up with and ask us to delete your account. We will delete it
        within 30 days and reply to confirm.
      </P>

      <H>What is deleted</H>
      <Li>Your profile (name, email, sign-in details) and active sessions.</Li>
      <Li>Your goal, monthly target and currency.</Li>
      <Li>All your saving entries, categories and wishes.</Li>
      <P>
        Our database provider may keep short-lived technical backups that expire automatically. We don&apos;t use them
        for anything else.
      </P>
    </DocPage>
  );
}
