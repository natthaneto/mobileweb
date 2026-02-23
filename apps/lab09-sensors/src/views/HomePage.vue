<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-title>Arm Workout Tracker</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding ion-text-center">
      <div class="main-display">
        <div class="status-badge" :class="state?.status.toLowerCase()">
          {{ getStatusText }}
        </div>

        <div class="counter-container">
          <div class="counter-circle" :class="{ 'active': state?.status === 'RUNNING' }">
            <span class="rep-number">{{ state?.repDisplay ?? 0 }}</span>
            <span class="rep-label">REPS</span>
          </div>
        </div>

        <div class="feedback-box" 
             :class="{ 'warning': state?.stats.lastMessage !== 'OK' && state?.stats.lastMessage !== 'เริ่มได้!' }">
          {{ state?.stats.lastMessage ?? 'กดปุ่ม START เพื่อเริ่ม' }}
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <small>คะแนนรวม</small>
          <div class="stat-value">{{ state?.stats.score ?? 0 }}</div>
        </div>
        <div class="stat-item">
          <small>พลาด</small>
          <div class="stat-value">{{ state?.stats.repsBad ?? 0 }}</div>
        </div>
      </div>

      <div class="action-area">
        <ion-button v-if="state?.status !== 'RUNNING'" 
                    expand="block" shape="round" size="large" 
                    @click="handleStart">
          START WORKOUT
        </ion-button>
        
        <ion-button v-else 
                    expand="block" color="danger" shape="round" size="large" 
                    @click="handleStop">
          STOP
        </ion-button>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border ion-padding">
      <div class="student-info">
        663380011-8 นายณัฐธเนศ กำเนิดกาลึม
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, 
  IonContent, IonButton, IonFooter 
} from '@ionic/vue';
import { MotionService } from "../core/MotionService";
import { TtsService } from "../core/TtsService";
import { ArmWorkoutEngine } from "../core/ArmWorkoutEngine";
import type { WorkoutState } from "../core/types";

// สร้าง Instance ของ Service ต่างๆ
const state = ref<WorkoutState | null>(null);
const engine = new ArmWorkoutEngine();
const motion = new MotionService();
const tts = new TtsService();

// Computed สำหรับแสดงข้อความสถานะ
const getStatusText = computed(() => {
  if (!state.value) return 'READY';
  switch (state.value.status) {
    case 'RUNNING': return 'RECORDING...';
    case 'STOPPED': return 'FINISHED';
    default: return 'READY';
  }
});

onMounted(() => {
  // ติดตามการเปลี่ยนแปลง State จาก Engine
  const unsub = engine.onChange((newState) => {
    state.value = newState;
  });

  // ทำความสะอาดเมื่อปิดหน้า
  onUnmounted(() => {
    unsub();
    handleStop();
  });
});

/**
 * ฟังก์ชันเริ่มทำงาน (รองรับการขอสิทธิ์ iOS)
 */
async function handleStart() {
  try {
    // 1. ขอสิทธิ์เข้าถึง Sensor (iOS จะเด้ง Pop-up ตรงนี้)
    const granted = await motion.requestPermission();
    
    if (!granted) {
      alert("กรุณาอนุญาตการเข้าถึง Motion & Orientation เพื่อใช้งานแอป");
      return;
    }

    // 2. ส่งเสียงแนะนำ
    await tts.speak("เริ่มกายบริหารแขน ถือเครื่องแนวตั้ง ยกขึ้นให้สุดและลดแขนลง");
    
    // 3. เริ่มระบบ Engine และ Sensor
    engine.start();
    await motion.start((sample) => {
      engine.process(sample);
    });

  } catch (error) {
    console.error("Start Error:", error);
    alert("ไม่สามารถเข้าถึงเซนเซอร์ได้");
  }
}

/**
 * ฟังก์ชันหยุดทำงาน
 */
async function handleStop() {
  await motion.stop();
  engine.stop();
  
  if (state.value && state.value.stats.repsTotal > 0) {
    await tts.speak(`จบการทำงาน คุณทำได้ ${state.value.stats.repsOk} รอบ ได้คะแนนรวม ${state.value.stats.score} คะแนน`);
  }
}
</script>

<style scoped>
.main-display {
  margin: 20px 0;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  background: #f0f0f0;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 20px;
}
.status-badge.running { background: #e8f5e9; color: #2e7d32; }

.counter-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.counter-circle {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: 8px solid #eeeeee;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.4s ease;
}

.counter-circle.active {
  border-color: var(--ion-color-primary);
  background: #f4f8ff;
  transform: scale(1.05);
}

.rep-number {
  font-size: 80px;
  font-weight: 800;
  line-height: 1;
}

.rep-label {
  font-size: 18px;
  color: #666;
  font-weight: 600;
  letter-spacing: 2px;
}

.feedback-box {
  min-height: 40px;
  font-size: 20px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 30px;
}

.feedback-box.warning {
  color: #d32f2f;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 40px;
}

.stat-item {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 12px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.student-info {
  text-align: center;
  color: #888;
  font-size: 14px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.action-area {
  padding: 0 20px;
}
</style>