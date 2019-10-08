<template>
    <div class="main_app">
        <header class="title">學習日誌</header>
        <section class="description">
            <div
                class="description__title"
                @click="toggleDescription"
            >詳細<i
                    class="description__title__icon fas fa-angle-down"
                    :class="{'description__title__icon--active': isShowDescription}"
                ></i></div>
            <article
                class="description__text"
                v-if="isShowDescription"
            >
                此日誌複習時間採<b>艾賓浩斯記憶曲線</b>，分別為(<b>1、2、4、7、15、30、90</b>)天<b>7</b>次的復習。<br />附贈的<b>畫筆功能</b>，可以在自己不熟的地方畫線，以方便日後記憶。</article>
        </section>
        <section
            class="content"
            v-if="todayLists.length"
        >
            <div class="content__date">{{today}}</div>
            <ul class="content__lists">
                <li
                    class="content__lists__list"
                    :class="{'content__lists__list--checked': list.isChecked}"
                    v-for="(list, index) in todayLists"
                    :key="index"
                    :title="list.url"
                    @click="urlRouterPush(list)"
                >{{index + 1}}</li>
            </ul>
        </section>
        <section
            class="content"
            v-else
        >今日暫無復習項目</section>
        <footer class="footer">
            <button
                class="footer__btn-pen"
                @click="draw"
            ><i class="fas fa-pencil-alt"></i></button>
            <button
                class="footer__btn-eye"
                @click="draw"
            ><i class="fas fa-eye"></i></button>
            <button
                class="footer__btn-increase"
                @click="setData"
            ><i class="fas fa-plus"></i></button>
            <button
                class="footer__btn-delete"
                @dblclick="deleteData"
            ><i class="fas fa-trash-alt"></i></button>
        </footer>
    </div>
</template>

<script>
import fontAwesome from '@/assets/fontawesome/css/all.min.css'

export default {
    name: 'app',
    data() {
        return {
            lists: {},
            totalUrl: [],
            isShowDescription: false,
        }
    },
    methods: {
        toggleDescription() {
            this.isShowDescription = !this.isShowDescription
        },
        formatDate(time = new Date()) {
            const year = time.getFullYear()
            const month = String(time.getMonth() + 1).padStart(2, '0')
            const date = String(time.getDate()).padStart(2, '0')
            const formatDate = `${year}-${month}-${date}`
            return formatDate
        },
        fetchLists() {
            this.$db.ref(`/frank`).once('value', snapshot => {
                const data = snapshot.val()
                const totalUrl = new Set()
                let lists = {}
                for (let time in data) {
                    lists[time] = []
                    for (let key in data[time]) {
                        lists[time].push(data[time][key])
                        totalUrl.add(data[time][key].url)
                    }
                }
                this.lists = lists
                this.totalUrl = [...totalUrl]
            })
        },
        setData() {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                tabs => {
                    const lists = { ...this.lists }
                    const url = tabs[0].url
                    const day = 86400000
                    const times = [0, 1, 3, 6, 14, 29, 89]
                    for (let i = 0; i < times.length; i++) {
                        let time = times[i]
                        const formatDate = this.formatDate(
                            new Date(new Date().getTime() + day * time),
                        )
                        if (!lists[formatDate]) {
                            lists[formatDate] = []
                        }
                        lists[formatDate].push({ url, isChecked: false })
                        this.$db
                            .ref(`/frank/${formatDate}`)
                            .push({ url, isChecked: false })
                    }
                },
            )
        },
        deleteData() {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                tabs => {
                    const today = this.today
                    const lists = [...this.lists[today]]
                    const url = tabs[0].url
                    this.$db
                        .ref(`frank`)
                        .orderByChild('url')
                        .equalTo(url)
                        .once('value', snapshot => {
                            console.log(snapshot.val())
                        })
                    // const filterList = lists.filter(list => list.url === url)
                    // if (filterList.length) {
                    //     const spliceLists = [...lists]
                    //     let minusNum = 0
                    //     lists.forEach((list, index) => {
                    //         filterList.every(filterList => {
                    //             if (filterList.url === list.url) {
                    //                 minusNum++
                    //                 spliceLists.splice(index - minusNum, 1)
                    //                 return false
                    //             }
                    //             return true
                    //         })
                    //     })
                    //     this.$set(this.lists, today, spliceLists)
                    // }
                },
            )
        },
        urlRouterPush(list) {
            const { url, isChecked } = list
            chrome.tabs.query({ currentWindow: true, active: true }, tab => {
                list.isChecked = true
                chrome.tabs.update(tab.id, { url })
            })
        },
        draw() {
            chrome.tabs.executeScript(null, {
                file: './content-script.js',
            })
        },
    },
    computed: {
        today() {
            return this.formatDate(new Date())
        },
        todayLists() {
            let lists = []
            for (let time in this.lists) {
                if (this.today === time) {
                    lists = this.lists[time]
                    break
                }
            }
            return lists
        },
    },
    created() {
        this.fetchLists()
    },
}
</script>

<style lang="sass">
@import './style'
</style>
