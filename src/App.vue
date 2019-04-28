<template>
  <div id="app">
    <ChartContainer></ChartContainer>
  </div>
</template>

<script>
import ChartContainer from './tradingview/ChartContainer.vue'

export default {
  name: 'app',
  components: {
    ChartContainer
  }
}
</script>