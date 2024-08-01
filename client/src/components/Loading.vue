<template>
    <div class="loading">
        Loading...
    </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.loading {
    position: fixed;
    display: grid;
    place-items: center;
    height: 100vh;
    width: 100vw;
    z-index: 999;
    background: #f4f4f4db;
    top: 0;
    left: 0;
}
</style>