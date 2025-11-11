import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { awsConfig, validateAwsConfig } from '../config/aws';
import { AuthService } from '../services/authService';

export default function AppContent({ Component, pageProps }: any) {
  const [isAmplifyConfigured, setAmplifyConfigured] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    validateAwsConfig();

    try {
      Amplify.configure({
        Auth: {
          region: awsConfig.region,
          userPoolId: awsConfig.userPoolId,
          userPoolWebClientId: awsConfig.clientId,
          identityPoolId: awsConfig.identityPoolId,
        },
        Storage: {
          region: awsConfig.region,
          bucket: awsConfig.s3Bucket,
          identityPoolId: awsConfig.identityPoolId,
        },
      });

      setAmplifyConfigured(true);

      AuthService.getCurrentUser()
        .then(user => user && console.log("User logged in:", user))
        .catch(console.error);
    } catch (err) {
      console.error("Amplify configure error:", err);
    }
  }, []);

  if (!isAmplifyConfigured) return null;

  return <Component {...pageProps} />;
}
