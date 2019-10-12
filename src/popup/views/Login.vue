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
        <div class="login__first">首次登入即註冊</div>
        <button
            class="login__submit"
            @click="login"
        >登入</button>
    </main>
</template>
<script>
import crypto from 'crypto'

export default {
    data() {
        return {
            username: '',
            password: '',
            fightingWord: '',
        }
    },
    props: {},
    components: {},
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
            const chromeStorageSet = () => {
                chrome.storage.local.set({ username: this.username }, () => {
                    this.$bg.tipNums()
                    this.$router.push('/')
                })
            }
            if (this.username) {
                this.$db.ref(`${this.username}`).once('value', snapshot => {
                    const data = snapshot.val()
                    if (!data) {
                        if (!this.password) {
                            return this.$my.alert(
                                loginRef,
                                '請輸入密碼以便註冊',
                            )
                        } else {
                            this.$db
                                .ref(`${this.username}`)
                                .set({
                                    password: this.hash(this.password),
                                    fightingWord: this.fightingWord,
                                })
                                .then(res => chromeStorageSet())
                        }
                    } else if (data.password !== this.hash()) {
                        return this.$my.alert(loginRef, '使用者密碼不正確')
                    } else {
                        this.$db
                            .ref(`${this.username}/fightingWord`)
                            .set(this.fightingWord)
                            .then(res => chromeStorageSet())
                    }
                })
            } else {
                console.log(this.$my)
                return this.$my.alert(loginRef, '請輸入帳號密碼')
            }
        },
    },
    watch: {},
    created() {},
    mounted() {},
    beforeDestroy() {},
}
</script>

<style lang="sass" scoped>
@import '../style/login'
</style>