import { LegalSection } from "@/components/legal/legal-section";
import { siteConfig } from "@/config/site";

export function PrivacyPolicyContent() {
  return (
    <>
      <LegalSection id="introduction" title="1. Introduction">
        <p>
          This Privacy Policy describes how {siteConfig.name} (&quot;Kat,&quot;
          &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, discloses,
          and protects information when you use our Discord bot, web dashboard, and
          related services (collectively, the &quot;Service&quot;).
        </p>
        <p>
          By accessing or using the Service, you agree to the practices described in
          this policy. If you do not agree, please do not use the Service.
        </p>
      </LegalSection>

      <LegalSection id="scope" title="2. Scope and Roles">
        <p>
          Kat operates as a third-party application for Discord servers. We are not
          affiliated with, endorsed by, or sponsored by Discord Inc. Your use of Discord
          is also governed by Discord&apos;s Terms of Service and Privacy Policy.
        </p>
        <p>
          For server administrators who add Kat to a Discord guild (&quot;Server
          Operators&quot;), you are responsible for informing your community members
          that the bot is present and for configuring Kat in compliance with applicable
          laws and Discord&apos;s policies.
        </p>
      </LegalSection>

      <LegalSection id="information-we-collect" title="3. Information We Collect">
        <h3>3.1 Information from Discord (OAuth)</h3>
        <p>
          When you sign in through Discord OAuth2, we may receive information that
          Discord shares with us based on the scopes you authorize, which may include:
        </p>
        <ul>
          <li>Discord user ID, username, display name, and avatar</li>
          <li>Email address (only if you grant the email scope)</li>
          <li>
            List of Discord servers (guilds) you belong to and your permissions within
            them
          </li>
        </ul>

        <h3>3.2 Server and Bot Usage Data</h3>
        <p>When Kat is used in a Discord server, we may process:</p>
        <ul>
          <li>
            Server (guild) IDs, names, icons, and configuration settings you choose in
            the dashboard
          </li>
          <li>
            Member join events and related metadata needed for dashboard features (e.g.,
            recent members)
          </li>
          <li>
            Command usage, moderation actions, and feature settings as enabled by Server
            Operators
          </li>
          <li>
            Technical logs required for security, debugging, and service reliability
          </li>
        </ul>

        <h3>3.3 Information You Provide</h3>
        <p>
          We may collect information you submit through the dashboard, support channels,
          or feedback forms, such as configuration preferences and correspondence with
          our team.
        </p>

        <h3>3.4 Automatically Collected Information</h3>
        <p>When you use the web dashboard, we may automatically collect:</p>
        <ul>
          <li>
            IP address, browser type, device information, and general location
            (country/region)
          </li>
          <li>
            Session identifiers, authentication tokens, and cookies or similar
            technologies
          </li>
          <li>
            Usage analytics such as pages visited and actions taken within the dashboard
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="how-we-use" title="4. How We Use Information">
        <p>We use collected information to:</p>
        <ul>
          <li>Provide, operate, maintain, and improve the Service</li>
          <li>
            Authenticate users and enforce access controls for server administration
          </li>
          <li>Display dashboard features, including server management and analytics</li>
          <li>Respond to support requests and communicate about the Service</li>
          <li>
            Detect, prevent, and address fraud, abuse, security incidents, and technical
            issues
          </li>
          <li>Comply with legal obligations and enforce our Terms of Service</li>
        </ul>
        <p>
          We do not sell your personal information. We do not use Discord data to serve
          third-party advertising within Discord.
        </p>
      </LegalSection>

      <LegalSection id="legal-bases" title="5. Legal Bases (EEA/UK)">
        <p>
          Where applicable under the GDPR or UK GDPR, we process personal data based on:
          (a) performance of a contract (providing the Service); (b) legitimate
          interests (security, improvement, fraud prevention); (c) consent where
          required (e.g., optional communications); and (d) legal obligations.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="6. How We Share Information">
        <p>We may share information only in the following circumstances:</p>
        <ul>
          <li>
            <strong>Service providers:</strong> Hosting, databases, monitoring, and
            infrastructure partners bound by confidentiality and data-processing
            obligations
          </li>
          <li>
            <strong>Discord:</strong> As necessary to operate the bot and OAuth flows
            through Discord&apos;s APIs
          </li>
          <li>
            <strong>Legal requirements:</strong> When required by law, regulation, legal
            process, or governmental request
          </li>
          <li>
            <strong>Business transfers:</strong> In connection with a merger,
            acquisition, or sale of assets, with notice where required by law
          </li>
          <li>
            <strong>With your direction:</strong> When you explicitly request or
            authorize sharing
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="retention" title="7. Data Retention">
        <p>
          We retain information only as long as necessary to fulfill the purposes
          described in this policy, unless a longer retention period is required by law.
          When you remove Kat from a server or delete your account, we will delete or
          anonymize associated data within a reasonable period, subject to backup cycles
          and legal holds.
        </p>
      </LegalSection>

      <LegalSection id="security" title="8. Security">
        <p>
          We implement technical and organizational measures designed to protect
          information, including encryption in transit (HTTPS/TLS), access controls, and
          secure handling of authentication tokens. No method of transmission or storage
          is completely secure; we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="9. Your Rights and Choices">
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access, correct, or delete personal data we hold about you</li>
          <li>Object to or restrict certain processing</li>
          <li>Data portability</li>
          <li>Withdraw consent where processing is consent-based</li>
          <li>Lodge a complaint with a supervisory authority</li>
        </ul>
        <p>
          You may revoke Kat&apos;s access via Discord account settings (Authorized
          Apps) or remove the bot from your server. To exercise privacy rights, contact
          us using the details in Section 12.
        </p>
      </LegalSection>

      <LegalSection id="children" title="10. Children">
        <p>
          The Service is not directed to children under 13 (or the minimum age required
          in your jurisdiction). We do not knowingly collect personal information from
          children. If you believe we have collected such information, contact us and we
          will take appropriate steps to delete it.
        </p>
      </LegalSection>

      <LegalSection id="international" title="11. International Transfers">
        <p>
          Your information may be processed in countries other than your own. Where
          required, we use appropriate safeguards for cross-border transfers, such as
          Standard Contractual Clauses or equivalent mechanisms.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="12. Contact Us">
        <p>
          For privacy-related questions or requests, contact us at:{" "}
          <a href="mailto:privacy@kat.bot">privacy@kat.bot</a>
        </p>
        <p className="text-sm text-muted-foreground">
          Replace this email with your official contact address before production
          deployment.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="13. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will post the revised
          version on this page and update the &quot;Last updated&quot; date. Material
          changes may be communicated through the dashboard or other reasonable means.
          Continued use after changes constitutes acceptance of the updated policy.
        </p>
      </LegalSection>
    </>
  );
}
