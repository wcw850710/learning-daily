<template>
    <main
        class="login"
        ref="loginRef"
    >
        <Modal ref="registerModalRef">
            <template #title>註冊</template>
            <input
                type="text"
                v-model="regUsername"
            />
            <input
                type="text"
                v-model="regPassword"
            />
            <input
                type="text"
                v-model="regCheckPassword"
            />
            <button @click="register">註冊</button>
        </Modal>
        <img
            class="login__logo"
            src="@/assets/logo.png"
            alt=""
        >
        <div class="login__input-wrapper">
            <input
                class="login__input-wrapper__input"
                :class="{'login__input-wrapper__input--valid': username}"
                ref="usernameRef"
                type="text"
                v-model="username"
                @keydown.enter="login"
            >
            <div class="login__input-wrapper__name">* 帳號</div>
        </div>
        <div class="login__input-wrapper">
            <input
                class="login__input-wrapper__input"
                :class="{'login__input-wrapper__input--valid': password}"
                type="password"
                v-model="password"
                @keydown.enter="login"
            >
            <div class="login__input-wrapper__name">* 密碼</div>
        </div>
        <div class="login__input-wrapper">
            <input
                class="login__input-wrapper__input"
                :class="{'login__input-wrapper__input--valid': fightingWord}"
                type="text"
                v-model="fightingWord"
                @keydown.enter="login"
            >
            <div class="login__input-wrapper__name">激勵小語(非必填)</div>
        </div>
        <div
            class="login__first"
            @click="showRegisterModalRef"
        >註冊</div>
        <button
            class="login__submit"
            @click="login"
        >登入</button>
    </main>
</template>
<script>
import crypto from 'crypto'
import Modal from '../components/Modal'
import uuid from 'uuid/v4'

export default {
    data() {
        return {
            username: '',
            password: '',
            fightingWord: '',
            regUsername: '',
            regPassword: '',
            regCheckPassword: '',
        }
    },
    props: {},
    components: {
        Modal,
    },
    computed: {},
    methods: {
        hash(val = this.password) {
            const hash = crypto
                .createHash('md5')
                .update(val)
                .digest('hex')
            return hash
        },
        login() {
            const loginRef = this.$refs.loginRef
            if (!this.username) {
                return this.$my.alert(loginRef, '帳號不能為空')
            } else {
                if (!this.password) {
                    return this.$my.alert(loginRef, '密碼不能為空')
                }
                const userRef = this.$db.collection('USERS')
                userRef
                    .where('username', '==', this.username)
                    .where('password', '==', this.hash())
                    .get()
                    .then(querySnapshot => {
                        if (querySnapshot.empty) {
                            return this.$my.alert(loginRef, '帳號或密碼錯誤')
                        } else {
                            querySnapshot.forEach(doc => {
                                const data = doc.data()
                                const chromeStorageSet = id => {
                                    chrome.storage.local.set(
                                        {
                                            id,
                                            fightingWord: data.fighting_word,
                                        },
                                        () => {
                                            this.$bg.tipNums()
                                            this.$router.push('/')
                                        },
                                    )
                                }
                                const login = () => {
                                    if (data.width) {
                                        chrome.storage.local.set(
                                            {
                                                width: data.width || null,
                                            },
                                            () => chromeStorageSet(doc.id),
                                        )
                                    } else {
                                        chromeStorageSet(doc.id)
                                    }
                                }
                                if (this.fightingWord) {
                                    userRef
                                        .doc(doc.id)
                                        .update({
                                            aaa: 'aaa',
                                            fighting_word: this.fightingWord,
                                        })
                                        .then(() => login())
                                } else {
                                    login()
                                }
                            })
                        }
                        // if (querySnapshot.empty) {
                        //     if (!this.password) {
                        //         return this.$my.alert(
                        //             loginRef,
                        //             '請輸入密碼以便註冊',
                        //         )
                        //     } else {
                        //         dbRef
                        //             .add({
                        //                 username: this.username,
                        //                 password: this.hash(),
                        //                 fighting_word: this.fightingWord,
                        //                 firstLogin: true,
                        //             })
                        //             .then(doc => {
                        //                 chromeStorageSet(doc.id)
                        //             })
                        //     }
                        // } else {
                        //     querySnapshot.forEach(doc => {
                        //         const data = doc.data()
                        //         if (!data) {
                        //             register()
                        //         } else if (data.password !== this.hash()) {
                        //             return this.$my.alert(
                        //                 loginRef,
                        //                 '使用者密碼不正確',
                        //             )
                        //         } else {
                        //             dbRef
                        //                 .doc(doc.id)
                        //                 .update({
                        //                     fighting_word: this.fightingWord,
                        //                 })
                        //                 .then(() => {
                        //                     if (data.width) {
                        //                         chrome.storage.local.set(
                        //                             {
                        //                                 width:
                        //                                     data.width || null,
                        //                             },
                        //                             () =>
                        //                                 chromeStorageSet(
                        //                                     doc.id,
                        //                                 ),
                        //                         )
                        //                     } else {
                        //                         chromeStorageSet(doc.id)
                        //                     }
                        //                 })
                        //         }
                        //     })
                        // }
                    })
            }
        },
        showRegisterModalRef() {
            return this.$refs.registerModalRef.show()
        },
        register() {
            if (!this.regUsername) return this.$my.alert(loginRef, '請輸入帳號')
            if (!this.regPassword) return this.$my.alert(loginRef, '請輸入帳號')
            // regUsername: '',
            // regPassword: '',
            // regCheckPassword: '',
        },
    },
    watch: {},
    created() {},
    mounted() {
        this.$refs.usernameRef.focus()
        this.$db.collection('USERS').add({ username: 'jeff', password: '1235' })
    },
    beforeDestroy() {},
}
</script>

<style lang="sass" scoped>
@import '../style/login'
</style>