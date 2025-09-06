<template>
  <div 
    class="signature-container" 
    v-motion 
    :initial="{ opacity: 0, scale: 0.8, y: 50 }" 
    :enter="{ opacity: 1, scale: 1, y: 0 }" 
    :leave="{ opacity: 0, scale: 0.8, y: -50 }"
    :delay="200"
    :visible-once="false"
  >
    <!-- Made with Action -->
    <div class="made-with-section" v-motion :initial="{ opacity: 0, x: -30 }" :enter="{ opacity: 1, x: 0 }" :leave="{ opacity: 0, x: -30 }" :delay="400">
      <span class="made-text">Made with</span>
      <span class="action-text">Action</span>
    </div>

    <!-- 팀 이직발사대 -->
    <div class="team-section" v-motion :initial="{ opacity: 0, x: 30 }" :enter="{ opacity: 1, x: 0 }" :leave="{ opacity: 0, x: 30 }" :delay="600">
      <span class="team-text">팀 이직발사대</span>
    </div>

    <!-- Developer BinKoon -->
    <div class="developer-section" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1 }" :leave="{ opacity: 0, scale: 0.9 }" :delay="800">
      <span class="developer-text">Developer</span>
      <span class="signature-name">BinKoon</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Signature'
}
</script>

<style scoped>
.signature-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.made-with-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.8rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
}

.made-text {
  font-weight: 300;
  letter-spacing: 0.05em;
}

.action-text {
  font-weight: 700;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  letter-spacing: 0.1em;
}

.team-section {
  font-size: 1.4rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.1em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.developer-section {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.2rem;
}

.developer-text {
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.05em;
}

.signature-name {
  font-family: 'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', cursive;
  font-size: 2.5rem;
  font-weight: 400;
  color: #ffffff;
  text-shadow: 
    0 0 25px rgba(14, 165, 233, 1),
    0 0 50px rgba(14, 165, 233, 0.8),
    0 0 75px rgba(14, 165, 233, 0.6),
    0 4px 8px rgba(0, 0, 0, 0.9);
  letter-spacing: 0.05em;
  position: relative;
  z-index: 2;
  display: inline-block;
  transform-origin: center;
  filter: drop-shadow(0 0 20px rgba(14, 165, 233, 0.7));
  background: linear-gradient(45deg, #ffffff 0%, #0ea5e9 30%, #ffffff 70%, #0ea5e9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: signatureGlow 3s ease-in-out infinite alternate;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.signature-name:hover {
  transform: scale(1.1) rotate(2deg);
  text-shadow: 
    0 0 35px rgba(14, 165, 233, 1),
    0 0 70px rgba(14, 165, 233, 0.9),
    0 0 105px rgba(14, 165, 233, 0.7);
}

@keyframes signatureGlow {
  0% {
    background-position: 0% 50%;
    text-shadow: 
      0 0 25px rgba(14, 165, 233, 1),
      0 0 50px rgba(14, 165, 233, 0.8),
      0 0 75px rgba(14, 165, 233, 0.6);
  }
  100% {
    background-position: 100% 50%;
    text-shadow: 
      0 0 35px rgba(14, 165, 233, 1),
      0 0 70px rgba(14, 165, 233, 0.9),
      0 0 105px rgba(14, 165, 233, 0.7);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .signature-container {
    padding: 1.5rem;
    margin: 1.5rem 0;
  }
  
  .made-with-section {
    font-size: 1.5rem;
  }
  
  .team-section {
    font-size: 1.2rem;
  }
  
  .developer-section {
    font-size: 1rem;
  }
  
  .signature-name {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .signature-container {
    padding: 1rem;
    margin: 1rem 0;
  }
  
  .made-with-section {
    font-size: 1.3rem;
  }
  
  .team-section {
    font-size: 1.1rem;
  }
  
  .developer-section {
    font-size: 0.9rem;
  }
  
  .signature-name {
    font-size: 1.8rem;
  }
}
</style>
