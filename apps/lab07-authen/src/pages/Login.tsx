import { IonContent, IonPage, IonButton, IonItem, IonLabel, IonInput, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import React, { useState } from 'react';
import { authService } from '../auth/auth-service';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleEmailLogin = async () => {
    try {
      await authService.loginWithEmailPassword({ email, password });
      history.replace('/tab1');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authService.loginWithGoogle();
      history.replace('/tab1');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>Login</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Email</IonLabel>
          <IonInput value={email} onIonInput={(e) => setEmail(e.detail.value!)} />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Password</IonLabel>
          <IonInput type="password" value={password} onIonInput={(e) => setPassword(e.detail.value!)} />
        </IonItem>
        
        <div id="recaptcha-container"></div> {/* สำหรับ Phone Login  */}

        <IonButton expand="block" onClick={handleEmailLogin}>Login with Email</IonButton>
        <IonButton expand="block" color="danger" onClick={handleGoogleLogin}>Login with Google</IonButton>
        <IonButton expand="block" color="tertiary" routerLink="/login-phone">Login with Phone</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;