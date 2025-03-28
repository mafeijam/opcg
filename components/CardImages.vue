<template>
  <QCarousel
    v-model="slide"
    animated
    :arrows="filterAlt.length > 1"
    :navigation="filterAlt.length > 1"
    infinite
    height="auto"
    navigation-position="top"
    keep-alive
    swipeable
  >
    <QCarouselSlide
      v-for="(img, idx) in filterAlt"
      :key="idx"
      :name="idx"
      class="q-pa-none w-fit bg-grey-3 q-px-sm q-pt-sm"
      :class="$q.screen.gt.md ? 'q-pb-xl' : 'q-pb-lg'"
    >
      <QImg :src="img[0]" alt="opcg" fit="contain" loading="lazy" no-spinner :ratio="300 / 419" />
      <div
        class="absolute-bottom text-center text-white"
        :class="$q.screen.gt.md ? 'q-py-md text-subtitle1' : 'q-py-sm text-body2'"
        style="background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(3px)"
      >
        {{ img[1] }}
      </div>
    </QCarouselSlide>
  </QCarousel>
</template>

<script setup>
const props = defineProps({
  images: Array,
  alt: Boolean,
  sp: Boolean,
})

const filterAlt = computed(() => {
  return props.images.filter(img => {
    const cond = [img[3] === 'SP卡', !!img[2]]

    if (props.sp) {
      return cond[0]
    }

    if (props.alt || (props.sp && props.alt)) {
      return cond.some(Boolean)
    }

    return true
  })
})

const slide = ref(0)
</script>
