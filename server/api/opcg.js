import { load } from 'cheerio'

export default defineEventHandler(async event => {
  const storage = useStorage('db')
  const query = getQuery(event)
  const keys = await storage.getKeys()

  let uuid = query.uuid || getCookie(event, 'opcg_uuid')

  if (!uuid) {
    do {
      uuid = Math.random().toString(16).slice(2)
    } while (keys.includes(uuid))
  }

  setCookie(event, 'opcg_uuid', uuid, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })

  if (query.clear) {
    await storage.clear()
  }

  if (query.clear_list) {
    await storage.removeItem('opcg-list')
    await storage.removeItem('opcg-series')
  }

  const cached = await storage.getItem('opcg-list')

  if (cached) {
    return cached
  }

  const list = await getList()

  let all = []

  for (const l of list) {
    const op = await getData(l.val, query.clear_list)
    all = all.concat(op)
  }

  const res = group(all)

  const types = getMeta(res, 'type')
  const features = getMeta(res, 'feature')
  const attr = getMeta(res, 'attr').filter(f => f !== '-')
  const colors = getMeta(res, 'color')
  const power = getMeta(res, 'power')
  const counter = getMeta(res, 'counter')
  const rare = [...new Set(res.map(f => f.rare).flat())].sort((a, b) =>
    a.localeCompare(b, 'zh-hant', { numeric: true }),
  )
  const match = getMeta(res, 'match').filter(f => f !== 'ダブルアタック')
  const get = [...new Set(res.map(f => f.get).flat())].sort((a, b) =>
    a.localeCompare(b, 'zh-hant', { numeric: true }),
  )
  const life = getMeta2(res, '生命值')
  const cost = getMeta2(res, '費用')
  const alt = res.filter(f => f.alt).map(f => f.data.num)

  const final = {
    meta: {
      types,
      life,
      cost,
      alt,
      get,
      colors,
      power,
      counter,
      rare,
      match,
      features,
      attr,
    },
    data: res,
  }

  await storage.setItem('opcg-list', final)

  return final
})

async function getList() {
  const storage = useStorage('db')

  const cached = await storage.getItem('opcg-series')

  if (cached) {
    return cached
  }

  const data = await $fetch('https://asia-hk.onepiece-cardgame.com/cardlist')

  const $ = load(data)

  const list = [...$('.selectModal option')]
    .map(el => {
      const val = $(el).attr('value')
      const name = $(el).prop('textContent').replace('<br class="spInline">', '')
      return { val, name }
    })
    .filter(l => !!l.val)

  await storage.setItem('opcg-series', list)

  return list
}

async function getData(series, clear) {
  const storage = useStorage('db')

  const cached = await storage.getItem(`opcg-${series}`)

  if (cached && !clear) {
    return cached
  }

  const data = await $fetch(`https://asia-hk.onepiece-cardgame.com/cardlist?series=${series}`)

  const $ = load(data)

  const getContents = (el, target) => {
    return [...$(el).find(target).contents()].map(e => $(e).text().trim())
  }

  const cards = $('.resultCol dl.modalCol')
    .map((i, el) => {
      const name = $(el).find('.cardName').text()
      const img = $(el)
        .find('img')
        .data('src')
        .replace(/^\.\./, 'https://asia-hk.onepiece-cardgame.com')
      const info = $(el)
        .find('.infoCol')
        .children()
        .map((i, el) => $(el).text())
        .toArray()
      const cost = getContents(el, '.cost')
      const color = getContents(el, '.color')[1].split('/')
      const attr = $(el).find('.attribute').find('img').prop('alt')?.split('/') || '-'
      const feature = getContents(el, '.feature')[1].split('/')
      const power = getContents(el, '.power')[1]
      const counter = getContents(el, '.counter')[1]
      const effect = getContents(el, '.text').filter(Boolean)
      effect.shift()
      const trigger = getContents(el, '.trigger')[1] || '-'
      const get = getContents(el, '.getInfo')
      get.shift()

      const match = effect
        .map(e => {
          const m = e.matchAll(/(?<=【)[^】【]*(?=】)/g)
          return [...m].map(i => i[0])
        })
        .flat()

      const [num, rare, type] = info

      const typeMap = {
        EVENT: '事件',
        CHARACTER: '角色',
        LEADER: '領航',
        STAGE: '舞台',
      }

      return {
        name,
        img,
        num,
        rare,
        type: typeMap[type.replace('事件　', 'EVENT')],
        cost,
        attr,
        feature,
        color: color.reduce((c, i) => {
          i = i.replace('黄', '黃')
          if (i.length > 1) {
            c.push(i[0])
            c.push(i[1])
          } else {
            c.push(i)
          }

          return c
        }, []),
        power: power.replace('-', '0'),
        counter: counter.replace('-', '0'),
        effect,
        trigger,
        get,
        match: match.map(e => e.replace('咚‼×1', '咚!!×1').replace('咚‼×2', '咚!!×2')),
      }
    })
    .toArray()

  await storage.setItem(`opcg-${series}`, cards)

  return cards
}

function group(all) {
  const group = all.reduce((carry, item) => {
    const alt = /\(異圖卡\)/.test(item.name)

    item.name = item.name.replace('(異圖卡)', '')
    const key = item.num

    item.get = item.get.join(', ')

    carry[key] ??= {}
    carry[key].img ??= []
    carry[key].alt ??= []

    carry[key].get ??= new Set()

    carry[key].alt.push(alt)
    carry[key].img.push([item.img, item.get, alt, item.rare])
    carry[key].get.add(item.get)

    delete item.img
    delete item.get
    carry[key].data = item

    return carry
  }, {})

  return Object.values(group).map(g => {
    g.get = [...g.get]

    let [key, val] = g.data.cost
    val = val.replace('-', '0')
    g.data.cost = [key, val]

    g.alt = g.alt.some(Boolean)
    g.sp = g.img.some(i => i[3] === 'SP卡')
    g.rare = [...new Set(g.img.map(i => i[3]).flat())]

    const rareIndex = g.rare.indexOf('SP卡')

    if (rareIndex !== -1) {
      g.rare.splice(rareIndex, 1)
      g.rare.push('SP卡')
    }

    g.noInfo = g.data.trigger === '-' && g.data.effect.every(e => e === '-')

    g.img = [...g.img].sort((a, b) => {
      const endA = a[0].split('/').pop().split('_')
      const endB = b[0].split('/').pop().split('_')

      if (endA.length !== endB.length) {
        return endA.length - endB.length
      }

      return a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' })
    })

    delete g.data.rare

    return g
  })
}

function getMeta(list, key, locale = 'zh-hant') {
  return [...new Set(list.map(f => f.data[key]).flat())].sort((a, b) =>
    a.localeCompare(b, locale, { numeric: true }),
  )
}

function getMeta2(list, key) {
  return [...new Set(list.filter(f => f.data.cost[0] === key).map(f => f.data.cost[1]))].sort(
    (a, b) => a.localeCompare(b, undefined, { numeric: true }),
  )
}
