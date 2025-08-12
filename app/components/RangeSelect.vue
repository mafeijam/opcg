<template>
  <div class="q-px-sm">
    <div class="q-mb-xl text-grey-7 text-subtitle1">{{ label }}</div>
    <QRange
      v-model="model"
      v-bind="minMax(numbers)"
      :marker-labels="makeRangeLabel(numbers)"
      :step
      label
      label-always
      track-size="8px"
      label-color="grey-4"
      label-text-color="grey-10"
      markers
      color="grey-9"
      class="q-px-sm"
      thumb-size="28px"
    />
  </div>
</template>

<script setup>
defineProps({
  numbers: Array,
  label: {
    type: String,
    default: 'title',
  },
  step: {
    type: Number,
    default: 1,
  },
})

const model = defineModel({ type: Object })

function makeRangeLabel(numbers) {
  const { min, max } = minMax(numbers)
  return [
    { value: min, label: min },
    { value: max, label: max },
  ]
}
</script>

<style>
.q-slider__markers {
  color: white;
}
</style>
