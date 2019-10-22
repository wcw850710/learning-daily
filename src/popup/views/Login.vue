<template>
    <main
        class="login"
        ref="loginRef"
    >
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
        <div class="login__first">首次登入及註冊</div>
        <button
            class="login__submit"
            @click="login"
            v-if="!isLoginLoading"
        >登入</button>
        <button
            class="login__submit"
            v-else
        ><i class="login__submit__spin"></i></button>
    </main>
</template>
<script>
import crypto from 'crypto'
import Modal from '../components/Modal'

export default {
    data() {
        return {
            username: '',
            password: '',
            fightingWord: '',
            isLoginLoading: false,
        }
    },
    props: {},
    components: {
        Modal,
    },
    computed: {
        usersDB() {
            return this.$db.ref('USERS')
        },
    },
    methods: {
        hash(val = this.password) {
            const hash = crypto
                .createHash('md5')
                .update(val)
                .digest('hex')
            return hash
        },
        chromeStorageSet(key, fightingWord, width) {
            chrome.storage.local.set(
                {
                    id: key,
                    width,
                    fightingWord,
                },
                () => {
                    this.$bg.tipNums()
                    this.$router.push('/')
                },
            )
        },
        authLogin(callback) {
            this.$auth.signInAnonymously().then(user => callback(user))
        },
        register(user) {
            const uid = user.user.uid
            this.usersDB
                .push({
                    username: this.username,
                    width: 0,
                    fighting_word: this.fightingWord,
                    firstLogin: true,
                    createTime: this.$bg.formatDate(
                        new Date(),
                        'YY-MM-DD hh:mm:ss',
                    ),
                })
                .then(snap => {
                    const key = snap.key
                    this.$db
                        .ref('_USERS/' + key)
                        .set({
                            password: this.hash(),
                            uid,
                        })
                        .then(() =>
                            this.chromeStorageSet(key, this.fightingWord, 0),
                        )
                })
        },
        login() {
            const loginRef = this.$refs.loginRef
            if (!this.username) return this.$my.alert(loginRef, '帳號不能為空')
            if (!this.password) return this.$my.alert(loginRef, '密碼不能為空')
            this.isLoginLoading = true
            this.usersDB
                .orderByChild('username')
                .equalTo(this.username)
                .once('value', snap => {
                    if (!snap.exists()) {
                        this.authLogin(this.register)
                    } else {
                        snap.forEach(doc => {
                            const key = doc.key
                            const { fighting_word, width } = doc.val()
                            this.$db
                                .ref('USERS/' + key)
                                .orderByChild('password')
                                .equalTo(this.hash())
                                .once('value', () =>
                                    this.authLogin(user => {
                                        this.$db
                                            .ref('_USERS/' + key)
                                            .update({
                                                password: this.hash(),
                                                uid: user.user.uid,
                                            })
                                            .then(() => {
                                                if (
                                                    this.fightingWord &&
                                                    this.fightingWord !==
                                                        fighting_word
                                                ) {
                                                    this.$db
                                                        .ref('USERS/' + key)
                                                        .update({
                                                            fighting_word: this
                                                                .fightingWord,
                                                        })
                                                        .then(() =>
                                                            this.chromeStorageSet(
                                                                key,
                                                                this
                                                                    .fightingWord,
                                                                width,
                                                            ),
                                                        )
                                                } else {
                                                    this.chromeStorageSet(
                                                        key,
                                                        fighting_word,
                                                        width,
                                                    )
                                                }
                                            })
                                    }),
                                )
                                .catch(() => {
                                    this.isLoginLoading = false
                                    this.$my.alert(loginRef, '帳號或密碼錯誤')
                                })
                        })
                    }
                })
        },
    },
    watch: {},
    created() {},
    mounted() {
        this.$refs.usernameRef.focus()
    },
    beforeDestroy() {},
}
</script>

<style lang="sass" scoped>
@import '../style/login'
</style>