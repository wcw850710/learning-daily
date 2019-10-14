<template>
    <select @change="changeOption($event)">
        <option
            v-for="(option, index) in options"
            :key="index"
            :value="option.value"
            :disabled="option.disabled"
            :selected="option.value === value"
        >{{option.text}}</option>
    </select>
</template>
<script>
// import test from '@/components/test'
export default {
    // data() {
    //     return {
    //     }
    // },
    props: ['options', 'value'],
    model: { prop: 'value', event: 'update' },
    // components: {},
    // computed: {},
    methods: {
        changeOption(ev) {
            this.$emit('update', ev.target.value)
        },
    },
    // watch: {},
    // created() {},
    // mounted() {},
    // beforeDestroy() {},
}
</script>
<style lang="sass" scoped>
@import './style/select'
</style>