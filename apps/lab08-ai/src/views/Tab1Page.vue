<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Lab08: Gemini AI โดย ณัฐธเนศ</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <input ref="fileEl" type="file" accept="image/*" hidden @change="onFileChange" />

      <div class="button-group">
        <ion-button expand="block" fill="outline" @click="fileEl?.click()">
          <ion-icon slot="start" name="image-outline"></ion-icon>
          เลือกไฟล์ภาพ
        </ion-button>
        <ion-button expand="block" fill="outline" @click="onTakePhoto">
          <ion-icon slot="start" name="camera-outline"></ion-icon>
          ถ่ายภาพ (Camera)
        </ion-button>
      </div>

      <ion-card v-if="previewUrl" class="preview-card">
        <ion-img :src="previewUrl" />
      </ion-card>

      <ion-button expand="block" color="success" :disabled="!img || loading" @click="onAnalyze">
        <ion-spinner v-if="loading" name="crescent" slot="start"></ion-spinner>
        {{ loading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ภาพด้วย Gemini' }}
      </ion-button>

      <div v-if="result" class="result-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title color="primary">ผลการวิเคราะห์</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p><strong>📝 คำบรรยาย:</strong> {{ result.caption }}</p>
            
            <p><strong>🏷️ แท็ก:</strong></p>
            <div class="tags">
              <ion-badge v-for="tag in result.tags" :key="tag" color="secondary" class="ion-margin-end">
                {{ tag }}
              </ion-badge>
            </div>

            <div v-if="result.objects && result.objects.length > 0">
              <p><strong>🔍 วัตถุที่พบ:</strong></p>
              <ul>
                <li v-for="obj in result.objects" :key="obj.name">
                  {{ ((obj.confidence ?? 0) * 100).toFixed(0) }}%)
                </li>
              </ul>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, 
  IonImg, IonSpinner, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonBadge, IonIcon
} from "@ionic/vue";
import { cameraOutline, imageOutline } from 'ionicons/icons'; // เพิ่ม icon
import { PhotoService } from "../core/photo.service";
import { GeminiVisionService } from "../core/gemini.service";
import type { Base64Image, ImageAnalysisResult } from "../core/ai.interface";

const fileEl = ref<HTMLInputElement | null>(null);
const img = ref<Base64Image | null>(null);
const previewUrl = ref("");
const result = ref<ImageAnalysisResult | null>(null);
const loading = ref(false);

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  img.value = await PhotoService.fromFile(file);
  previewUrl.value = URL.createObjectURL(file);
  result.value = null;
}

async function onTakePhoto() {
  try {
    const b64 = await PhotoService.fromCamera();
    img.value = b64;
    previewUrl.value = `data:${b64.mimeType};base64,${b64.base64}`;
    result.value = null;
  } catch (err) {
    console.error("Camera Error:", err);
  }
}

async function onAnalyze() {
  if (!img.value) return;
  loading.value = true;
  try {
    result.value = await GeminiVisionService.analyze(img.value);
  } catch (err) {
    alert("เกิดข้อผิดพลาดในการวิเคราะห์");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.preview-card {
  margin: 15px 0;
  border-radius: 8px;
  overflow: hidden;
}
.result-container {
  margin-top: 20px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 15px;
}
.button-group {
  margin-bottom: 10px;
}
</style>