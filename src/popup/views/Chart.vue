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
        <svg
            class="chart"
            ref="chartRef"
        >
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
        }
    },
    // props: {},
    components: {
        Header,
        Select,
    },
    computed: {
        listsDb() {
            return this.$db.ref('USERS/' + this.userId + '/LISTS')
        },
        padNums() {
            return nums => String(nums).padStart(3, '0')
        },
        weekFirst() {
            return (type = 'YY-MM-DD hh:mm:ss') =>
                this.formatDate(
                    new Date(
                        `${new Date().getFullYear()}-${new Date().getMonth() +
                            1}-${new Date(
                            new Date().getTime() -
                                86400000 *
                                    (new Date().getDay() === 0
                                        ? 6
                                        : new Date().getDay() - 1),
                        ).getDate()} 00:00:00`,
                    ),
                    type,
                )
        },
        weekLast() {
            return (type = 'YY-MM-DD hh:mm:ss') =>
                this.formatDate(
                    new Date(
                        new Date(this.weekFirst()).getTime() + 86400000 * 6,
                    ),
                    type,
                )
        },
    },
    methods: {
        formatDate(date, type) {
            return this.$bg.formatDate(date, type)
        },
        goToHome() {
            this.$router.push('/')
        },
        snapEmpty(snap, len, paramDays) {
            if (!snap.exists()) {
                this.pointNums = 0
                this.docNums = 0
                this.drawChart(Array.from(new Array(len), () => 0), paramDays)
                return false
            }
            return true
        },
        countMonthPointNums(snap) {
            const range = val => {
                const numCurrent = Number(this.selectedDetailVal)
                const lastDate = new Date(
                    new Date(
                        `${
                            numCurrent + 1 === 13
                                ? new Date().getFullYear() + 1
                                : new Date().getFullYear()
                        }-${numCurrent + 1 === 13 ? 1 : numCurrent + 1}-1`,
                    ).getTime() - 86400000,
                ).getDate()
                if (val >= lastDate || (val === 30 && val < lastDate))
                    return lastDate
                return val
            }
            const days = []
            for (let i = 0; i < 10; i++) {
                days.push(range((i + 1) * 3))
            }

            if (!this.snapEmpty(snap, 10, days)) return
            const linesObj = {}
            let pointNums = 0
            let docNums = 0
            const firstDay = this.formatDate(
                new Date(
                    `${new Date().getFullYear()}-${this.selectedDetailVal}-1`,
                ),
            )
            for (let i = 0; i < days.length; i++) {
                const date = this.formatDate(
                    new Date(
                        `${new Date().getFullYear()}-${
                            this.selectedDetailVal
                        }-${days[i]}`,
                    ),
                )
                linesObj[date] = 0
            }
            snap.forEach(doc => {
                const { customLen, createTime, lines } = doc.val()
                function setLen() {
                    if (customLen) {
                        return customLen
                    } else if (lines) {
                        return lines.length
                    } else {
                        return 0
                    }
                }
                const linesLength = setLen()
                pointNums += linesLength
                docNums++
                const current = Number(createTime.split(' ')[0].substr(-2))
                for (let key in linesObj) {
                    if (key.substr(-2) === '04') {
                        const max = Number(key.substr(-2))
                        const min = 1
                        if (current >= min && current <= max) {
                            linesObj[key] += linesLength
                            break
                        }
                    } else {
                        const date = key.substr(-2)
                        const max = Number(date)
                        const min = Number(date) - 3
                        if (current >= min && current <= max) {
                            linesObj[key] += linesLength
                            break
                        }
                    }
                }
            })
            this.pointNums = pointNums
            this.docNums = docNums
            const linesData = []
            for (let key in linesObj) {
                linesData.push(linesObj[key])
            }
            this.drawChart(linesData, days)
        },
        countYearPointNums(snap) {
            if (!this.snapEmpty(snap, 12)) return
            const linesObj = {}
            let pointNums = 0
            let docNums = 0
            for (let i = 0; i < 12; i++) {
                const date = this.formatDate(
                    new Date(
                        `${this.selectedDetailVal}-${String(i + 1).padStart(
                            2,
                            '0',
                        )}-01 00:00:00`,
                    ),
                )
                linesObj[date] = 0
            }
            snap.forEach(doc => {
                const { customLen, createTime, lines } = doc.val()
                function setLen() {
                    if (customLen) {
                        return customLen
                    } else if (lines) {
                        return lines.length
                    } else {
                        return 0
                    }
                }
                const linesLength = setLen()
                pointNums += linesLength
                docNums++
                for (let key in linesObj) {
                    const month = new Date(key).getMonth() + 1
                    const current = new Date(createTime).getMonth() + 1
                    if (current === month) {
                        linesObj[key] += linesLength
                        break
                    }
                }
            })
            this.pointNums = pointNums
            this.docNums = docNums
            const linesData = []
            for (let key in linesObj) {
                linesData.push(linesObj[key])
            }
            this.drawChart(linesData)
        },
        countWeekPointNums(snap) {
            if (!this.snapEmpty(snap, 7)) return
            const linesObj = {}
            let pointNums = 0
            let docNums = 0
            const firstDay = this.weekFirst('YY-MM-DD')
            for (let i = 0; i < 7; i++) {
                const date = this.formatDate(
                    new Date(new Date(firstDay).getTime() + 86400000 * i),
                )
                linesObj[date] = 0
            }
            snap.forEach(doc => {
                const { customLen, createTime, lines } = doc.val()
                function setLen() {
                    if (customLen) {
                        return customLen
                    } else if (lines) {
                        return lines.length
                    } else {
                        return 0
                    }
                }
                const linesLength = setLen()
                pointNums += linesLength
                docNums++
                linesObj[createTime.split(' ')[0]] += linesLength
            })
            this.pointNums = pointNums
            this.docNums = docNums
            const linesData = []
            for (let key in linesObj) {
                linesData.push(linesObj[key])
            }
            this.drawChart(linesData)
        },
        drawChart(linesData = [], paramDays) {
            const clearChart = (self => {
                const chart = self.$refs.chartRef
                ;[...chart.children].forEach(el => chart.removeChild(el))
            })(this)

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
            // function handleMouseMove(ev) {
            //     console.log(ev)
            // }
            // this.$refs.chartRef.addEventListener(`mousemove`, handleMouseMove)
            let maxY = 0
            linesData.forEach(y => {
                // data.forEach(y => {
                if (y > maxY) maxY = y
                // })
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
                .text(d => Math.ceil(d))
            hozG.selectAll('line')
                .data(hozData)
                .enter()
                .append('line')
                .attr('x1', wd)
                .attr('x2', w + wd)
                .attr('y1', (d, i) => (h / (hozLen - 1)) * i + wh)
                .attr('y2', (d, i) => (h / (hozLen - 1)) * i + wh)
                .attr('stroke', (d, i) => (i % 2 === 1 ? grayLight : gray))

            // 時間
            const days =
                paramDays ||
                Array.from(
                    new Array(linesData.length /*linesData[0].length*/),
                    (d, i) => i + 1,
                )
            const verG = chart.append('g')
            verG.selectAll('text')
                .data(days)
                .enter()
                .append('text')
                .attr(
                    'x',
                    (d, i) => (w / days.length) * i + w / days.length + wd - 6,
                )
                .attr('y', h + wh + 20)
                .style('font-size', '12px')
                .style('fill', gray)
                .text(d => String(d).padStart(2, '0'))

            // 折線圖
            // linesData.forEach((data, index) => {
            const linesG = chart
                .append('g')
                .style('transform', `translateY(${h}px)`)
            const length = linesData.length
            const x1 = (d, i) => (w / length) * i + wd
            const x2 = (d, i) => (w / length) * (i + 1) + wd
            const y1 = (d, i) => -scaleY(i - 1 < 0 ? 0 : linesData[i - 1]) + wh
            const y2 = d => -scaleY(d) + wh
            const color = colors[0] /*colors[0]*/
            linesG
                .selectAll('line')
                .data(linesData)
                .enter()
                .append('line')
                .attr('class', 'chart__hover-main-line')
                .attr('x1', x1)
                .attr('x2', x1)
                .attr('y1', y1)
                .attr('y2', y1)
                .style('opacity', 0)
                .attr('stroke', color)
                .attr('stroke-width', 2)
                .style('transition', 'stroke .6s ease')
                .transition()
                .ease(d3.easeLinear)
                .delay((d, i) => i * 200)
                .duration(200)
                .style('opacity', 1)
                .attr('x2', x2)
                .attr('y2', y2)

            const linesHoverG = chart
                .append('g')
                .style('transform', `translateY(${h}px)`)
            linesHoverG
                .selectAll('text')
                .data(linesData)
                .enter()
                .append('text')
                .attr('class', 'chart__hover-text')
                .attr('text-anchor', 'middle')
                .attr('x', -(h / 2))
                .attr('y', (d, i) => x2(d, i) * -1 + 16)
                .style('font-size', '14px')
                .style('font-weight', '900')
                .attr('fill', color)
                .attr('transform', 'rotate(90)')
                .style('opacity', 0)
                .style('transition', 'opacity .6s ease')
                .style('font-family', '微軟正黑體')
                .text(d => Math.ceil(d))
            linesHoverG
                .selectAll('line')
                .data(linesData)
                .enter()
                .append('line')
                .attr('class', 'chart__hover-line')
                .attr('x1', x2)
                .attr('x2', x2)
                .attr('y1', 0)
                .attr('y2', h)
                .attr('stroke', gray)
                .attr('stroke-width', 1)
                .style('transform', `translateY(${-h + wh}px)`)
                .style('opacity', 0)
                .style('transition', 'opacity .6s ease')
            linesHoverG
                .selectAll('circle')
                .data(linesData)
                .enter()
                .append('circle')
                .attr('class', 'chart__hover-circle')
                .attr('cx', x2)
                .attr('cy', y2)
                .attr('r', 4)
                .attr('fill', color)
                .style('opacity', 0)
                .style('transition', 'opacity .6s ease')
            linesHoverG
                .selectAll('rect')
                .data(linesData)
                .enter()
                .append('rect')
                .attr('x', x1)
                .attr('y', 0)
                .attr('width', w / linesData.length)
                .attr('height', h + wh)
                .style('opacity', 0)
                .style('transform', `translateY(${-h + wh}px)`)
                .on('mouseenter', (d, i) => {
                    const elName = ['text', 'circle', 'line']
                    for (let index = 0; index < elName.length; index++) {
                        document.getElementsByClassName(
                            `chart__hover-${elName[index]}`,
                        )[i].style.opacity = 1
                    }
                    ;[
                        ...document.getElementsByClassName(
                            `chart__hover-main-line`,
                        ),
                    ].forEach((el, index) => {
                        if (index !== i) {
                            el.setAttribute('stroke', '#c0ebef')
                        }
                    })
                })
                .on('mouseleave', (d, i) => {
                    const elName = ['text', 'circle', 'line']
                    for (let index = 0; index < elName.length; index++) {
                        document.getElementsByClassName(
                            `chart__hover-${elName[index]}`,
                        )[i].style.opacity = 0
                    }
                    ;[
                        ...document.getElementsByClassName(
                            `chart__hover-main-line`,
                        ),
                    ].forEach((el, index) => {
                        el.setAttribute('stroke', color)
                    })
                })
            // })

            // 初始顯示條
            chart
                .append('line')
                .style('transform', `translateY(${h}px)`)
                .attr('x1', wd)
                .attr('x2', wd)
                .attr('y1', wh)
                .attr('y2', -(h + wh))
                .attr('stroke', color)
                .attr('stroke-width', 2)
                .transition()
                .ease(d3.easeLinear)
                .duration(200 * linesData.length)
                .attr('x1', wd + w)
                .attr('x2', wd + w)
                .style('opacity', 0)
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
                    .orderByChild('createTime')
                    .startAt(this.weekFirst())
                    .endAt(this.weekLast())
                    .once('value', this.countWeekPointNums)
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
                        .orderByChild('createTime')
                        .startAt(
                            this.formatDate(
                                new Date(
                                    `${new Date().getFullYear()}-${val}-1 00:00:00`,
                                ),
                                'YY-MM-DD hh:mm:ss',
                            ),
                        )
                        .endAt(
                            this.formatDate(
                                new Date(
                                    new Date(
                                        `${
                                            val * 1 + 1 === 13
                                                ? new Date().getFullYear() + 1
                                                : new Date().getFullYear()
                                        }-${
                                            val * 1 + 1 === 13 ? 1 : val * 1 + 1
                                        }-1 23:59:59`,
                                    ).getTime() - 86400000,
                                ),
                                'YY-MM-DD hh:mm:ss',
                            ),
                        )
                        .once('value', this.countMonthPointNums)
                } else {
                    this.listsDb
                        .orderByChild('createTime')
                        .startAt(
                            this.formatDate(
                                new Date(`${val}-1-1 00:00:00`),
                                'YY-MM-DD hh:mm:ss',
                            ),
                        )
                        .endAt(
                            this.formatDate(
                                new Date(`${val}-12-31 23:59:59`),
                                'YY-MM-DD hh:mm:ss',
                            ),
                        )
                        .once('value', this.countYearPointNums)
                }
            }
        },
    },
    created() {
        chrome.storage.local.get('id', result => {
            const { id } = result
            this.userId = id
            this.selectedRangeVal = 'week'
        })
    },
    mounted() {},
    // beforeDestroy() {},
}
</script>
<style lang="sass" scoped>
@import '../style/chart'
</style>