# usePlants —— 整个植物数据层的"大管家"

> 给刚接手项目的你：看完这篇你就知道植物相关的数据该从哪拿、往哪存、怎么改了。

---

## 一、为啥要搞这么一个 composable？—— 讲讲"史前时代"的混乱

一开始项目没做数据层的时候，大家是这么写的：

- **首页组件** 自己 `getItem('plants')` 读 localStorage，然后写一套 `filter` 逻辑筛分类
- **发布页组件** 自己 `setItem('plants')` 往 localStorage 里追加新数据
- **我的页面** 又读一遍 localStorage，然后自己拼"我发过的"列表
- **详情页** 又读一遍 localStorage，然后 `find` 找那一条

你猜猜发生了啥？🤦‍♂️

1. **每个组件都在手动读 localStorage，读了三四遍** —— 一样的代码到处抄
2. **首页筛选的逻辑不能复用** —— 以后想在"我的页面"加个搜索，又得复制一遍 filter
3. **数据改了不同步** —— 发布页新增了一条，首页列表不自动刷新，得手动 `location.reload()`
4. **新人改代码容易炸** —— 比如有人忘了加 `try/catch`，localStorage 满了直接白屏

所以就有了 `usePlants` 这个 composable：**所有植物相关的读写，全从这个入口走**，组件里再也不许直接碰 `localStorage`。

---

## 二、它是怎么跟外面配合的？—— 一张图说清楚

```
┌─────────────────────────────────────────────────────────┐
│                      各个页面组件                        │
│  HomePage.vue    Detail.vue    Mine.vue    Publish.vue  │
└──────────────┬──────────┬──────────────┬───────────────┘
               │          │              │
               │  调用 usePlants() 拿到工具函数
               │          │              │
               ▼          ▼              ▼
┌─────────────────────────────────────────────────────────┐
│                   usePlants composable                  │
│                                                         │
│  · plants          →  响应式的植物列表（按时间倒序）    │
│  · loadPlants()    →  第一次进来加载数据（含 mock 初始化）│
│  · getPlantById()  →  按 id 找某一条                    │
│  · filterPlants()  →  返回一个 computed 的筛选结果      │
│  · addPlant()      →  发布新植物                        │
│  · deletePlant()   →  删除某条（撤销发布）               │
│  · getMyPublished  →  我发过的列表（computed）           │
└───────────────────────────┬─────────────────────────────┘
                            │
                            │  内部统一调用
                            ▼
┌─────────────────────────────────────────────────────────┐
│              localStorage （持久化存储）                 │
│                                                         │
│  PLANTS        → 所有植物的数组                         │
│  PUBLISHED     → 当前用户发布过的 plantId 列表         │
│  USER_ID       → 匿名用户的唯一标识（浏览器指纹）        │
└─────────────────────────────────────────────────────────┘
```

**核心原则**：组件只跟 `usePlants` 打交道，`usePlants` 只跟 `localStorage` 打交道。分层清清楚楚。

---

## 三、挑三个关键函数唠唠实现

### 1. `loadPlants()` —— 进来先"热身"，顺便塞点 mock 数据

这个函数是整个数据层的"启动器"，每个页面 `onMounted` 里都会调一下（当然有 `isLoaded` 守门，重复调也不会重复加载）。

最有意思的是 mock 数据初始化那段：

```typescript
const stored = getItem<Plant[]>(STORAGE_KEYS.PLANTS);
if (stored && stored.length > 0) {
  plants.value = stored;      // 有真实数据就用真实数据
} else {
  // 第一次打开？给你灌 7 条示例植物，页面不空落落的
  const mockWithIds: Plant[] = MOCK_PLANTS.map((plant, index) => ({
    ...plant,
    id: generateId(),
    userId: `mock_user_${index % 3}`,  // 分散给 3 个"虚拟用户"
    createdAt: Date.now() - (index * 3600000 + Math.random() * 86400000),
    // ↑ 时间戳错开：每条间隔1小时+随机一天，模拟真实发布节奏
  }));
  plants.value = mockWithIds;
  savePlants();  // 写进 localStorage，下次进来就是"真实数据"了
}
```

> 💡 小技巧：`createdAt` 不是全塞 `Date.now()`，而是错开了时间，这样首页按时间倒序排的时候看起来有先后顺序，不会像批量生成的。Mock 数据也要用心做呀~

### 2. `filterPlants()` —— 返回 computed，不是数组！

这个函数的签名很特别：

```typescript
// 注意！它不返回 Plant[]，而是返回 ComputedRef<Plant[]>
const filterPlants = (category?, keyword?) => {
  return computed(() => {
    let result = allPlants.value;
    if (category && category !== 'all') {
      result = result.filter(p => p.category === category);
    }
    if (keyword) { /* 搜名字/品种/描述 */ }
    return result;
  });
};
```

**为啥返回 computed，不直接返回 filter 后的数组？**

因为这样调用方拿到的是**响应式对象**，`category` 或者 `keyword` 变化后，组件不用手动调刷新，模板里用的 `displayPlants` 会自动跟着变 —— 这就是 Vue 响应式的魔力。

对比下两种写法：

| 写法 | 调用方要做什么 | 自动更新？ |
|---|---|---|
| 返回普通数组 `filter()` 结果 | 每次改筛选条件手动再调一遍函数 | ❌ 不会 |
| 返回 `computed` | 直接把 computed 当数据用，`v-for` 里遍历 | ✅ 依赖变化自动重算 |

首页组件就是这么用的：

```typescript
const displayPlants = computed(() => {
  // 不需要分类/搜索的时候直接用全量 plants
  if (activeCategory.value === 'all' && !keyword) {
    return plants.value;
  }
  // 需要筛选的时候，拿 filterPlants 返回的 computed，再 .value 取结果
  return filterPlants(activeCategory.value, keyword).value;
});
```

### 3. `addPlant()` —— 一条数据，两份记录

发布新植物的时候，其实写了两个 localStorage key：

```typescript
const addPlant = (formData) => {
  // 1. 先往植物总表里插一条
  const newPlant = { ...formData, id, userId, createdAt };
  plants.value.unshift(newPlant);
  savePlants();  // 写 PLANTS key

  // 2. 再把 id 记到"我发过的"清单里
  const published = getItem<string[]>(STORAGE_KEYS.PUBLISHED) || [];
  published.unshift(newPlant.id);
  setItem(STORAGE_KEYS.PUBLISHED, published);  // 写 PUBLISHED key

  return newPlant;
};
```

**为啥要分开存两份？** 植物总表里每条已经有 `userId` 了，为啥还需要 `PUBLISHED` key？

其实是双重保险：
- **`userId` 方案**：遍历 `plants` 按 `userId` 匹配，适合按用户维度查
- **`PUBLISHED` 清单**：直接存 id 数组，查"我发过的"时不用遍历全量，还可以单独排序

在 `getMyPublished` 里两个条件是 **或** 的关系（`||`），不管哪种方式匹配到了都算，兼容性拉满：

```typescript
const getMyPublished = computed(() => {
  const publishedIds = getItem<string[]>(STORAGE_KEYS.PUBLISHED) || [];
  return plants.value
    .filter(p => publishedIds.includes(p.id) || p.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
});
```

---

## 四、设计上的小取舍 —— 为啥用 `ref` 不用 `reactive`？

看代码你会发现：

```typescript
const plants = ref<Plant[]>([]);      // 数组用 ref
const isLoaded = ref(false);          // 布尔用 ref
```

全是 `ref`，一个 `reactive` 都没。为啥？

| 对比维度 | `ref([])` | `reactive([])` |
|---|---|---|
| **整体替换** | `plants.value = newArray` ✅ 直接赋值 | 得 `plants.splice(0, plants.length, ...newArray)` 比较绕 |
| **解构/传出去** | return { plants } 出去外面用 `plants.value` 直接拿 | 解构会丢响应式，还得包 `toRefs` |
| **心智负担** | 所有数据都是 `.value` 访问，统一规则 | 对象属性不用 `.value`，数组要用，规则不统一 |

**简单说**：`ref` 虽然写起来多了几个 `.value`，但规则统一、不容易踩坑，对团队协作更友好。新人第一次写代码，看到 `ref` 就知道要加 `.value`，不用想"这个是 reactive 还是 toRef 还是啥"。

---

## 五、给接手的你：常见修改场景速查

| 你想做什么 | 该改哪里 | 别改哪里 |
|---|---|---|
| 加个植物字段（比如"养护难度"） | `types/index.ts` 的 `Plant` 接口 + 发布页表单 | 别去每个页面手动加字段 |
| 新增筛选条件（比如按小区筛选） | 在 `filterPlants()` 函数里加参数和 filter 逻辑 | 别在首页自己写 filter |
| 修改 mock 数据（加更多示例植物） | 文件顶部的 `MOCK_PLANTS` 数组 | 别直接改 localStorage（清缓存会丢） |
| 发布植物后想加额外逻辑（比如埋点） | `addPlant()` 里 return 之前加 | 别在发布页组件自己 `setItem` |
| 植物列表排序规则改了（比如改成按小区排） | `allPlants` 这个 computed 里改 sort | 别在每个页面各自 sort |

**最后一句忠告**：如果有一个操作涉及"改植物数据"，先想 `usePlants` 里有没有对应的函数，没有就加一个 —— 绝对不要在组件里直接 `getItem/setItem` 碰 localStorage，否则你就是在给下一个接手的人（可能是未来的你）埋雷 💣

---

> 好了，相信你对 `usePlants` 已经有感觉了。改代码前先读一遍这个文件里每个函数的注释，然后大胆动手，`vue-tsc` 会帮你守着类型安全的~🌱
