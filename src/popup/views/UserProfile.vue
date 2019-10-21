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
        <section class="content">
            <div class="content__input-wrapper">
                <input
                    class="content__input-wrapper__input"
                    :class="{'content__input-wrapper__input--valid': username}"
                    type="text"
                    v-model="username"
                    disabled
                >
                <div class="content__input-wrapper__name content__input-wrapper__name--disabled">帳號</div>
            </div>
            <div class="content__input-wrapper">
                <input
                    class="content__input-wrapper__input"
                    :class="{'content__input-wrapper__input--valid': createTime}"
                    type="text"
                    v-model="createTime"
                    disabled
                >
                <div class="content__input-wrapper__name content__input-wrapper__name--disabled">創建時間</div>
            </div>
            <div class="content__input-wrapper">
                <input
                    class="content__input-wrapper__input"
                    :class="{'content__input-wrapper__input--valid': password}"
                    type="password"
                    v-model="password"
                    @keydown.enter="changePassword"
                >
                <div class="content__input-wrapper__name">* 舊密碼</div>
            </div>
            <div class="content__input-wrapper">
                <input
                    class="content__input-wrapper__input"
                    :class="{'content__input-wrapper__input--valid': newPassword}"
                    type="password"
                    v-model="newPassword"
                    @keydown.enter="changePassword"
                >
                <div class="content__input-wrapper__name">* 新密碼</div>
            </div>
            <div class="content__input-wrapper">
                <input
                    class="content__input-wrapper__input"
                    :class="{'content__input-wrapper__input--valid': checkNewPassword}"
                    type="password"
                    v-model="checkNewPassword"
                    @keydown.enter="changePassword"
                >
                <div class="content__input-wrapper__name">* 確認新密碼</div>
            </div>
            <button
                class="submit"
                @click="changePassword"
                v-if="!isChangeLoading"
            >登入</button>
            <button
                class="submit"
                v-else
            ><i class="submit__spin"></i></button>
        </section>
    </main>
</template>
<script>
import Header from '../components/Header'
import crypto from 'crypto'

export default {
    data() {
        return {
            uid: '',
            username: '',
            createTime: '',
            password: '',
            newPassword: '',
            checkNewPassword: '',
            isChangeLoading: false,
        }
    },
    // props: {},
    components: { Header },
    computed: {
        userDB() {
            return this.$db.ref(`USERS/${this.uid}`)
        },
        _userDB() {
            return this.$db.ref(`_USERS/${this.uid}`)
        },
    },
    methods: {
        goToHome() {
            this.$router.push('/')
        },
        hash(val = this.password) {
            const hash = crypto
                .createHash('md5')
                .update(val)
                .digest('hex')
            return hash
        },
        changePassword() {
            if (!this.password)
                return this.$my.alert(this.$refs.mainRef, '請輸入舊密碼')
            if (!this.newPassword)
                return this.$my.alert(this.$refs.mainRef, '請輸入新密碼')
            if (!this.checkNewPassword)
                return this.$my.alert(this.$refs.mainRef, '請輸入確認新密碼')
            if (this.checkNewPassword === this.password)
                return this.$my.alert(
                    this.$refs.mainRef,
                    '新密碼不能與舊密碼相同',
                )
            if (this.checkNewPassword !== this.newPassword)
                return this.$my.alert(this.$refs.mainRef, '新密碼請相同')

            this.isChangeLoading = true
            const initPassword = () => {
                this.isChangeLoading = false
                this.password = ''
                this.newPassword = ''
                this.checkNewPassword = ''
            }
            this.userDB
                .orderByChild('password')
                .equalTo(this.hash())
                .once('value', () => {
                    this._userDB
                        .update({
                            password: this.hash(this.newPassword),
                            uid: this.$auth.currentUser.uid,
                        })
                        .then(() => {
                            initPassword()
                            this.$my.alert(
                                this.$refs.mainRef,
                                '密碼變更成功',
                                'success',
                            )
                        })
                })
                .catch(err => {
                    this.isChangeLoading = false
                    this.$my.alert(this.$refs.mainRef, '舊密碼錯誤')
                })
        },
    },
    // watch: {},
    created() {
        chrome.storage.local.get('id', result => {
            this.uid = result.id
            this.userDB.once('value', snap => {
                const data = snap.val()
                this.username = data.username
                this.createTime = data.createTime
            })
        })
    },
    // mounted() {},
    // beforeDestroy() {},
}
</script>
<style lang="sass" scoped>
@import '../style/user-profile'
</style>