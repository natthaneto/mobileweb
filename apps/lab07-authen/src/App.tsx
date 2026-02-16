import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import Login from './pages/Login'; // อย่าลืมสร้างไฟล์นี้
import React, { useEffect, useState } from 'react';
import { authService } from './auth/auth-service';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // ตรวจสอบสถานะการ Login เมื่อเปิดแอป
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  // แสดงหน้าว่างๆ หรือ Loading ระหว่างเช็ค Auth
  if (isAuthenticated === null) return null;

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Route สำหรับหน้า Login */}
          <Route exact path="/login">
            {isAuthenticated ? <Redirect to="/tabs/tab1" /> : <Login />}
          </Route>

          {/* Route สำหรับหน้า Tabs (ต้อง Login ก่อน) */}
          <Route path="/tabs" render={() => 
            isAuthenticated ? <Tabs /> : <Redirect to="/login" />
          } />

          {/* Redirect หน้าแรกไป Login หรือ Tab1 ตามสถานะ */}
          <Route exact path="/">
            <Redirect to={isAuthenticated ? "/tabs/tab1" : "/login"} />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

// แยกส่วน Tabs ออกมาเพื่อให้โค้ดอ่านง่าย
const Tabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/tabs/tab1"><Tab1 /></Route>
      <Route exact path="/tabs/tab2"><Tab2 /></Route>
      <Route path="/tabs/tab3"><Tab3 /></Route>
    </IonRouterOutlet>
    <IonTabBar slot="bottom">
      <IonTabButton tab="tab1" href="/tabs/tab1">
        <IonIcon aria-hidden="true" icon={triangle} />
        <IonLabel>Tab 1</IonLabel>
      </IonTabButton>
      <IonTabButton tab="tab2" href="/tabs/tab2">
        <IonIcon aria-hidden="true" icon={ellipse} />
        <IonLabel>Tab 2</IonLabel>
      </IonTabButton>
      <IonTabButton tab="tab3" href="/tabs/tab3">
        <IonIcon aria-hidden="true" icon={square} />
        <IonLabel>Tab 3</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

export default App;