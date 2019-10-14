<template>
    <transition name="fade">
        <div
            class="modal"
            v-if="isShow"
        >
            <div
                class="modal__bk-screen"
                @click="hide"
            ></div>
            <div class="modal__content">
                <slot></slot>
            </div>
        </div>
    </transition>
</template>
<script>
export default {
    data() {
        return {
            isShow: false,
        }
    },
    props: {},
    components: {},
    computed: {},
    methods: {
        show(callback) {
            this.isShow = true
            callback()
        },
        hide(callback) {
            this.isShow = false
            callback()
        },
    },
    watch: {},
    created() {},
    mounted() {},
    beforeDestroy() {},
}
</script>
<style lang="sass" scoped>
@import './style/modal'
.fade-enter-active, .fade-leave-active
    transition: opacity .5s
.fade-enter, .fade-leave-to
    opacity: 0
</style>