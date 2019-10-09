<template>
    <main class="main">
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
    </main>
</template>

<script>
import fontAwesome from '@/assets/fontawesome/css/all.min.css'

export default {
    name: 'HelloWorld',
    data() {
        return {
            // lists: [],
            todayLists: [],
            // totalUrl: [],
            times: [0, 1, 3, 6, 14, 29, 89],
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
        // fetchAllLists() {
        //     this.$db.ref(this.refLists).once('value', snapshot => {
        //         const data = snapshot.val()
        //         this.lists = data || []
        //     })
        // },
        fetchTodayLists() {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                tabs => {
                    this.todayLists = []
                    this.$db
                        .ref(this.refLists)
                        .orderByChild('date')
                        .equalTo(this.today)
                        .once('value', snapshot => {
                            const data = snapshot.val()
                            for (let key in data) {
                                this.todayLists.push(data[key])
                            }
                        })
                },
            )
        },
        pipeFetch(...fncs) {
            fncs.forEach(fnc => {
                fnc()
            })
        },
        setData() {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                tabs => {
                    const url = tabs[0].url
                    if (url) {
                        const day = 86400000
                        this.todayLists.push({
                            url,
                            date: this.formatDate(new Date()),
                            isChecked: false,
                        })
                        for (
                            let i = 0, length = this.times.length;
                            i < length;
                            i++
                        ) {
                            let time = this.times[i]
                            const formatDate = this.formatDate(
                                new Date(new Date().getTime() + day * time),
                            )
                            const pushData = {
                                url,
                                date: formatDate,
                                isChecked: false,
                            }
                            this.$db.ref(this.refLists).push(pushData)
                        }
                    }
                },
            )
        },
        deleteData() {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                tabs => {
                    const url = tabs[0].url
                    if (url) {
                        const todayListsLength = this.todayLists.length
                        let minus = 0
                        for (let i = 0; i < todayListsLength; i++) {
                            const current = this.todayLists[i - minus]
                            if (url === current.url) {
                                this.todayLists.splice(i - minus, 1)
                                minus++
                            }
                        }
                        this.$db
                            .ref(this.refLists)
                            .orderByChild('url')
                            .equalTo(url)
                            .once('value', snapshot => {
                                const data = snapshot.val()
                                for (let uuid in data) {
                                    this.$db
                                        .ref(this.refLists + `/${uuid}`)
                                        .remove()
                                }
                            })
                    }
                },
            )
        },
        urlRouterPush(list) {
            const { url, isChecked } = list
            chrome.tabs.query({ currentWindow: true, active: true }, tab => {
                chrome.tabs.update(tab.id, { url })
                this.$db
                    .ref(this.refLists)
                    .orderByChild('date')
                    .equalTo(this.today)
                    .once('value', snapshot => {
                        const data = snapshot.val()
                        for (let uuid in data) {
                            if (data[uuid].isChecked) {
                                break
                            }
                            if (data[uuid].url === url) {
                                list.isChecked = true
                                this.$db
                                    .ref(this.refLists + `/${uuid}/isChecked`)
                                    .update({ ...data[uuid], isChecked: true })
                                break
                            }
                        }
                    })
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
        username() {
            return window.localStorage.getItem('username')
        },
        refLists() {
            return `/${this.username}/lists`
        },
    },
    created() {
        this.pipeFetch(/*this.fetchAllLists,*/ this.fetchTodayLists)
    },
}
</script>

<style scoped lang="scss">
</style>
