import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { awsConfig, validateAwsConfig } from '../config/aws';
import { AuthService } from '../services/authService';
import { Amplify } from 'aws-amplify';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [isAmplifyConfigured, setAmplifyConfigured] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      validateAwsConfig();

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

      const checkAuth = async () => {
        try {
          const user = await AuthService.getCurrentUser();
          if (user) {
            console.log("User logged in:", user);
          }
        } catch (error) {
          console.error(error);
        }
      };

      checkAuth();
    }
  }, []);

  if (!isAmplifyConfigured) return null; 

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
