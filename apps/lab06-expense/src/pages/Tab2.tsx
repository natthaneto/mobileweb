import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, 
  IonInput, IonSelect, IonSelectOption, IonTextarea, IonButton, 
  IonList, IonItem, useIonRouter, IonAlert 
} from '@ionic/react';
import React, { useState } from 'react';
import { collection, addDoc } from "firebase/firestore"; 
import { db } from "../firebase";

const Tab2: React.FC = () => {
  const router = useIonRouter();

  // State สำหรับฟอร์ม
  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<string>("expense");
  const [category, setCategory] = useState<string>("");
  const [note, setNote] = useState<string>("");

  // 1. เพิ่ม State สำหรับควบคุมการเปิด/ปิด Alert
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // ฟังก์ชันสำหรับล้างข้อมูลในฟอร์มเพื่อบันทึกใหม่
  const resetForm = () => {
    setTitle("");
    setAmount(0);
    setCategory("");
    setNote("");
    setType("expense");
  };

  const saveExpense = async () => {
    if (!title || amount <= 0) {
      alert("กรุณากรอกชื่อรายการและจำนวนเงินให้ถูกต้อง");
      return;
    }

    try {
      await addDoc(collection(db, "expenses"), {
        title,
        amount: Number(amount),
        type,
        category,
        note,
        createdAt: new Date()
      });

      // 2. เมื่อบันทึกสำเร็จ ให้แสดง Alert แทนการเด้งหน้าหนีทันที
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>เพิ่มรายการรายรับ–รายจ่าย</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonInput label="ชื่อรายการ" labelPlacement="floating" value={title} onIonInput={(e) => setTitle(e.detail.value!)} />
          </IonItem>

          <IonItem>
            <IonInput label="จำนวนเงิน" type="number" labelPlacement="floating" value={amount} onIonInput={(e) => setAmount(Number(e.detail.value!))} />
          </IonItem>

          <IonItem>
            <IonSelect label="ประเภท" value={type} onIonChange={(e) => {
              const val = e.detail.value;
              setType(val);
              if (val === 'income') setCategory("เงินเดือน/รายได้");
            }}>
              <IonSelectOption value="income">รายรับ</IonSelectOption>
              <IonSelectOption value="expense">รายจ่าย</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonSelect label="หมวดหมู่" placeholder="เลือกหมวดหมู่" value={category} onIonChange={(e) => setCategory(e.detail.value)}>
              {type === 'income' ? (
                <IonSelectOption value="เงินเดือน/รายได้">เงินเดือน/รายได้</IonSelectOption>
              ) : (
                <>
                  <IonSelectOption value="อาหารและเครื่องดื่ม">อาหารและเครื่องดื่ม</IonSelectOption>
                  <IonSelectOption value="เดินทาง/น้ำมัน">เดินทาง/น้ำมัน</IonSelectOption>
                  <IonSelectOption value="ที่พักอาศัย">ที่พักอาศัย</IonSelectOption>
                  <IonSelectOption value="ช้อปปิ้ง">ช้อปปิ้ง</IonSelectOption>
                  <IonSelectOption value="ความบันเทิง">ความบันเทิง</IonSelectOption>
                  <IonSelectOption value="อื่นๆ">อื่นๆ</IonSelectOption>
                </>
              )}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonTextarea label="หมายเหตุ" labelPlacement="floating" value={note} onIonInput={(e) => setNote(e.detail.value!)} />
          </IonItem>
        </IonList>

        <IonButton expand="block" className="ion-margin-top" onClick={saveExpense}>
          บันทึกข้อมูล
        </IonButton>

        {/* 3. กล่องข้อความแจ้งเตือนเมื่อบันทึกสำเร็จ */}
        <IonAlert
          isOpen={showSuccessAlert}
          header={'บันทึกสำเร็จ!'}
          message={'ข้อมูลของคุณถูกจัดเก็บเรียบร้อยแล้ว'}
          backdropDismiss={false} // ป้องกันการกดปิดนอกกรอบ
          buttons={[
            {
              text: 'เพิ่มอีกรายการ',
              handler: () => {
                resetForm(); // ล้างฟอร์ม
                setShowSuccessAlert(false); // ปิด Alert เพื่อบันทึกต่อ
              }
            },
            {
              text: 'กลับหน้าหลัก',
              handler: () => {
                resetForm();
                setShowSuccessAlert(false);
                router.push("/tab1", "root", "replace"); // กลับหน้า Tab1
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;