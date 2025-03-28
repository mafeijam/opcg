<template>
  <QLayout view="hHh lpR fFf">
    <QDialog
      v-model="dialog"
      :maximized="$q.screen.lt.md"
      no-route-dismiss
      transition-show="jump-down"
      transition-hide="jump-up"
      @hide="onDialogHide"
    >
      <QCard style="max-width: 100%; width: 1000px">
        <QCardSection
          class="bg-white bg-orange-6 q-pa-sm flex justify-between"
          style="position: sticky; top: 0; z-index: 99"
        >
          <QBtn
            icon="undo"
            label="重設"
            class="text-weight-bold"
            color="grey-10"
            @click="resetQuery"
          />
          <QBtn v-close-popup flat icon="close" color="grey-10" class="text-weight-bolder" />
        </QCardSection>
        <QCardSection class="q-mx-auto" :class="$q.screen.gt.md ? 'q-pa-lg' : 'q-pa-md'">
          <div class="row" :class="$q.screen.gt.md ? 'q-col-gutter-lg' : 'q-col-gutter-md'">
            <div class="col-12">
              <QInput
                v-model="query"
                label="卡號/卡名"
                clearable
                color="orange-8"
                label-color="grey-7"
              />
            </div>

            <div class="col-12 col-md-6">
              <div class="q-mb-sm text-grey-7 text-subtitle1">種類</div>
              <QCheckbox
                v-for="t in data.meta.types"
                :key="t"
                v-model="selectedType"
                :val="t"
                :label="t"
                class="q-mr-md"
                color="orange-8"
              />
            </div>

            <div class="col-12 col-md-6">
              <div class="q-mb-sm text-grey-7 text-subtitle1">顏色</div>
              <QCheckbox
                v-for="t in data.meta.colors"
                :key="t"
                v-model="selectedColor"
                :val="t"
                :label="t"
                class="q-mr-md"
                color="orange-8"
              />
            </div>

            <div class="col-12 col-md-6">
              <RangeSelect v-model="selectedLife" :numbers="data.meta.life" label="生命" />
            </div>

            <div class="col-12 col-md-6">
              <RangeSelect v-model="selectedCost" :numbers="data.meta.cost" label="費用" />
            </div>

            <div class="col-12 col-md-6">
              <RangeSelect
                v-model="selectedCounter"
                :numbers="data.meta.counter"
                :step="1000"
                label="反擊"
              />
            </div>

            <div class="col-12 col-md-6">
              <RangeSelect
                v-model="selectedPower"
                :numbers="data.meta.power"
                :step="1000"
                label="力量"
              />
            </div>

            <div class="col-12 col-md-3">
              <FilterSelect
                v-model="selectedEffect"
                label="效果"
                use-chips
                clearable
                multiple
                outlined
                :options="data.meta.match"
              />
            </div>

            <div class="col-12 col-md-3">
              <FilterSelect
                v-model="selectedFeature"
                label="特徵"
                use-input
                use-chips
                clearable
                multiple
                outlined
                :options="data.meta.features"
              />
            </div>

            <div class="col-12 col-md-3">
              <FilterSelect
                v-model="selectedAttr"
                label="屬性"
                use-input
                use-chips
                clearable
                multiple
                outlined
                :options="data.meta.attr"
              />
            </div>

            <div class="col-12 col-md-3">
              <FilterSelect
                v-model="selectedRare"
                label="稀有度"
                use-chips
                clearable
                multiple
                outlined
                :options="data.meta.rare"
              />
            </div>

            <div class="col-6 col-md-3">
              <QToggle v-model="alt" label="異畫" class="q-mr-md text-subtitle1" color="orange-8" />
            </div>

            <div class="col-6 col-md-3">
              <QToggle v-model="trigger" label="觸發" class="text-subtitle1" color="orange-8" />
            </div>

            <div class="col-6 col-md-3">
              <QToggle v-model="favToggle" label="最愛" class="text-subtitle1" color="orange-8" />
            </div>
          </div>
        </QCardSection>
      </QCard>
    </QDialog>

    <QHeader elevated :reveal="$q.screen.lt.md" :reveal-offset="10" class="bg-grey-10">
      <QToolbar class="q-py-sm">
        <div class="row q-col-gutter-sm full-width">
          <div class="col-12 col-lg-4 row items-center">
            <QToolbarTitle class="text-grey-2">OPCG 卡牌庫 ({{ items.length }})</QToolbarTitle>
          </div>
          <div
            class="col-6 col-lg-4 row items-center"
            :class="$q.screen.gt.md ? 'justify-center' : 'justify-start'"
          >
            <QPagination
              v-model="page"
              :max="Math.ceil(items.length / perPage)"
              input
              input-class="text-white"
              color="white"
            />
          </div>
          <div class="col-6 col-lg-4 row justify-end">
            <QBtn
              label="搜尋"
              color="orange-8"
              icon="filter_list"
              padding="xs md"
              @click="dialog = true"
            />
          </div>
        </div>
      </QToolbar>
    </QHeader>

    <QPageContainer>
      <QPage class="q-mx-auto" :style="{ maxWidth: '1920px' }">
        <div
          class="row"
          :class="$q.screen.gt.md ? 'q-pa-lg q-col-gutter-lg' : 'q-pa-sm q-col-gutter-md'"
        >
          <div
            v-for="d in items.slice(pages, pages + perPage)"
            :key="d.data.num"
            class="col-12 col-sm-6 col-lg-4 col-xl-3"
          >
            <div
              class="flex justify-between items-start bg-grey-10 no-wrap"
              :class="$q.screen.gt.lg ? 'q-pa-md' : 'q-py-sm q-px-md'"
            >
              <div>
                <div class="flex">
                  <div class="text-body2 text-orange-8 text-weight-bold q-mr-sm">
                    {{ d.data.num }}
                  </div>
                  <div class="text-body2 text-orange-8 text-weight-bold">
                    {{ d.rare.join(' / ') }}
                  </div>
                </div>
                <div class="text-grey-2 ellipsis text-body2">
                  {{ d.data.name }}
                </div>
              </div>

              <div class="q-ml-auto flex justify-end">
                <QBtn
                  :icon="stock.includes(d.data.num) ? 'bookmark' : 'bookmark_border'"
                  color="blue-8"
                  size="1rem"
                  flat
                  dense
                  rounded
                  @click="addStock(d.data.num)"
                />
                <QBtn
                  :icon="favs.includes(d.data.num) ? 'favorite' : 'favorite_border'"
                  color="pink-8"
                  size="1rem"
                  flat
                  dense
                  rounded
                  @click="addFav(d.data.num)"
                />
                <QBtn icon="info" size="1rem" flat dense rounded color="green-7">
                  <QMenu :offset="[0, 8]" anchor="bottom right" self="top right" square>
                    <QCard class="shadow-7" style="max-width: 85vw; width: 380px" square>
                      <QCardSection v-if="d.data.effect.join() !== '-'" class="bg-grey-1 q-pa-none">
                        <div
                          class="text-h6 text-weight-bolder text-green-1 bg-green q-px-lg q-py-xs"
                        >
                          效果
                        </div>
                        <div class="column q-gutter-sm q-px-md q-py-lg text-body1">
                          <div v-for="(effect, idx) in d.data.effect" :key="idx">{{ effect }}</div>
                        </div>
                      </QCardSection>
                      <QCardSection v-if="d.data.trigger !== '-'" class="q-pa-none">
                        <div
                          class="text-h6 text-weight-bolder text-grey-10 bg-yellow q-px-lg q-py-xs"
                        >
                          觸發器
                        </div>
                        <div class="bg-grey-10 text-grey-2 q-px-md q-py-lg text-body1">
                          {{ d.data.trigger }}
                        </div>
                      </QCardSection>
                      <QCardSection class="q-pa-none">
                        <div class="text-grey-8 text-caption q-px-md q-py-sm bg-blue-grey-1">
                          {{ d.data.feature.join(' / ') }}
                        </div>
                      </QCardSection>
                    </QCard>
                  </QMenu>
                </QBtn>
              </div>
            </div>

            <CardImages :images="d.img" :alt :sp="selectedRare?.some(r => r === 'SP卡')" />
          </div>
        </div>
      </QPage>
    </QPageContainer>
  </QLayout>
</template>

<script setup>
import Fuse from 'fuse.js'

const router = useRouter()
const route = useRoute()

const favs = ref([])
const stock = ref([])

const event = useRequestEvent()
const headers = useRequestHeaders(['cookie'])
const { data } = await useAsyncData(() =>
  fetchWithCookie(event, '/api/opcg', headers, route.query.uuid),
)

const perPage = ref(+route.query.per_page || 24)
const page = ref(+route.query.page || 1)
const pages = computed(() => {
  return (page.value - 1) * perPage.value
})
watch(page, val => {
  router.replace({ query: { page: val } })
  window?.scrollTo({ top: 0, behavior: 'smooth' })
})

const dialog = ref(false)
function onDialogHide() {
  window?.scrollTo({ top: 0, behavior: 'smooth' })
}

const query = useCookie('selected-query')
query.value = query.value || ''

const selectedType = useCookieState('selected-type', [])
const selectedColor = useCookieState('selected-color', [])

const selectedEffect = useCookieState('selected-effect')
const selectedFeature = useCookieState('selected-feature')
const selectedAttr = useCookieState('selected-attr')
const selectedRare = useCookieState('selected-rare')

const selectedCounter = useCookieState('selected-counter', makeRange(data.value.meta.counter))
const selectedLife = useCookieState('selected-life', makeRange(data.value.meta.life))
const selectedCost = useCookieState('selected-cost', makeRange(data.value.meta.cost))
const selectedPower = useCookieState('selected-power', makeRange(data.value.meta.power))

const alt = useCookieState('alt-toggle', false)
const trigger = useCookieState('trigger-toggle', false)
const favToggle = useCookieState('fav-toggle', false)

function resetQuery() {
  query.value = ''
  selectedType.value = []
  selectedColor.value = []
  selectedEffect.value = null
  selectedFeature.value = null
  selectedAttr.value = null
  selectedRare.value = null
  selectedCounter.value = makeRange(data.value.meta.counter)
  selectedLife.value = makeRange(data.value.meta.life)
  selectedCost.value = makeRange(data.value.meta.cost)
  selectedPower.value = makeRange(data.value.meta.power)
  alt.value = false
  trigger.value = false
  favToggle.value = false
  page.value = 1
}

const fuseQuery = computed(() => {
  function joinValue(values) {
    return [...(values ? values : [])].map(i => `="${i}"`).join('|')
  }

  const search = {
    query: query.value,
    type: [...(selectedType.value ? selectedType.value : [])].join('|'),
    feature: joinValue(selectedFeature.value),
    attr: joinValue(selectedAttr.value),
    color: joinValue(selectedColor.value),
    effect: joinValue(selectedEffect.value),
    rare: joinValue(selectedRare.value),
  }

  return Object.fromEntries(Object.entries(search).filter(([_k, v]) => Boolean(v)))
})

const items = computed(() => {
  const fuse = new Fuse(data.value.data, {
    keys: [
      {
        name: 'query',
        getFn: item => [item.data.num, item.data.name],
      },
      {
        name: 'type',
        getFn: item => item.data.type,
      },
      {
        name: 'feature',
        getFn: item => item.data.feature,
      },
      {
        name: 'attr',
        getFn: item => item.data.attr,
      },
      {
        name: 'color',
        getFn: item => item.data.color,
      },
      {
        name: 'effect',
        getFn: item => item.data.match,
      },
      {
        name: 'rare',
        getFn: item => item.rare,
      },
    ],
    threshold: 0.1,
    useExtendedSearch: true,
  })

  let results = [...data.value.data]

  if (Object.keys(fuseQuery.value).length) {
    results = [...fuse.search(fuseQuery.value).map(r => r.item)]
  }

  return results
    .filter(r => {
      if (r.data.cost[0] === '費用') {
        return true
      }
      return (
        +r.data.cost[1] >= +selectedLife.value.min &&
        +r.data.cost[1] <= +selectedLife.value.max &&
        r.data.cost[0] === '生命值'
      )
    })
    .filter(r => {
      if (r.data.cost[0] === '生命值') {
        return true
      }
      return (
        +r.data.cost[1] >= +selectedCost.value.min &&
        +r.data.cost[1] <= +selectedCost.value.max &&
        r.data.cost[0] === '費用'
      )
    })
    .filter(r => {
      return (
        +r.data.counter >= +selectedCounter.value.min &&
        +r.data.counter <= +selectedCounter.value.max
      )
    })
    .filter(r => {
      return +r.data.power >= +selectedPower.value.min && +r.data.power <= +selectedPower.value.max
    })
    .filter(r => {
      if (alt.value) {
        return r.alt
      }
      return true
    })
    .filter(r => {
      if (trigger.value) {
        return r.data.trigger !== '-'
      }
      return true
    })
    .filter(r => {
      if (favToggle.value) {
        return favs.value.includes(r.data.num)
      }
      return true
    })
    .sort((a, b) => {
      const type = ['領航', '角色', '事件', '舞台']
      const typeA = type.indexOf(a.data.type)
      const typeB = type.indexOf(b.data.type)

      const byType = typeA - typeB

      const color = a.data.color[0].localeCompare(b.data.color[0], 'zh-hant', {
        numeric: true,
        sensitivity: 'base',
      })

      const power = a.data.power.localeCompare(b.data.power, undefined, {
        numeric: true,
        sensitivity: 'base',
      })

      const cost = a.data.cost[1].localeCompare(b.data.cost[1], undefined, {
        numeric: true,
        sensitivity: 'base',
      })

      const num = a.data.num.localeCompare(b.data.num, undefined, {
        numeric: true,
        sensitivity: 'base',
      })

      return byType || color || cost || power || num
    })
})

const shouldWatchItems = ref(true)

watch(items, _val => {
  if (!shouldWatchItems.value) {
    return
  }

  page.value = 1
  window?.scrollTo({ top: 0, behavior: 'smooth' })
})

onMounted(async () => {
  favs.value = await $fetch('/api/opcg-fav')
  stock.value = await $fetch('/api/opcg-stock')
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function addFav(card) {
  shouldWatchItems.value = false
  favs.value = await $fetch('/api/opcg-fav', {
    method: 'POST',
    body: {
      card,
    },
  })
  await sleep(500)
  shouldWatchItems.value = true
}

async function addStock(card) {
  shouldWatchItems.value = false
  stock.value = await $fetch('/api/opcg-stock', {
    method: 'POST',
    body: {
      card,
    },
  })
  await sleep(500)
  shouldWatchItems.value = true
}

useHead({
  title: 'OPCG 卡牌庫',
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no' }],
})
</script>
