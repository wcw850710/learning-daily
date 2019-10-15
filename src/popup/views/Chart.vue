<template>
    <div class="root">
        <Header>
            <span
                class="go-home"
                @click="goToHome"
            >
                <i class="go-home__icon fas fa-long-arrow-alt-left"></i>
                返回首頁
            </span>
        </Header>
        <section class="control">
            <div class="control__score">
                <strong class="control__score__big">309</strong>
                <b class="control__score__badge">/ 1</b>
            </div>
            <div class="control__selects">
                <Select
                    v-model="selectedRangeVal"
                    :options="rangeOptions"
                ></Select>
                <Select
                    v-model="selectedDetailVal"
                    :options="detailOptions"
                    v-if="detailOptions.length"
                ></Select>
            </div>
        </section>
        <section class="tip">
            <div class="tip__score">創立時間不重複單字數</div>
            <div
                class="tip__selects"
                v-if="currentTipBadge"
            >
                <div class="tip__selects__badge">{{currentTipBadge}}</div>
                <div class="tip__selects__text">- {{currentTipText}}</div>
            </div>
        </section>
        <section class="chart">
            <img
                src="@/assets/chart.png"
                alt=""
            >
            目前暫無數據圖表
        </section>
    </div>
</template>
<script>
import Header from '../components/Header'
import Select from '../components/Select'

export default {
    data() {
        return {
            selectedRangeVal: -1,
            rangeOptions: [
                {
                    text: '請選擇範圍',
                    value: -1,
                    disabled: true,
                },
                {
                    text: '本週',
                    value: 'week',
                },
                {
                    text: '月份',
                    value: 'months',
                },
                {
                    text: '年份',
                    value: 'years',
                },
            ],
            selectedDetailVal: -1,
            detailOptions: [],
            currentTipBadge: '',
            currentTipText: '',
        }
    },
    // props: {},
    components: {
        Header,
        Select,
    },
    // computed: {},
    methods: {
        formatMonth(date) {
            return this.$bg.formatMonth(date)
        },
        formatDate(date) {
            return this.$bg.formatDate(date)
        },
        goToHome() {
            this.$router.push('/')
        },
    },
    watch: {
        selectedRangeVal(val) {
            if (val === 'months') {
                const year = new Date().getFullYear()
                this.selectedDetailVal = -1
                this.detailOptions = [
                    {
                        text: '請選擇細節',
                        value: -1,
                        disabled: true,
                    },
                ]
                for (let i = 1; i < 13; i++) {
                    const text = `${year} 年 ${String(i).padStart(2, '0')} 月`
                    const value = `${year}-${String(i).padStart(2, '0')}`

                    this.detailOptions.push({
                        text,
                        value,
                    })
                }
                this.selectedDetailVal = this.formatMonth(new Date())
                this.currentTipBadge = '月'
            } else if (val === 'years') {
                const year = new Date().getFullYear() - 1
                this.selectedDetailVal = -1
                this.detailOptions = [
                    {
                        text: '請選擇細節',
                        value: -1,
                        disabled: true,
                    },
                ]
                for (let i = 0; i < 3; i++) {
                    const text = `${year + i} 年`
                    const value = String(year + i)
                    this.detailOptions.push({
                        text,
                        value,
                    })
                }
                this.selectedDetailVal = String(new Date().getFullYear())
                this.currentTipBadge = '年'
            } else {
                this.selectedDetailVal = -1
                this.detailOptions = []
                this.currentTipBadge = '週'
                this.currentTipText = '本周 7 天'
            }
        },
        selectedDetailVal(val) {
            if (val !== -1) {
                const findOption = this.detailOptions.find(
                    option => option.value === val,
                )
                if (findOption) {
                    this.currentTipText = findOption.text
                }
            }
        },
    },
    // created() {},
    // mounted() {},
    // beforeDestroy() {},
}
</script>
<style lang="sass" scoped>
@import '../style/chart'
</style>