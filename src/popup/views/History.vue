<template>
    <main
        class="root"
        ref="mainRef"
    >
        <Header>
            <span
                class="go-home"
                @click="goToHome"
            >
                <i class="go-home__icon fas fa-long-arrow-alt-left"></i>
                返回首頁
            </span>
        </Header>
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
                    <li class="content__table__tr__td content__header__tr__td">複習數</li>
                </ul>
            </div>
            <div class="content__table content__body">
                <Fragment
                    v-for="(list, index) in lists"
                    :key="index"
                >
                    <ul
                        class="content__table__tr content__body__tr"
                        @click="urlCreate(list)"
                    >
                        <li class="content__table__tr__td content__body__tr__td">{{((page - 1) * pageSize) + (index + 1)}}</li>
                        <li class="content__table__tr__td content__body__tr__td">
                            <b
                                class="content__body__tr__td__point"
                                :style="{backgroundColor: list.color}"
                            >{{list.length}}</b>
                            <span
                                class="content__body__tr__td__name"
                                v-if="!list.isEdit"
                            >{{list.name}}</span>
                        </li>
                        <li
                            class="content__table__tr__td content__body__tr__td"
                            style="text-align: center;"
                        >
                            <span class="content__body__tr__td__edit">{{list.checkedLen}}</span>
                        </li>
                    </ul>
                </Fragment>
            </div>
            <section class="control">
                <!-- <Select
                    class="control__select"
                    :options="sizeOptions"
                    v-model="pageSize"
                ></Select> -->
                一頁 7 筆，共 {{totalListsLength}} 筆

                <ul class="control__page">
                    <li
                        v-if="page !== 1"
                        class="control__page__list control__page__list-arrow"
                    ><i
                            class="fas fa-angle-double-left"
                            @click="changePage(1)"
                        ></i></li>
                    <li
                        v-if="page !== 1"
                        class="control__page__list control__page__list-arrow"
                        @click="changePage(page - 1)"
                    ><i class="fas fa-angle-left"></i></li>
                    <li
                        class="control__page__list control__page__list-dot"
                        v-if="page > 3"
                    >...</li>
                    <Fragment
                        v-for="(val, index) in pages"
                        :key="index"
                    >
                        <li
                            v-if="val >= (page - 1) - 2 && val <= (page - 1) + 2"
                            class="control__page__list"
                            :class="{'control__page__list--active': page === val + 1}"
                            @click="changePage(val + 1)"
                        >{{val + 1}}</li>
                    </Fragment>
                    <li
                        class="control__page__list control__page__list-dot"
                        v-if="page < pages.length - 2"
                    >...</li>
                    <li
                        v-if="page !== pages.length"
                        class="control__page__list control__page__list-arrow"
                        @click="changePage(page + 1)"
                    ><i class="fas fa-angle-right"></i></li>
                    <li
                        v-if="page !== pages.length"
                        class="control__page__list control__page__list-arrow"
                    ><i
                            class="fas fa-angle-double-right"
                            @click="changePage(pages.length)"
                        ></i></li>
                </ul>
            </section>
        </section>
        <section
            class="content"
            v-else
        >
            目前無記憶事項
        </section>
    </main>
</template>
<script>
import Header from '../components/Header'
import Fragment from '../components/Fragment'
import Select from '../components/Select'

export default {
    data() {
        return {
            uid: '',
            lists: [],
            totalListsLength: 0,
            pages: [],
            page: 1,
            pageSize: 7,
            // sizeOptions: [
            //     {
            //         text: '一頁 7 筆',
            //         value: 7,
            //     },
            // ],
        }
    },
    // props: {},
    components: { Header, Fragment, Select },
    computed: {
        userListsDB() {
            return this.$db.ref(`USERS/${this.uid}/LISTS`)
        },
    },
    methods: {
        goToHome() {
            this.$router.push('/')
        },
        setPages() {
            const pageMinus = Math.ceil(this.totalListsLength / this.pageSize)
            this.pages = Array.from(new Array(pageMinus), (x, i) => i)
        },
        fetchListsLength() {
            return new Promise(res => {
                this.userListsDB.limitToLast(1).once('child_added', snap => {
                    const data = snap.val()
                    if (data) {
                        this.totalListsLength = data.index + 1
                    }
                    this.setPages()
                    res()
                })
            })
        },
        fetchLists() {
            let startNum =
                this.totalListsLength -
                (this.page - 1) * this.pageSize -
                this.pageSize
            let endNum =
                this.totalListsLength - (this.page - 1) * this.pageSize - 1
            if (startNum > this.totalListsLength - 1) {
                startNum = this.totalListsLength - 1 - this.pageSize
                if (startNum < 0) {
                    startNum = 0
                }
            }
            if (endNum > this.totalListsLength - 1) {
                endNum = this.totalListsLength - 1
            }
            this.userListsDB
                .orderByChild('index')
                .startAt(startNum)
                .endAt(endNum)
                // .endAt(this.totalListsLength - (this.page - 1) * this.pageSize)
                .once('value', snap => {
                    this.lists = []
                    let lists = []
                    snap.forEach(doc => {
                        const data = doc.val()
                        const dataKeys = Object.keys(data)
                        let checkedLen = 0
                        dataKeys.forEach(key => {
                            if (/^\d+\-\d+\-\d+/.test(key)) {
                                data[key] === 1 && checkedLen++
                            }
                        })
                        function setLen(data) {
                            if (data.customLen) {
                                return data.customLen
                            } else if (data.lines) {
                                return data.lines.length
                            } else {
                                return 0
                            }
                        }
                        const newData = {
                            ...data,
                            checkedLen,
                            length: setLen(data),
                        }
                        lists.push(newData)
                    })
                    this.lists = lists.reverse()
                })
                .catch(err => console.log(err))
        },
        changePage(val) {
            this.page = val
            this.fetchLists()
        },
        urlCreate(list) {
            const { url, width, uuid, color } = list
            chrome.tabs.query({ currentWindow: true, active: true }, tab => {
                const createData = { url }
                if (window.screen.width === width || !width) {
                    createData.state = 'maximized'
                } else {
                    createData.width = width + 16
                }
                chrome.windows.create(createData)
                this.changeColor(color)
            })
        },
    },
    watch: {
        pageSize() {
            this.page = 1
            this.setPages()
            this.fetchLists()
        },
    },
    created() {
        chrome.storage.local.get('id', async result => {
            this.uid = result.id
            await this.fetchListsLength()
            this.fetchLists()
        })
    },
    // mounted() {},
    // beforeDestroy() {},
}
</script>
<style lang="sass" scoped>
@import '../style/history'
</style>