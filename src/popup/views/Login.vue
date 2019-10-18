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
        }
    },
    props: {},
    components: {
        Modal,
    },
    computed: {
        usersDB() {
            return this.$db.collection('USERS')
        },
        _usersDB() {
            return this.$db.collection('_USERS')
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
        chromeStorageSet(fightingWord, width) {
            chrome.storage.local.set(
                {
                    username: this.username,
                    width,
                    fightingWord,
                },
                () => {
                    this.$bg.tipNums()
                    this.$router.push('/')
                },
            )
        },
        authLogin({ fighting_word, width }) {
            this.$auth.signInAnonymously().then(user => {
                this._usersDB.doc(this.username).update({
                    uid: user.user.uid,
                })
                if (
                    this.fighting_word &&
                    fighting_word !== this.fighting_word
                ) {
                    this.usersDB.doc(this.username).update({
                        fighting_word: this.fighting_word,
                    })
                }
                this.chromeStorageSet(fighting_word, width)
            })
        },
        authRegister() {
            this.$auth.signInAnonymously().then(user => {
                this.usersDB
                    .doc(this.username)
                    .set({
                        width: 0,
                        fighting_word: this.fightingWord,
                        firstLogin: true,
                        createTime: new Date(),
                    })
                    .then(() => {
                        this.$bg.$firstLogin = true
                        this._usersDB.doc(this.username).set({
                            uid: user.user.uid,
                            password: this.hash(),
                        })
                        this.chromeStorageSet(this.fightingWord, 0)
                    })
            })
        },
        login() {
            const loginRef = this.$refs.loginRef
            if (!this.username) {
                return this.$my.alert(loginRef, '帳號不能為空')
            } else {
                if (!this.password) {
                    return this.$my.alert(loginRef, '密碼不能為空')
                }

                this.usersDB
                    .doc(this.username)
                    .get()
                    .then(snap => {
                        if (!snap.exists) {
                            return this.authRegister()
                        }
                        this.usersDB
                            .where('username', '==', this.username)
                            .where('password', '==', this.hash())
                            .get()
                            .then(() => {
                                this.authLogin(snap.data())
                            })
                            .catch(err => {
                                console.log(err)
                                this.$my.alert(loginRef, '帳號或密碼錯誤')
                            })
                    })
            }
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