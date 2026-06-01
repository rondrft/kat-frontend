import { LegalSection } from "@/components/legal/legal-section";
import { siteConfig } from "@/config/site";

export function TermsOfServiceContent() {
  return (
    <>
      <LegalSection id="agreement" title="1. Agreement to Terms">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of
          the {siteConfig.name} Discord bot, web dashboard, APIs, and related services
          (collectively, the &quot;Service&quot;) operated by {siteConfig.name}{" "}
          (&quot;Kat,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
        </p>
        <p>
          By inviting the bot to a Discord server, signing in to the dashboard, or
          otherwise using the Service, you agree to these Terms and our Privacy Policy.
          If you do not agree, do not use the Service.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" title="2. Eligibility">
        <p>
          You must be at least 13 years old (or the minimum age required in your
          jurisdiction) and able to form a binding contract. If you use the Service on
          behalf of a server or organization, you represent that you have authority to
          bind that entity to these Terms.
        </p>
      </LegalSection>

      <LegalSection id="discord" title="3. Discord Relationship">
        <p>
          Kat is an independent third-party application. Discord is a trademark of
          Discord Inc. We are not affiliated with, endorsed by, or sponsored by Discord.
          Your use of Discord is subject to Discord&apos;s Terms of Service, Community
          Guidelines, Developer Policy, and Developer Terms of Service.
        </p>
        <p>
          You must comply with all applicable Discord policies. We may suspend or
          terminate access if we reasonably believe your use violates Discord rules or
          puts the Service at risk.
        </p>
      </LegalSection>

      <LegalSection id="service" title="4. Description of the Service">
        <p>
          Kat provides Discord server management and automation tools, which may include
          moderation, configuration, analytics, music or utility features, and dashboard
          administration. Features may change, be added, or be removed at any time.
        </p>
        <p>
          The Service is provided on an &quot;as is&quot; and &quot;as available&quot;
          basis. We do not guarantee uninterrupted, error-free, or secure operation.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="5. Accounts and Authorization">
        <p>
          Dashboard access requires authentication via Discord OAuth2. You are
          responsible for maintaining the security of your Discord account and for all
          activity under your session.
        </p>
        <p>
          Server Operators must only grant Kat permissions appropriate for intended
          features. You are responsible for reviewing bot permissions before and after
          installation.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="6. Acceptable Use">
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Violate any applicable law, regulation, or third-party rights</li>
          <li>Violate Discord&apos;s Terms, policies, or API restrictions</li>
          <li>Harass, abuse, threaten, or harm others, or promote illegal activity</li>
          <li>Distribute malware, spam, or unauthorized advertising</li>
          <li>Attempt to gain unauthorized access to systems, accounts, or data</li>
          <li>
            Reverse engineer, scrape, or overload the Service except as permitted by law
          </li>
          <li>
            Use the Service to process unlawful content or facilitate illegal conduct
          </li>
          <li>Circumvent rate limits, security measures, or access controls</li>
        </ul>
        <p>
          We reserve the right to investigate violations and cooperate with law
          enforcement or Discord as appropriate.
        </p>
      </LegalSection>

      <LegalSection id="server-operator" title="7. Server Operator Responsibilities">
        <p>If you add Kat to a Discord server, you agree that:</p>
        <ul>
          <li>You have permission to add bots and configure server settings</li>
          <li>You will provide appropriate notice to members where required by law</li>
          <li>
            You are responsible for rules, moderation decisions, and member disputes in
            your server
          </li>
          <li>
            You will not use Kat in ways that endanger minors or violate applicable
            privacy laws
          </li>
          <li>
            You will configure features (e.g., logging, moderation) in a lawful and
            proportionate manner
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="intellectual-property" title="8. Intellectual Property">
        <p>
          The Service, including software, branding, design, and documentation, is owned
          by Kat or its licensors and protected by intellectual property laws. You
          receive a limited, non-exclusive, non-transferable, revocable license to use
          the Service in accordance with these Terms.
        </p>
        <p>
          You retain ownership of content you submit. You grant us a license to host,
          process, and display such content solely to operate and improve the Service.
        </p>
      </LegalSection>

      <LegalSection id="third-party" title="9. Third-Party Services">
        <p>
          The Service may integrate with third-party services (including Discord and
          hosting providers). We are not responsible for third-party services and
          disclaim liability arising from their acts or omissions.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="10. Suspension and Termination">
        <p>
          We may suspend or terminate your access to the Service at any time, with or
          without notice, for conduct that we believe violates these Terms, creates
          risk, or is otherwise harmful.
        </p>
        <p>
          You may stop using the Service at any time by removing the bot from your
          server and revoking OAuth authorization in Discord settings.
        </p>
      </LegalSection>

      <LegalSection id="disclaimers" title="11. Disclaimers">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED WITHOUT
          WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING
          IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          TITLE, AND NON-INFRINGEMENT.
        </p>
        <p>
          We do not warrant that the Service will meet your requirements, that data will
          be accurate or reliable, or that defects will be corrected.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="12. Limitation of Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, KAT AND ITS OFFICERS, DIRECTORS,
          EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA,
          GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING FROM YOUR USE OF THE SERVICE.
        </p>
        <p>
          OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR
          THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE
          TWELVE (12) MONTHS BEFORE THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS (USD
          $100).
        </p>
        <p>
          Some jurisdictions do not allow certain limitations; in those cases, our
          liability is limited to the fullest extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" title="13. Indemnification">
        <p>
          You agree to defend, indemnify, and hold harmless Kat and its affiliates from
          claims, damages, losses, and expenses (including reasonable attorneys&apos;
          fees) arising from your use of the Service, your violation of these Terms,
          your violation of any law or third-party rights, or content and conduct in
          servers you administer.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="14. Governing Law and Disputes">
        <p>
          These Terms are governed by the laws of the jurisdiction in which Kat is
          established, without regard to conflict-of-law principles. You agree to
          attempt good-faith resolution before initiating formal proceedings. Where
          permitted, disputes will be resolved in the courts of that jurisdiction.
        </p>
        <p className="text-sm text-muted-foreground">
          Update this section with your actual legal entity location before production
          deployment.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="15. Changes to Terms">
        <p>
          We may modify these Terms at any time. We will post the updated Terms on this
          page and update the &quot;Last updated&quot; date. Material changes may
          require additional notice. Continued use after changes become effective
          constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="16. Contact">
        <p>
          For questions about these Terms, contact us at:{" "}
          <a href="mailto:legal@kat.bot">legal@kat.bot</a>
        </p>
        <p className="text-sm text-muted-foreground">
          Replace this email with your official contact address before production
          deployment.
        </p>
      </LegalSection>
    </>
  );
}
