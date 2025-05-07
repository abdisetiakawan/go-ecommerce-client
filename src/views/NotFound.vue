<template>
  <div class="not-found-container">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <div class="error-message">
        <h2>Oops! Page Not Found</h2>
        <p>
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
      </div>
      <router-link to="/" class="back-home">
        <i class="bi bi-house-door"></i> Back to Home
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.error-content {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #dc3545;
  margin: 0;
  line-height: 1;
  animation: bounce 2s ease infinite;
}

.error-message {
  margin: 2rem 0;
}

.error-message h2 {
  color: #343a40;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-message p {
  color: #6c757d;
  font-size: 1.1rem;
  line-height: 1.5;
}

.back-home {
  display: inline-block;
  padding: 12px 30px;
  background-color: #0d6efd;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.back-home:hover {
  background-color: #0b5ed7;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}
</style>
