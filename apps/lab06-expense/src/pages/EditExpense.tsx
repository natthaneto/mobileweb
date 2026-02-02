import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonInput, IonSelect, IonSelectOption, IonTextarea, IonButton,
    IonList, IonItem, IonButtons, IonBackButton, useIonRouter, IonAlert
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

const EditExpense: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const router = useIonRouter();

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState(0);
    const [type, setType] = useState("expense");
    const [category, setCategory] = useState("");
    const [note, setNote] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                const docRef = doc(db, "expenses", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title);
                    setAmount(data.amount);
                    setType(data.type);
                    setCategory(data.category);
                    setNote(data.note);
                }
            }
        };
        fetchData();
    }, [id]);

    const handleUpdate = async () => {
        try {
            const docRef = doc(db, "expenses", id);
            await updateDoc(docRef, {
                title,
                amount: Number(amount),
                type,
                category,
                note
            });
            // กลับไปที่หน้าหลัก (ตรวจสอบว่าใน App.tsx ใช้ path ไหน ระหว่าง /tab1 หรือ /tabs/tab1)
            // จากไฟล์ App.tsx ล่าสุดของคุณ ใช้ "/tab1"
            router.push("/tab1", "back", "replace");
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, "expenses", id));
            router.push("/tab1", "back", "replace");
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/tab1" />
                    </IonButtons>
                    <IonTitle>แก้ไขรายการ</IonTitle>
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
                    
                    {/* ส่วนเลือกประเภท พร้อม Logic เปลี่ยนหมวดหมู่อัตโนมัติ */}
                    <IonItem>
                        <IonSelect 
                            label="ประเภท" 
                            value={type} 
                            onIonChange={(e) => {
                                const selectedType = e.detail.value;
                                setType(selectedType);
                                if (selectedType === 'income') {
                                    setCategory("เงินเดือน/รายได้");
                                }
                            }}
                        >
                            <IonSelectOption value="income">รายรับ</IonSelectOption>
                            <IonSelectOption value="expense">รายจ่าย</IonSelectOption>
                        </IonSelect>
                    </IonItem>

                    <IonItem>
                        <IonSelect
                            label="หมวดหมู่"
                            placeholder="เลือกหมวดหมู่"
                            value={category}
                            onIonChange={(e) => setCategory(e.detail.value)}
                        >
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

                <IonButton expand="block" onClick={handleUpdate}>อัปเดตข้อมูล</IonButton>

                <IonButton expand="block" color="danger" fill="outline" className="ion-margin-top" onClick={() => setShowAlert(true)}>
                    ลบข้อมูล
                </IonButton>

                <IonAlert
                    isOpen={showAlert}
                    header={'ยืนยันการลบ?'}
                    message={'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?'}
                    buttons={[
                        { text: 'ยกเลิก', role: 'cancel' },
                        { text: 'ลบ', handler: handleDelete }
                    ]}
                    onDidDismiss={() => setShowAlert(false)}
                />
            </IonContent>
        </IonPage>
    );
};

export default EditExpense;