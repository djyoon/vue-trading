<template>
  <div>

    <Navigation></Navigation>
    <router-view></router-view>

  </div>
</template>

<script>
    import Navigation from './components/navigation.vue'

    export default {
        name: 'App',
        components: {
            Navigation
        }
    }
</script>
<style>
  html, body {
    width:100%;
    height : 100%
  }

</style>