<template>
  <QSelect
    v-model="model"
    :options="filteredOptions"
    color="orange-8"
    label-color="grey-7"
    behavior="menu"
    hide-bottom-space
    @filter="filterFn"
  />
</template>

<script setup>
const props = defineProps({
  options: Array,
})

const model = defineModel({ type: [String, Array] })

const filteredOptions = ref(props.options)

function filterFn(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    filteredOptions.value = props.options.filter(v => v.toLowerCase().indexOf(needle) > -1)
  })
}
</script>
