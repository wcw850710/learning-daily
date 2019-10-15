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
                <strong class="control__score__big">{{padNums(pointNums)}}</strong>
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
            pointNums: 0,
            currentTipBadge: '',
            currentTipText: '',
            userId: '',
            months: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        }
    },
    // props: {},
    components: {
        Header,
        Select,
    },
    computed: {
        listsDb() {
            return this.$db
                .collection('USERS')
                .doc(this.userId)
                .collection('LISTS')
        },
        padNums() {
            return nums => String(nums).padStart(3, '0')
        },
    },
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
        countPointNums(querySnapshot) {
            if (querySnapshot.empty) {
                this.pointNums = 0
            } else {
                let nums = 0
                querySnapshot.forEach(doc => {
                    const { lines } = doc.data()
                    nums += lines.length
                })
                this.pointNums = nums
            }
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
                    const value = String(i)

                    this.detailOptions.push({
                        text,
                        value,
                    })
                }
                this.selectedDetailVal = String(new Date().getMonth() + 1)
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
                this.listsDb
                    .where(
                        'createTime',
                        '>=',
                        new Date(
                            `${new Date().getFullYear()}-${new Date().getMonth() +
                                1}-${new Date().getDate() -
                                (new Date().getDay() - 1)} 00:00:00`,
                        ),
                    )
                    .where(
                        'createTime',
                        '<=',
                        new Date(
                            `${new Date().getFullYear()}-${new Date().getMonth() +
                                1}-${new Date().getDate() +
                                (7 - new Date().getDay())} 23:59:59`,
                        ),
                    )
                    .get()
                    .then(this.countPointNums)
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
                if (val.length < 3) {
                    this.listsDb
                        .where(
                            'createTime',
                            '>=',
                            new Date(
                                `${new Date().getFullYear()}-${val}-1 00:00:00`,
                            ),
                        )
                        .where(
                            'createTime',
                            '<=',
                            new Date(
                                `${new Date().getFullYear()}-${val}-${
                                    this.months[Number(val) - 1]
                                } 23:59:59`,
                            ),
                        )
                        .get()
                        .then(this.countPointNums)
                } else {
                    this.listsDb
                        .where(
                            'createTime',
                            '>=',
                            new Date(`${val}-1-1 00:00:00`),
                        )
                        .where(
                            'createTime',
                            '<=',
                            new Date(`${val}-12-31 23:59:59`),
                        )
                        .get()
                        .then(this.countPointNums)
                }
            }
        },
    },
    created() {
        chrome.storage.local.get('id', result => {
            const { id } = result
            this.userId = id
        })
    },
    // mounted() {},
    // beforeDestroy() {},
}
</script>
<style lang="sass" scoped>
@import '../style/chart'
</style>