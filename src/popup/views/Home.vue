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
                    <li class="content__table__tr__td content__header__tr__td">
                        <span class="content__header__tr__td__nums">數</span>名字
                    </li>
                    <li class="content__table__tr__td content__header__tr__td">操作</li>
                </ul>
            </div>
            <div class="content__table content__body">
                <Fragment
                    v-for="(list, index) in lists"
                    :key="index"
                >
                    <ul
                        class="content__table__tr content__body__tr"
                        :class="{'content__body__tr--checked': list[recentSevenDays[dayCurrent]] === 'checked'}"
                        @click="urlCreate(list)"
                    >
                        <li class="content__table__tr__td content__body__tr__td">{{index+1}}</li>
                        <li class="content__table__tr__td content__body__tr__td">
                            <b
                                class="content__body__tr__td__point"
                                @click.stop="changeColor(list.color)"
                                :style="{backgroundColor: list.color}"
                            >{{list.length}}</b>
                            <span class="content__body__tr__td__name">{{list.name}}</span>
                        </li>
                        <li class="content__table__tr__td content__body__tr__td">
                            <span class="content__body__tr__td__edit">編輯</span>
                        </li>
                    </ul>
                </Fragment>
            </div>
        </section>
        <section
            class="content"
            v-else
        >今日無需複習之項目</section>
        <footer class="footer">
            <div
                class="footer__list"
                :class="{'footer__list--noweb': !hasWeb}"
            >
                <button
                    class="footer__list__btn footer__list__btn-pen"
                    @click="draw"
                ><i class="fas fa-pencil-alt"></i>
                </button>
                <span class="footer__list__text">
                    重點
                </span>
            </div>
            <div
                class="footer__list"
                :class="{'footer__list--noweb': !hasWeb}"
            >
                <button
                    class="footer__list__btn footer__list__btn-eye"
                    :style="{borderColor: hasWeb && color, color: hasWeb && color}"
                    @click="togglePen"
                ><i class="fas fa-eye"></i>
                </button>
                <span
                    class="footer__list__text"
                    :style="{color: hasWeb && color}"
                >
                    顯示
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
                    <div class="footer__list__btn-main__modal__list"><span class="footer__list__btn-main__modal__list__name">寬: {{currentWidth}}</span></div>
                    <div
                        class="footer__list__btn-main__modal__list"
                        @click="goToChart"
                    ><i class="footer__list__btn-main__modal__list__icon fas fa-chart-bar"></i><span class="footer__list__btn-main__modal__list__name">數據</span></div>
                    <div class="footer__list__btn-main__modal__list"><i class="footer__list__btn-main__modal__list__icon fas fa-question-circle"></i><span class="footer__list__btn-main__modal__list__name">說明</span></div>
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
            <template #title>新增記憶事項</template>
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
            <div
                class="create-modal__list"
                v-if="createListIsWeb"
            >
                <input
                    type="checkbox"
                    class="create-modal__list__checkbox"
                    v-model="createListIsNewColor"
                >
                <span class="create-modal__list__text">
                    是否新增顏色，下個顏色為 (<i
                        class="create-modal__list__text__color"
                        :style="{backgroundColor: createListNextColor}"
                    ></i>)
                </span>
            </div>
            <button
                class="create-modal__btn"
                @click="setData"
            >新增</button>
        </Modal>
        <Modal
            class="first-login-modal"
            ref="firstLoginModalRef"
            :canHide="false"
        >
            <template #title>首次登入</template>
            <div
                class="first-login-modal__list"
                style="margin-top: -15px;"
            >
                <input
                    class="first-login-modal__list__input"
                    :class="{'first-login-modal__list__input--valid': firstWidth}"
                    type="text"
                    ref="firstWidthRef"
                    v-model="firstWidth"
                    @keydown.enter="setFirstData"
                >
                <label class="first-login-modal__list__name">螢幕寬度
                    <span class="first-login-modal__list__name__tip">
                        (提示: 預設為螢幕寬度)
                    </span>
                </label>
            </div>
            <button
                class="first-login-modal__btn"
                @click="setFirstData"
            >確認</button>
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
        const colors = [
            '#ff2828',
            '#00c306',
            '#0089ff',
            '#ff7a08',
            '#9508ff',
            '#00dcdc',
            '#ff00a5',
            '#ffd400',
            '#000',
        ]
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
            hasWeb: false,
            // add用
            createListName: '',
            createListIsWeb: false,
            createListIsNewColor: false,
            createListNextColor: '',
            createListColor: colors[0],
            // 紅、藍、綠、橘、紫、青、粉、黃、黑
            createListColors: colors,
            // 首次
            firstWidth: 0,
            //
            currentWidth: 0,
            //
            color: '',
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
        tabsQuery(callback) {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                tabs => {
                    callback(tabs)
                },
            )
        },
        fetchCheckFirstLogin(callback) {
            if (!this.$bg.$firstLogin) return callback()

            this.userDb.get().then(querySnapshot => {
                const data = querySnapshot.data()
                if (data.firstLogin) {
                    this.firstWidth = screen.width
                    return this.showFirstLoginModal()
                } else {
                    callback()
                    return (this.$bg.$firstLogin = false)
                }
            })
        },
        fetchImportantNums() {
            this.tabsQuery(tabs => {
                const url = tabs[0].url
                this.listsDb
                    .where('url', '==', url)
                    .get()
                    .then(querySnapshot => {
                        if (!querySnapshot.empty) {
                            this.hasWeb = true
                            querySnapshot.forEach(doc => {
                                const data = doc.data()
                                if (data.lines) {
                                    if (data.lines.length) {
                                        this.isImportant = true
                                    }
                                }
                            })
                        } else {
                            this.hasWeb = false
                        }
                    })
            })
        },
        fetchLists() {
            this.isChangeDate = false
            this.tabsQuery(tabs => {
                const currentDay = this.recentSevenDays[this.dayCurrent]
                this.listsDb
                    .where('dates', 'array-contains', currentDay)
                    .get()
                    .then(querySnapshot => {
                        this.isChangeDate = true
                        let lists = []
                        querySnapshot.forEach(doc => {
                            const data = doc.data()
                            lists.push({
                                ...data,
                                uuid: doc.id,
                                length: data.lines ? data.lines.length : 0,
                            })
                        })
                        const newLists = lists.sort(
                            (a, b) =>
                                a.createTime.seconds - b.createTime.seconds,
                        )
                        this.lists = newLists
                        this.fetchImportantNums()
                    })
            })
        },
        showFirstLoginModal() {
            return this.$refs.firstLoginModalRef.show(() => {
                this.$nextTick(() => {
                    this.$refs.firstWidthRef.focus()
                })
            })
        },
        hideFirstLoginModal() {
            return this.$refs.firstLoginModalRef.hide()
        },
        setFirstData() {
            this.userDb
                .update({ firstLogin: false, width: this.firstWidth })
                .then(() => {
                    this.$bg.$firstLogin = false
                    chrome.storage.local.set({ width: this.firstWidth })
                    this.$bg.$width = this.firstWidth
                    this.currentWidth = this.firstWidth
                    this.hideFirstLoginModal()
                })
        },
        showCreateModal() {
            this.tabsQuery(tabs => {
                const url = tabs[0].url
                if (url) {
                    this.listsDb
                        .where('url', '==', url)
                        .get()
                        .then(querySnapshot => {
                            if (!querySnapshot.empty) {
                                querySnapshot.forEach(doc => {
                                    const data = doc.data()
                                    let index =
                                        this.createListColors.findIndex(
                                            color => color === data.color,
                                        ) + 1
                                    if (
                                        index === this.createListColors.length
                                    ) {
                                        index = 0
                                    }
                                    this.createListIsWeb = true
                                    this.createListNextColor = this.createListColors[
                                        index
                                    ]
                                })
                            } else {
                                this.createListIsWeb = false
                                this.createListNextColor = this.createListColors[0]
                            }

                            const ref = this.$refs.createModalRef
                            this.$refs.createModalRef.show(() => {
                                this.$nextTick(() => {
                                    this.$refs.createListNameRef.focus()
                                })
                            })
                        })
                } else {
                    return this.$my.alert(
                        this.$refs.mainRef,
                        '未捕獲到連結，請確認開啟方式',
                    )
                }
            })
        },
        hideCreateModal() {
            const ref = this.$refs.createModalRef
            this.$refs.createModalRef.hide(
                () => (this.createListColor = this.createListColors[0]),
            )
        },
        setData() {
            this.tabsQuery(tabs => {
                const url = tabs[0].url
                if (url) {
                    const day = 86400000
                    const pushData = {
                        createTime: new Date(),
                        dates: [],
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
                        pushData[formatDate] = 'unchecked'
                        pushData.dates.push(formatDate)
                    }
                    this.listsDb
                        .where('url', '==', url)
                        .where('color', '==', this.createListColor)
                        .get()
                        .then(querySnapshot => {
                            if (querySnapshot.empty) {
                                this.listsDb
                                    .add({
                                        ...pushData,
                                        color: this.createListColor,
                                    })
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
                                    this.listsDb
                                        .doc(id)
                                        .update(pushData)
                                        .then(() => this.fetchLists())
                                })
                            }
                            this.createListName = ''
                            this.createListIsNewColor = false
                            this.createListColor = this.createListColors[0]

                            this.hideCreateModal()
                        })
                }
            })
        },
        deleteData() {
            this.tabsQuery(tabs => {
                const url = tabs[0].url
                if (url) {
                    this.listsDb
                        .where('url', '==', url)
                        .get()
                        .then(querySnapshot => {
                            querySnapshot.forEach(doc =>
                                this.listsDb
                                    .doc(doc.id)
                                    .delete()
                                    .then(() => {
                                        this.fetchLists()
                                        chrome.tabs.executeScript(null, {
                                            file: './cs-penHidden.js',
                                        })
                                    }),
                            )
                        })
                }
            })
        },
        urlCreate(list) {
            const { url, date, width, uuid, color } = list
            chrome.tabs.query({ currentWindow: true, active: true }, tab => {
                const createData = { url }
                if (window.screen.width === width || !width) {
                    createData.state = 'maximized'
                } else {
                    createData.width = width + 16
                }
                chrome.windows.create(createData)
                this.$bg.$color = color

                const updateData = {}
                updateData[this.recentSevenDays[this.dayCurrent]] = 'checked'

                this.listsDb
                    .doc(uuid)
                    .update(updateData)
                    .then(() => this.fetchLists())
            })
        },
        draw() {
            if (!this.hasWeb)
                return this.$my.alert(this.$refs.mainRef, '此連結尚未新增')
            chrome.tabs.executeScript(null, {
                file: './cs-pen.js',
            })
        },
        togglePen() {
            if (!this.hasWeb)
                return this.$my.alert(this.$refs.mainRef, '此連結尚未新增')
            chrome.tabs.executeScript(null, {
                file: './cs-penToggle.js',
            })
        },
        goToChart() {
            this.$router.push('/chart')
        },
        changeColor(color) {
            this.$bg.$color = color
            this.color = color
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
        listsDb() {
            return this.$db
                .collection('USERS')
                .doc(this.userId)
                .collection('LISTS')
        },
        userDb() {
            return this.$db.collection('USERS').doc(this.userId)
        },
    },
    watch: {
        dayCurrent() {
            this.lists = []
            return this.fetchLists()
        },
        createListIsNewColor(is) {
            if (is) {
                this.createListColor = this.createListNextColor
            } else {
                const newColor = this.createListColors[
                    this.createListColors.findIndex(
                        color => color === this.createListNextColor,
                    ) - 1
                ]
                this.createListColor = newColor
            }
        },
    },
    created() {
        this.color = this.$bg.$color
        chrome.storage.local.get('id', result => {
            this.userId = result.id
            this.fetchCheckFirstLogin(() => {
                this.fetchLists()
                this.fetchImportantNums()
                if (!this.$bg.$width) {
                    chrome.storage.local.get('width', result => {
                        const width = result.width
                        this.currentWidth = result.width
                        this.$bg.$width = result.width
                    })
                } else {
                    this.currentWidth = this.$bg.$width
                }
            })
        })
        chrome.storage.local.get('fightingWord', result => {
            this.fightingWord = result.fightingWord
        })
    },
    mounted() {},
    beforeDestroy() {},
}
</script>

<style lang="sass" scoped>
@import '../style/home'
</style>