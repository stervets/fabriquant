<template>
  <div class="application text-g ray-300">
    <NuxtLayout
        :name="layout"
        class="layout"
    >
      <NuxtPage />
    </NuxtLayout>
    <transition name="fade">
    <div class="loader-overlay flex flex-col absolute w-full h-screen top-0 left-0 justify-center items-center bg-zinc-900" v-if="application.state.showLoader">
      <div class="color-blue"
           v-if="application.state.showLoader && typeof application.state.showLoader == 'string'"
           v-html="application.state.showLoader"></div>
    </div>
    </transition>
  </div>
</template>

<script src="./app.script.ts" lang="ts"/>
<style src="./app.style.less" lang="less"/>
