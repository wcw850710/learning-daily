<template>
    <main class="main">
        <section class="description">
            <div
                class="description__title"
                @click="toggleDescription"
            >詳細資訊<i
                    class="description__title__icon fas fa-angle-down"
                    :class="{'description__title__icon--active': isShowDescription}"
                ></i></div>
            <article
                class="description__text"
                v-if="isShowDescription"
            >
                此日誌複習時間採<b>艾賓浩斯記憶曲線</b>，分別為(<b>1、2、4、7、15、30、90</b>)天<b>7</b>次的復習。<br />附贈的<b>畫筆功能</b>，可以在自己不熟的地方畫線，以方便日後記憶。</article>
        </section>
        <Fragment
            v-for="(day, index) in recentSevenDays"
            :key="index"
        >
            <div
                class="content"
                :class="{'content--today': day === today}"
            >
                <div class="content__date">{{day}}</div>
                <ul class="content__lists">
                    <li
                        v-for="(list, index) in filterLists(day)"
                        :key="index"
                        class="content__lists__list"
                        :class="{'content__lists__list--checked': list.isChecked}"
                        :title="list.url"
                        @click="urlRouterPush(list)"
                    >{{index + 1}}</li>
                    <h1 v-if="!filterLists(day).length && day === today">今日暫無復習項目</h1>
                </ul>
            </div>
        </Fragment>
        <footer class="footer">
            <button
                class="footer__btn-pen"
                @click="draw"
            ><i class="fas fa-pencil-alt"></i></button>
            <button
                class="footer__btn-eye"
                :class="{'footer__btn-eye--show': isShowPen}"
                @click="togglePen"
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
import Fragment from '@/components/Fragment'

export default {
    name: 'HelloWorld',
    data() {
        return {
            lists: [],
            username: '',
            // totalUrl: [],
            times: [0, 1, 3, 6, 14, 29, 89],
            isShowDescription: false,
            isShowPen: false,
        }
    },
    components: {
        Fragment,
    },
    methods: {
        toggleDescription() {
            this.isShowDescription = !this.isShowDescription
        },
        formatDate(time) {
            return this.$bg.formatDate(time)
        },
        fetchLists() {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                tabs => {
                    const day = 86400000
                    this.$db
                        .ref(this.refLists)
                        .orderByChild('date')
                        .startAt(
                            this.formatDate(
                                new Date(new Date().getTime() - day * 3),
                            ),
                        )
                        .endAt(
                            this.formatDate(
                                new Date(new Date().getTime() + day * 3),
                            ),
                        )
                        .on('value', snapshot => {
                            const data = snapshot.val()
                            this.lists = []
                            for (let key in data) {
                                this.lists.push(data[key])
                            }
                        })
                },
            )
        },
        filterLists(day) {
            const filterLists = this.lists.filter(list => list.date === day)
            return filterLists
        },
        setData() {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                tabs => {
                    const url = tabs[0].url
                    if (url) {
                        const day = 86400000
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
            const { url, date, isChecked } = list
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
                file: './cs-pen.js',
            })
        },
        togglePen() {
            chrome.tabs.executeScript(null, {
                file: './cs-penShow.js',
            })
        },
    },
    computed: {
        today() {
            return this.formatDate(new Date())
        },
        recentSevenDays() {
            let days = []
            const day = 86400000
            for (let i = 0; i < 7; i++) {
                days.push(
                    this.formatDate(
                        new Date(new Date().getTime() + day * (i - 3)),
                    ),
                )
            }
            return days
        },
        refLists() {
            return `/${this.username}/lists`
        },
    },
    created() {
        chrome.storage.local.get(['username'], result => {
            this.username = result.username
            this.fetchLists()
        })
    },
}
</script>