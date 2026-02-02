import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonList, IonItem, IonLabel, IonNote, IonBadge, IonCard, IonCardContent, IonText
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";

// นิยาม Interface สำหรับข้อมูล [cite: 22-28]
interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  createdAt: any;
  note?: string;
}

const Tab1: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    // 1. สร้าง Query ดึงข้อมูลจาก collection "expenses" เรียงตามเวลาล่าสุด [cite: 22, 123]
    const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));

    // 2. ใช้ onSnapshot เพื่อดึงข้อมูลแบบ Realtime 
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: ExpenseItem[] = [];
      let income = 0;
      let expense = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data() as ExpenseItem;
        const item = { ...data, id: doc.id };
        items.push(item);

        // 3. คำนวณสรุปผลรวมรายรับและรายจ่าย 
        if (data.type === 'income') {
          income += data.amount;
        } else {
          expense += data.amount;
        }
      });

      setExpenses(items);
      setTotalIncome(income);
      setTotalExpense(expense);
    });

    return () => unsubscribe(); // ล้างการเชื่อมต่อเมื่อ Component ถูกทำลาย
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>รายการรายรับ–รายจ่าย</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>

        {/* ส่วนสรุปผลรวม  */}
        <IonCard>
          <IonCardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <IonText color="success">
                <h3>รายรับ: {totalIncome.toLocaleString()} ฿</h3>
              </IonText>
              <IonText color="danger">
                <h3>รายจ่าย: {totalExpense.toLocaleString()} ฿</h3>
              </IonText>
            </div>
            <IonText color="dark">
              <h2>คงเหลือ: {(totalIncome - totalExpense).toLocaleString()} ฿</h2>
            </IonText>
          </IonCardContent>
        </IonCard>

        {/* รายการข้อมูล */}
        <IonList>
          {expenses.map((item) => (
            <IonItem key={item.id} button detail={true} routerLink={`/tabs/edit/${item.id}`}>
              <IonLabel>
                <h2>{item.title}</h2>
                {/* แสดงหมวดหมู่ */}
                <p style={{ color: 'var(--ion-color-medium)' }}>
                  <strong>หมวดหมู่:</strong> {item.category}
                </p>
                {/* เพิ่มส่วนแสดงหมายเหตุ (Note) ตรงนี้ */}
                {item.note && (
                  <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                    {item.note}
                  </p>
                )}
              </IonLabel>

              <IonNote slot="end">
                <IonBadge color={item.type === 'income' ? 'success' : 'danger'} style={{ padding: '8px' }}>
                  {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()} ฿
                </IonBadge>
              </IonNote>
            </IonItem>
          ))}
        </IonList>

      </IonContent>
    </IonPage>
  );
};

export default Tab1;