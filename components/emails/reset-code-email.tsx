import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ResetPasswordCodeEmailProps {
  validationCode?: string;
  userFirstName?: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

export const ResetPasswordCodeEmail = ({
  userFirstName,
  validationCode,
}: ResetPasswordCodeEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Log in with this validation code.</Preview>
      <Container style={container}>
        <Img
          src={`${baseUrl}/static/raycast-logo.png`}
          width={48}
          height={48}
          alt="Raycast"
        />
        <Heading style={heading}>
         👋 Hello, {userFirstName}
        </Heading>
        <Text>🪄 Enter the following code to finish reset password</Text>
        <Section style={body}>
          <Text style={paragraph}>
            <Link style={link} href={`${baseUrl}/auth/reset-password?token=${validationCode}`}>
              Reset your password
            </Link>
          </Text>
          <Text style={paragraph}>
            This link and code will only be valid for the next 15 minutes after it was sent.
          </Text>
          <Text style={paragraph}>
            If you didn&apos;t request this, please ignore this email.
          </Text>
        </Section>
        <Text style={paragraph}>
          Best,
          <br />- Iqnix Team
        </Text>
        <Hr style={hr} />
        <Img
          src={`${baseUrl}/static/raycast-logo.png`}
          width={32}
          height={32}
          style={{
            WebkitFilter: "grayscale(100%)",
            filter: "grayscale(100%)",
            margin: "20px 0",
          }}
        />
        <Text style={footer}>Iqnix TV.</Text>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordCodeEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 25px 48px",
  backgroundImage: 'url("/static/raycast-bg.png")',
  backgroundPosition: "bottom",
  backgroundRepeat: "no-repeat, no-repeat",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  marginTop: "48px",
};

const body = {
  margin: "24px 0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
};

const link = {
  color: "#0a85ea",
};

const hr = {
  borderColor: "#dddddd",
  marginTop: "48px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginLeft: "4px",
};
