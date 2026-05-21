<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const slides = [
  { src: '/images/po-rekam-spb.jpg', alt: 'Реки Санкт-Петербурга' },
  { src: '/images/1ybMfJJ9kSk.jpg', alt: 'Яхта' },
  { src: '/images/5946dd94900ba9b56b0d52c88fff9d0d.jpg', alt: 'Катер' },
  { src: '/images/64536aafe5a415045ada8c4a.jpg', alt: 'Круизный лайнер' },
]

const current = ref(0)
let timer = null

function next() {
  current.value = (current.value + 1) % slides.length
}

function prev() {
  current.value = (current.value - 1 + slides.length) % slides.length
}

function goTo(i) {
  current.value = i
}

onMounted(() => {
  timer = setInterval(next, 3000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="slider">
    <div class="slides-wrapper">
      <img
        v-for="(slide, i) in slides"
        :key="i"
        :src="slide.src"
        :alt="slide.alt"
        class="slide"
        :class="{ active: i === current }"
      />
    </div>

    <button class="arrow arrow-left" @click="prev">&#8249;</button>
    <button class="arrow arrow-right" @click="next">&#8250;</button>

    <div class="dots">
      <span
        v-for="(_, i) in slides"
        :key="i"
        class="dot"
        :class="{ active: i === current }"
        @click="goTo(i)"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.slider {
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
  background: #cfd8dc;
}

.slides-wrapper {
  width: 100%;
  height: 100%;
}

.slide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.slide.active {
  opacity: 1;
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.75);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 26px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 2;
  line-height: 1;
}

.arrow:hover { background: rgba(255,255,255,0.95); }
.arrow-left  { left: 12px; }
.arrow-right { right: 12px; }

.dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: background 0.2s;
}

.dot.active { background: #fff; }
</style>
