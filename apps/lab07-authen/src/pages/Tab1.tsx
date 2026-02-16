import React, { useEffect, useState } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, 
  IonItem, IonLabel, IonAvatar, IonText 
} from '@ionic/react';
import { auth } from '../firebase'; // Import auth มาจากไฟล์ที่เราแก้ไว้
import { onAuthStateChanged, User } from 'firebase/auth';

const Tab1: React.FC = () => {
  // 1. สร้าง State ไว้เก็บข้อมูล User
  const [user, setUser] = useState<User | null>(null);

  // 2. ใช้ useEffect ดักฟังสถานะตอนเปิดหน้าจอ
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // ถ้า Login แล้ว ให้เก็บข้อมูล User ไว้ใน state
      } else {
        setUser(null); // ถ้า Logout ให้เคลียร์ข้อมูล
      }
    });

    return () => unsubscribe(); // ล้างการดักฟังเมื่อออกจากหน้า
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>หน้าหลัก</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {user ? (
          /* ส่วนที่แสดงเมื่อ Login แล้ว */
          <IonItem lines="none" className="ion-margin-top">
            <IonAvatar slot="start">
              <img src={user.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg'} alt="profile" />
            </IonAvatar>
            <IonLabel>
              <h2>ยินดีต้อนรับ: {user.displayName || 'User'}</h2>
              <p>อีเมล: {user.email}</p>
            </IonLabel>
          </IonItem>
        ) : (
          /* ส่วนที่แสดงเมื่อยังไม่ได้ Login */
          <div className="ion-padding ion-text-center">
            <IonText color="medium">
              <p>กรุณาเข้าสู่ระบบเพื่อดูข้อมูล</p>
            </IonText>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab1;