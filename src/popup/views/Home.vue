<template>
    <main
        class="main"
        ref="mainRef"
    >
        <Header>{{fightingWord ? fightingWord : '每天學一點，成功近一點。'}}</Header>
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
            v-if="lists.length"
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
                    v-for="(list, index) in lists"
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
            <div
                class="footer__list"
                :class="{'footer__list--important': isImportant}"
            >
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
                <label
                    for="main-checkbox"
                    class="footer__list__btn footer__list__btn-main"
                >
                    <i class="fas fa-ellipsis-h"></i>
                </label>
                <input
                    type="checkbox"
                    id="main-checkbox"
                    class="footer__list__btn-main__checkbox"
                >
                <span class="footer__list__text">
                    選單
                </span>
                <div class="footer__list__btn-main__modal">
                    <div
                        class="footer__list__btn-main__modal__list footer__list__btn-main__modal__list-question"
                        @click="goToChart"
                    ><i class="footer__list__btn-main__modal__list__icon fas fa-chart-bar"></i><span class="footer__list__btn-main__modal__list__name">數據</span></div>
                    <div class="footer__list__btn-main__modal__list footer__list__btn-main__modal__list-question"><i class="footer__list__btn-main__modal__list__icon fas fa-question-circle"></i><span class="footer__list__btn-main__modal__list__name">說明</span></div>
                </div>
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
import Header from '../components/Header'
import Fragment from '../components/Fragment'
import Modal from '../components/Modal'

export default {
    name: 'HelloWorld',
    data() {
        return {
            lists: [],
            userId: '',
            fightingWord: '',
            dayCurrent: 3,
            times: [0, 1, 3, 6, 14, 29, 89],
            isShowDescription: false,
            isShowPen: false,
            isChangeDate: true,
            isImportant: false,
            // add用
            createListName: '',
        }
    },
    components: {
        Fragment,
        Modal,
        Header,
    },
    methods: {
        increaseDayCurrent() {
            if (!this.isChangeDate) return
            if (this.dayCurrent + 1 > 6) {
                return
            }
            this.dayCurrent++
        },
        minusDayCurrent() {
            if (!this.isChangeDate) return
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
            if (!this.isChangeDate) return
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
        fetchImportantNums() {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                tabs => {
                    const url = tabs[0].url
                    this.db
                        .where('url', '==', url)
                        .get()
                        .then(querySnapshot => {
                            if (!querySnapshot.empty) {
                                querySnapshot.forEach(doc => {
                                    const data = doc.data()
                                    if (data.lines) {
                                        if (data.lines.length) {
                                            this.isImportant = true
                                        }
                                    }
                                })
                            }
                        })
                },
            )
        },
        fetchLists() {
            this.isChangeDate = false
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                tabs => {
                    const currentDay = this.recentSevenDays[this.dayCurrent]
                    this.lists = []
                    this.db
                        .where('dates', 'array-contains', currentDay)
                        .get()
                        .then(querySnapshot => {
                            this.isChangeDate = true
                            querySnapshot.forEach(doc => {
                                const {
                                    isChecked,
                                    url,
                                    name,
                                    lines,
                                } = doc.data()
                                this.lists.push({
                                    name,
                                    url,
                                    isChecked,
                                    uuid: doc.id,
                                    length: lines ? lines.length : 0,
                                })
                            })
                        })
                },
            )
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
                        const pushData = {
                            createTime: new Date(),
                            dates: [],
                            isChecked: false,
                            name: this.createListName,
                            url,
                        }
                        for (
                            let i = 0, length = this.times.length;
                            i < length;
                            i++
                        ) {
                            let time = this.times[i]
                            const formatDate = this.formatDate(
                                new Date(new Date().getTime() + day * time),
                            )
                            pushData.dates.push(formatDate)
                        }
                        this.db
                            .where('url', '==', url)
                            .get()
                            .then(querySnapshot => {
                                if (querySnapshot.empty) {
                                    this.db
                                        .add(pushData)
                                        .then(() => this.fetchLists())
                                } else {
                                    querySnapshot.forEach(doc => {
                                        const { dates } = doc.data()
                                        const id = doc.id
                                        if (dates.length)
                                            return this.$my.alert(
                                                this.$refs.mainRef,
                                                '此連結已經創建',
                                            )
                                        this.db
                                            .doc(id)
                                            .update(pushData)
                                            .then(() => this.fetchLists())
                                    })
                                }
                                this.createListName = ''
                                this.hideCreateModal()
                            })
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
                        this.db
                            .where('url', '==', url)
                            .get()
                            .then(querySnapshot => {
                                querySnapshot.forEach(doc =>
                                    this.db
                                        .doc(doc.id)
                                        .delete()
                                        .then(() => this.fetchLists()),
                                )
                            })
                    }
                },
            )
        },
        urlCreate(list) {
            const { url, date, isChecked, width, uuid } = list
            chrome.tabs.query({ currentWindow: true, active: true }, tab => {
                const createData = { url }
                if (window.screen.width === width || !width) {
                    createData.state = 'maximized'
                } else {
                    createData.width = width + 16
                }
                chrome.windows.create(createData)

                this.db
                    .doc(uuid)
                    .update({ isChecked: true })
                    .then(() => this.fetchLists())
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
        goToChart() {
            this.$router.push('/chart')
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
        db() {
            return this.$db
                .collection('USERS')
                .doc(this.userId)
                .collection('LISTS')
        },
    },
    watch: {
        dayCurrent() {
            return this.fetchLists()
        },
    },
    created() {
        chrome.storage.local.get(['id'], result => {
            this.userId = result.id
            this.fetchLists()
            this.fetchImportantNums()
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