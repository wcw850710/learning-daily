<template>
    <div class="root">
        <header class="header">
            <div class="header__title">每天學一點</div>
            <div
                class="header__logout"
                @click="logout"
            ><i class="fas fa-sign-out-alt"></i></div>
        </header>
        <section class="fighting-word">
            <slot></slot>
        </section>
    </div>
</template>
<script>
// import test from '@/components/test'
export default {
    // data() {
    //     return {}
    // },
    // props: {},
    // components: {},
    // computed: {},
    methods: {
        logout() {
            const user = this.$auth.currentUser
            this.$auth.signOut().then(() => {
                user.delete()
                chrome.storage.local.get('username', result => {
                    const username = result.username
                    this.$bg.tipNums(username)
                    chrome.storage.local.remove('username', () => {
                        this.$bg.$firstLogin = true
                        this.$bg.$width = 0
                        chrome.storage.local.remove('width')
                        this.$router.push('/login')
                    })
                })
            })
        },
    },
    // watch: {},
    created() {},
    // mounted() {},
    // beforeDestroy() {},
}
</script>
<style lang="sass" scoped>
@import './style/header'
</style>