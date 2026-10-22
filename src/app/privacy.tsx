import { CONTACT_EMAIL, DocPage, H, Li, P } from '@/components/doc';

export default function Privacy() {
  return (
    <DocPage title="Privacy policy" updated="October 21, 2026">
      <P>
        WishChief is a savings tracker. You set a goal, log what you save and keep a wishlist. This page explains what
        the app stores, why, and how you can delete it.
      </P>

      <H>What we collect</H>
      <Li>Account details: your name and email. If you sign up with email, a hashed password (we never store it in plain text).</Li>
      <Li>If you sign in with Google: the name, email and profile picture address Google shares with us. We don&apos;t receive your Google password.</Li>
      <Li>What you enter: your savings goal, monthly target and currency, your saving entries (amount, category, description, date) and your wishes (name, price, priority, status).</Li>
      <Li>Sign-in sessions: a session token, its expiry, and the IP address and device/browser details of the sign-in, used to keep you signed in and to protect your account.</Li>
      <P>
        WishChief does not connect to your bank, does not ask for card or account numbers, and does not use your
        location, contacts, camera or microphone. The amounts you enter are just numbers you type.
      </P>

      <H>How we use it</H>
      <P>
        Only to run the app: to sign you in, to show your savings, progress and wishlist, and to keep your account
        secure. There is no advertising, no analytics or tracking SDK, and we do not sell or share your data for
        marketing.
      </P>

      <H>Who handles it for us</H>
      <Li>Neon (database hosting), which stores your account and savings data.</Li>
      <Li>Expo EAS Hosting, which runs the app&apos;s servers.</Li>
      <Li>Google, only if you choose Continue with Google.</Li>
      <P>These providers process data on our behalf to operate the app. Data is sent over encrypted (HTTPS) connections.</P>

      <H>How long we keep it</H>
      <P>
        Until you delete your account. Deleting your account removes your profile, sessions, goal, savings and wishes.
        Our database provider may keep short-lived technical backups that expire automatically.
      </P>

      <H>Your choices</H>
      <Li>Delete your account in the app: Settings, then Delete account. If you can&apos;t use the app, see the account deletion page.</Li>
      <Li>Ask what we hold about you, or ask for a correction, by emailing {CONTACT_EMAIL}.</Li>

      <H>Children</H>
      <P>WishChief is not directed at children under 13 and we do not knowingly collect their data.</P>

      <H>Changes</H>
      <P>If this policy changes we will update the date at the top of this page.</P>

      <H>Contact</H>
      <P>{CONTACT_EMAIL}</P>
    </DocPage>
  );
}
