<template>
    <main class="login">
        <div
            class="login__alert"
            v-if="tip"
        >{{tip}}</div>
        <input
            class="login__input"
            type="text"
            placeholder="帳號"
            v-model="username"
            @keydown.enter="login"
        >
        <input
            class="login__input"
            type="password"
            placeholder="密碼"
            v-model="password"
            @keydown.enter="login"
        >
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
            tip: '',
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
            if (this.username) {
                this.$db.ref(`${this.username}`).once('value', snapshot => {
                    const data = snapshot.val()
                    if (!data) {
                        return (this.tip = '請輸入正確的帳號')
                    } else if (data.password !== this.hash()) {
                        return (this.tip = '使用者密碼不正確')
                    } else {
                        window.localStorage.setItem('username', this.username)
                        this.$router.push('/')
                    }
                })
            } else {
                this.tip = '請輸入帳號密碼'
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

</style>