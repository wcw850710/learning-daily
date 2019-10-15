<template>
    <transition name="fade">
        <div
            class="modal"
            v-if="isShow"
        >
            <div
                class="modal__bk-screen"
                @click="bkScreenHide"
            ></div>
            <div class="modal__content">
                <div class="modal__content__title">
                    <slot name="title"></slot>
                </div>
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
    props: {
        canHide: { type: Boolean, default: true },
    },
    components: {},
    computed: {},
    methods: {
        show(callback) {
            this.isShow = true
            callback()
        },
        bkScreenHide() {
            if (!this.canHide) return
            this.isShow = false
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