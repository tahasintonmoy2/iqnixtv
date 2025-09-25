import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Section,
  Text,
  Hr,
  Preview,
} from "@react-email/components";
import * as React from "react";

interface LoginCodeEmailProps {
  validationCode?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

export const LoginCodeEmail = ({validationCode}: LoginCodeEmailProps) => (
  <Html>
    <Head/>
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
          🪄 Enter the following code to finish login
        </Heading>
        <Section style={body}>
          <Section style={codeContainer}>
            <Text style={code}>{validationCode}</Text>
          </Section>
          <Text style={paragraph}>
            This link and code will only be valid for the next 15 minutes after
            it was sent.
          </Text>
          <Text style={paragraph}>
            If you didn&apos;t request this, please ignore this email.
          </Text>
        </Section>
        <Text style={paragraph}>
          Best,
          <br/>- Iqnix Team
        </Text>
        <Hr style={hr}/>
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

export default LoginCodeEmail;

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

const hr = {
  borderColor: "#dddddd",
  marginTop: "48px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginLeft: "4px",
};

const codeContainer = {
  background: "rgba(0,0,0,.05)",
  borderRadius: "1rem",
  margin: "16px auto 14px",
  verticalAlign: "middle",
  width: "280px",
};

const code = {
  color: "#000",
  display: "inline-block",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "6px",
  lineHeight: "40px",
  paddingBottom: "8px",
  paddingTop: "8px",
  margin: "0 auto",
  width: "100%",
  textAlign: "center" as const,
};
