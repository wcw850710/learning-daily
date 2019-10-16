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
                <b class="control__score__badge">/ {{docNums}}</b>
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
        <svg class="chart">
        </svg>
    </div>
</template>
<script>
import Header from '../components/Header'
import Select from '../components/Select'
import * as d3 from 'd3'

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
            docNums: 0,
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
        // formatMonth(date) {
        //     return this.$bg.formatMonth(date)
        // },
        // formatDate(date) {
        //     return this.$bg.formatDate(date)
        // },
        goToHome() {
            this.$router.push('/')
        },
        countPointNums(querySnapshot) {
            if (querySnapshot.empty) {
                this.pointNums = 0
                this.docNums = 0
            } else {
                let pointNums = 0
                let docNums = 0
                querySnapshot.forEach(doc => {
                    const { lines } = doc.data()
                    pointNums += lines ? lines.length : 0
                    docNums++
                })
                this.pointNums = pointNums
                this.docNums = docNums
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
    mounted() {
        const datas = [
            [100, 100, 75, 300, 142, 18, 0, 0, 0, 112, 200, 50],
            [0, 0, 0, 112, 200, 50, 100, 100, 75, 300, 142, 18],
            [15, 30, 65, 0, 0, 150, 20, 300, 15, 20, 140, 200],
        ]
        const colors = [
            '#00C6D8',
            '#512c96',
            '#3c6f9c',
            '#dd6892',
            '#f9c6ba',
            '#5edfff',
            '#f0134d',
            '#40bfc1',
            '#3e64ff',
            '#52de97',
            '#8105d8',
            '#fda77f',
        ]
        const grayLight = '#e6e6e6'
        const grayLightTxt = '#e1e1e1'
        const gray = '#bdbdbd'
        const wd = 30
        const wh = 10
        const w = 250
        const h = 200
        const chart = d3.select('.chart')
        let maxY = 0
        datas.forEach(data => {
            data.forEach(y => {
                if (y > maxY) maxY = y
            })
        })
        const scaleY = d3
            .scaleLinear()
            .range([0, h])
            .domain([0, maxY])

        // 水平線
        const hozG = chart.append('g')
        const hozData = []
        const hozLen = 10
        for (let i = 0; i < hozLen; i++) {
            const val = maxY / (hozLen - 1)
            if (i === 0) {
                hozData.push(0)
            } else {
                hozData.push(hozData[i - 1] + val)
            }
        }
        hozG.selectAll('text')
            .data(hozData.sort((a, b) => b - a))
            .enter()
            .append('text')
            .attr('x', 0)
            .attr('y', (d, i) => (h / (hozLen - 1)) * i + 4 + wh)
            .style('font-size', '12px')
            .attr('fill', (d, i) => (i % 2 === 1 ? grayLightTxt : gray))
            .text(d => ~~d)
        hozG.selectAll('line')
            .data(hozData)
            .enter()
            .append('line')
            .attr('x1', wd)
            .attr('x2', w + wd)
            .attr('y1', (d, i) => (h / (hozLen - 1)) * i + wh)
            .attr('y2', (d, i) => (h / (hozLen - 1)) * i + wh)
            .attr('stroke', (d, i) => (i % 2 === 1 ? grayLight : gray))

        // 月份
        const months = Array.from(new Array(12), (d, i) => i + 1)
        const verG = chart.append('g')
        verG.selectAll('text')
            .data(months)
            .enter()
            .append('text')
            .attr(
                'x',
                (d, i) => (w / months.length) * i + w / months.length + wd - 6,
            )
            .attr('y', h + wh + 20)
            .style('font-size', '12px')
            .style('fill', gray)
            .text(d => String(d).padStart(2, '0'))

        // 折線圖
        datas.forEach((data, index) => {
            const linesG = chart
                .append('g')
                .style('transform', `translateY(${h}px)`)
            linesG
                .selectAll('line')
                .data(data)
                .enter()
                .append('line')
                .attr('x1', (d, i) => (w / data.length) * i + wd)
                .attr('x2', (d, i) => (w / data.length) * (i + 1) + wd)
                .attr('y1', (d, i) => -scaleY(i - 1 < 0 ? 0 : data[i - 1]) + wh)
                .attr('y2', d => -scaleY(d) + wh)
                .attr('stroke', colors[index])
                .attr('stroke-width', 2)
        })
    },
    // beforeDestroy() {},
}
</script>
<style lang="sass" scoped>
@import '../style/chart'
</style>