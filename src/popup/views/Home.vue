<template>
    <main class="main">
        <header class="header">
            <div class="header__title">每天學一點</div>
            <div class="header__question"><i class="fas fa-question"></i></div>
        </header>
        <section class="fighting-word">{{fightingWord ? fightingWord : '每天學一點，成功近一點。'}}</section>
        <section
            class="dates-banner"
            @wheel="wheelChangeDayCurrent($event)"
        >
            <button
                class="dates-banner__prev"
                @click="changeDayCurrent('minus')"
            ><i class="fas fa-angle-left"></i></button>
            <button
                class="dates-banner__next"
                @click="changeDayCurrent('increase')"
            ><i class="fas fa-angle-right"></i></button>
            <ul
                class="dates-banner__wrapper"
                :style="{transform: 'translateX(' + (dayCurrent * -55 + 25) + '%)'}"
            >
                <li
                    class="dates-banner__wrapper__day"
                    :class="{'dates-banner__wrapper__day--active': index === dayCurrent}"
                    v-for="(day, index) in recentSevenDays"
                    :key="index"
                    @click="changeDayCurrent(index)"
                >{{day}}{{index === 3 ? ' (今日)' : ''}}</li>
            </ul>
        </section>
        <section
            class="content"
            v-if="filterLists().length"
        >
            <div class="content__table content__header">
                <ul class="content__table__tr content__header__tr">
                    <li class="content__table__tr__td content__header__tr__td"></li>
                    <li class="content__table__tr__td content__header__tr__td">名字</li>
                    <li class="content__table__tr__td content__header__tr__td">重點數</li>
                </ul>
            </div>
            <div class="content__table content__body">
                <Fragment
                    v-for="(list, index) in filterLists()"
                    :key="index"
                >
                    <ul
                        class="content__table__tr content__body__tr"
                        :class="{'content__body__tr--checked': list.isChecked}"
                        @click="urlCreate(list)"
                    >
                        <li class="content__table__tr__td content__body__tr__td">{{index+1}}</li>
                        <li class="content__table__tr__td content__body__tr__td">{{list.name}}</li>
                        <li class="content__table__tr__td content__body__tr__td"><b>{{list.length}}</b></li>
                    </ul>
                </Fragment>
            </div>
        </section>
        <section
            class="content"
            v-else
        >今日無需複習之項目</section>
        <footer class="footer">
            <div class="footer__list">
                <button
                    class="footer__list__btn footer__list__btn-pen"
                    @click="draw"
                ><i class="fas fa-pencil-alt"></i>
                </button>
                <span class="footer__list__text">
                    重點 (q)
                </span>
            </div>
            <div class="footer__list">
                <button
                    class="footer__list__btn footer__list__btn-eye"
                    :class="{'footer__list__btn-eye--show': isShowPen}"
                    @click="togglePen"
                ><i class="fas fa-eye"></i>
                </button>
                <span class="footer__list__text">
                    顯示 (w)
                </span>
            </div>
            <div class="footer__list">
                <button class="footer__list__btn footer__list__btn-main">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
                <span class="footer__list__text">
                    選單
                </span>
            </div>
            <div class="footer__list">
                <button
                    class="footer__list__btn footer__list__btn-increase"
                    @click="showCreateModal"
                ><i class="fas fa-plus"></i>
                </button>
                <span class="footer__list__text">
                    新增
                </span>
            </div>
            <div class="footer__list">
                <button
                    class="footer__list__btn footer__list__btn-delete"
                    @dblclick="deleteData"
                ><i class="fas fa-trash-alt"></i>
                </button>
                <span class="footer__list__text">
                    刪除
                </span>
            </div>
        </footer>
        <Modal
            ref="createModalRef"
            class="create-modal"
        >
            <div class="create-modal__title">新增記憶事項</div>
            <div class="create-modal__list">
                <input
                    class="create-modal__list__input"
                    :class="{'create-modal__list__input--valid': createListName}"
                    type="text"
                    ref="createListNameRef"
                    v-model="createListName"
                    @keydown.enter="setData"
                >
                <label class="create-modal__list__name">名字</label>
            </div>
            <button
                class="create-modal__btn"
                @click="setData"
            >新增</button>
        </Modal>
    </main>
</template>

<script>
import Fragment from '../components/Fragment'
import Modal from '../components/Modal'

export default {
    name: 'HelloWorld',
    data() {
        return {
            lists: [],
            username: '',
            fightingWord: '',
            dayCurrent: 3,
            webs: [],
            times: [0, 1, 3, 6, 14, 29, 89],
            isShowDescription: false,
            isShowPen: false,
            // add用
            createListName: '',
        }
    },
    components: {
        Fragment,
        Modal,
    },
    methods: {
        increaseDayCurrent() {
            if (this.dayCurrent + 1 > 6) {
                return
            }
            this.dayCurrent++
        },
        minusDayCurrent() {
            if (this.dayCurrent - 1 < 0) {
                return
            }
            this.dayCurrent--
        },
        wheelChangeDayCurrent(ev) {
            const { wheelDeltaY: dy } = ev
            if (dy === -120) {
                this.increaseDayCurrent()
            } else {
                this.minusDayCurrent()
            }
        },
        changeDayCurrent(val) {
            const type = typeof val
            switch (type) {
                case 'string':
                    if (val === 'increase') {
                        this.increaseDayCurrent()
                    } else {
                        this.minusDayCurrent()
                    }
                    break
                case 'number':
                    this.dayCurrent = val
                    break
            }
        },
        toggleDescription() {
            this.isShowDescription = !this.isShowDescription
        },
        formatDate(time) {
            return this.$bg.formatDate(time)
        },
        fetchWebs() {
            this.$db.ref(`/${this.username}/webs`).on('value', snapshot => {
                const data = snapshot.val()
                this.webs = []
                for (let uuid in data) {
                    const web = data[uuid]
                    this.webs.push({
                        url: web.url,
                        length: Object.keys(web.lines).length,
                        width: web.width || 1920,
                    })
                }
            })
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
                                const length = this.webs.find(
                                    web => web.url === data[key].url,
                                ).length
                                this.lists.push({
                                    ...data[key],
                                    length,
                                })
                            }
                        })
                },
            )
        },
        filterLists() {
            const filterLists = this.lists.filter(
                list => list.date === this.recentSevenDays[this.dayCurrent],
            )
            return filterLists
        },
        showCreateModal() {
            const ref = this.$refs.createModalRef
            this.$refs.createModalRef.show(() => {
                this.$nextTick(() => {
                    this.$refs.createListNameRef.focus()
                    window.removeEventListener('keydown', this.keydownToDraw)
                })
            })
        },
        hideCreateModal() {
            const ref = this.$refs.createModalRef
            this.$refs.createModalRef.hide()
            window.addEventListener('keydown', this.keydownToDraw)
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
                                name: this.createListName,
                                isChecked: false,
                            }
                            this.$db.ref(this.refLists).push(pushData)
                        }
                        this.hideCreateModal()
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
                        this.$db
                            .ref(`${this.username}/webs`)
                            .orderByChild('url')
                            .equalTo(url)
                            .once('value', snapshot => {
                                const data = snapshot.val()
                                for (let uuid in data) {
                                    this.$db
                                        .ref(`${this.username}/webs/${uuid}`)
                                        .remove()
                                }
                            })
                    }
                },
            )
        },
        urlCreate(list) {
            const { url, date, isChecked } = list
            chrome.tabs.query({ currentWindow: true, active: true }, tab => {
                const createData = { url }
                const findWeb = this.webs.find(web => web.url === url)
                if (window.screen.width === findWeb.width) {
                    createData.state = 'maximized'
                } else {
                    createData.width = findWeb.width + 16
                }
                chrome.windows.create(createData)

                this.$db
                    .ref(this.refLists)
                    .orderByChild('date')
                    .equalTo(date)
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
        keydownToDraw(ev) {
            const { key, ctrlKey } = ev
            if (key === 'q') {
                this.draw()
            } else if (key === 'w') {
                this.togglePen()
            }
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
            new Promise(reslove => {
                this.fetchWebs()
                reslove()
            }).then(res => this.fetchLists())
        })
        chrome.storage.local.get(['fightingWord'], result => {
            this.fightingWord = result.fightingWord
        })
    },
    mounted() {
        window.addEventListener('keydown', this.keydownToDraw)
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.keydownToDraw)
    },
}
</script>

<style lang="sass" scoped>
@import '../style/home'
</style>