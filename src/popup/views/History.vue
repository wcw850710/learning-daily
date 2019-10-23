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
        <!-- <section
            class="content"
            v-if="lists.length"
        >
            <div class="content__table content__header">
                <ul class="content__table__tr content__header__tr">
                    <li class="content__table__tr__td content__header__tr__td"></li>
                    <li class="content__table__tr__td content__header__tr__td">
                        名字
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
                        <li class="content__table__tr__td content__body__tr__td">{{index+1}}</li>
                        <li class="content__table__tr__td content__body__tr__td">
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
        </section> -->
    </main>
</template>
<script>
import Header from '../components/Header'
import Fragment from '../components/Fragment'

export default {
    data() {
        return { uid: '', lists: [], page: 1, pageSize: 2 }
    },
    // props: {},
    components: { Header, Fragment },
    computed: {
        userListsDB() {
            return this.$db.ref(`USERS/${this.uid}/LISTS`)
        },
    },
    methods: {
        goToHome() {
            this.$router.push('/')
        },
        fetchFirstLists() {
            this.userListsDB
                .orderByChild('historyTime')
                .limit(2)
                .once('value', snap => {
                    console.log(snap.val())
                })
                .catch(err => console.log(err))
            // this.userListsDB
            //     .orderByChild('historyTime')
            //     .limitToLast(this.pageSize)
            //     .once('value', snap => {
            //         snap.forEach(doc => {
            //             const data = doc.val()
            //             const keys = Object.keys(data)
            //             let len = 0
            //             keys.forEach(key => {
            //                 if (/^\w+-\w+-\w+$/.test(key)) {
            //                     if (data[key] === 1) {
            //                         len++
            //                     }
            //                 }
            //             })
            //             data.checkedLen = len
            //             this.lists.push(data)
            //         })
            //     })
            //     .catch(err => console.log(err))
        },
        fetchLists() {
            this.userListsDB
                .orderByChild('historyTime')
                .endAt('2019-10-23 06:56:59')
                .limitToLast(this.pageSize)
                .once('value', snap => {
                    snap.forEach(doc => {
                        const data = doc.val()
                    })
                })
                .catch(err => console.log(err))
        },
        urlCreate() {},
    },
    // watch: {},
    created() {
        chrome.storage.local.get('id', result => {
            this.uid = result.id
            this.fetchFirstLists()
        })
    },
    // mounted() {},
    // beforeDestroy() {},
}
</script>
<style lang="sass" scoped>
// @import ''
</style>