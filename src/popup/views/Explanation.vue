<template>
    <main class="root">
        <Header>
            <span
                class="go-home"
                @click="goToHome"
            >
                <i class="go-home__icon fas fa-long-arrow-alt-left"></i>
                返回首頁
            </span>
        </Header>
        <ul class="navs">
            <li
                class="navs__nav"
                :class="{'navs__nav--active': selectedNav === index}"
                v-for="(nav, index) in navs"
                :key="index"
                @click="changeNav(index)"
            >{{nav}}</li>
        </ul>
        <figure
            class="footer-img"
            v-if="!(selectedNav === 4)"
        >
            <img
                src="@/assets/explanation-1.png"
                alt=""
                class="footer-img__pic"
            >
            <i
                class="footer-img__icon"
                :style="{left: (selectedNav > 1 ? 83 : 25) + selectedNav * 56 + 'px'}"
            >
                <img
                    src="@/assets/explanation-2.png"
                    alt=""
                >
            </i>
        </figure>
        <article
            class="content"
            v-if="selectedNav === 0"
        >
            <strong class="content__title">重點</strong>
            <p>快捷預設為<span class="content__badge">Alt+Shift+Q</span>，當此網頁<span class="content__badge">有新增記憶項及在當前網頁</span>時，顏色會呈現<span class="content__badge">青色</span>，否則為灰色。</p>
            <p>當為青色時即可在該網頁上畫線，畫線的顏色為<span class="content__badge">顯示按鈕</span>的顏色，當開啟畫線功能時，滑鼠指標會有紅(及對應顏色)點，便可開始畫線，重按此按鈕及 ESC 皆可取消畫線功能。</p>
            <img
                src="@/assets/explanation-gif-point.gif"
                alt=""
            >
            <p><b class="content__tip">VoiceTube：</b>VoiceTube也支援畫線功能，<span class="content__badge">目前只支援畫在字幕裡(下圖)</span>，配合VoiceTube的單字本功能，可以大幅增加學習效率。</p>
            <img
                src="@/assets/explanation-5.png"
                alt=""
            >
            <p><b class="content__tip">順帶一提：</b><span class="content__badge">Alt+Q</span>為擴充頁面開啟快捷。</p>
        </article>
        <article
            class="content"
            v-if="selectedNav === 1"
        >
            <strong class="content__title">顯示</strong>
            <p>快捷預設為<span class="content__badge">Alt+Shift+W</span>，當此網頁<span class="content__badge">有新增記憶項及在當前網頁</span>時，顏色會呈現<span class="content__badge">紅(及對應顏色)色</span>，否則為灰色。</p>
            <p>自身的顏色為畫筆的顏色，會新增至對應顏色的項目裡，可以<span class="content__badge">點擊項目名前的重點數切換顏色。</span></p>
            <img
                src="@/assets/explanation-3.png"
                alt=""
            >
            <p><b class="content__tip">圖片補充：</b>如果點擊<span class="content__badge">編輯</span>即可更改名字，如果點擊<span class="content__badge">名字</span>將會打開該記憶連結，預設為劃線時的寬度，所以若有多螢幕要看，建議首次登入的<span class="content__badge">預設寬度設定最小螢幕寬</span>，此外，<span class="content__badge">被點擊過的記憶項將會反灰並畫線，代表你查看過，接著 chrome 擴充的提醒數將會減少，chrome 擴充的提醒數為今日未查看的項目數。</span></p>
            <p><b class="content__tip">順帶一提：</b>如果在未顯示狀態下畫線，畫完也不會顯示，反之，若在顯示狀態下畫線，線就會直接顯示在畫面上。</p>
        </article>
        <article
            class="content"
            v-if="selectedNav === 2"
        >
            <strong class="content__title">新增</strong>
            <p>點擊按鈕後會彈出視窗，輸入名字後按下新增便可新增記憶項，<span class="content__badge">一個連結只能新增一次</span>，除非您勾選(下圖)是否新增顏色的選項，才可為同連結新增多個項目，上限數預設為<span class="content__badge">9</span>筆。</p>
            <img
                src="@/assets/explanation-4.png"
                alt=""
            >
            <p><b class="content__tip">順帶一提：</b>記憶時間點採用<span class="content__badge">艾賓浩斯記憶遺忘曲線</span>來安排複習時間，時間為第<span class="content__badge">(1, 2, 4, 7, 15, 30, 90)</span>天進行複習，擴充會提示當天尚未複習的項目數量。</p>
        </article>
        <article
            class="content"
            v-if="selectedNav === 3"
        >
            <strong class="content__title">刪除</strong>
            <p>當此網頁<span class="content__badge">有新增記憶項及在當前網頁</span>時，顏色會呈現<span class="content__badge">青色</span>，否則為灰色，連點此按鈕兩下即可刪除此連結記憶項。</p>
            <p><b class="content__tip">請注意：</b><span class="content__badge content__badge--danger">是刪除所有該連結的記憶項</span>。</p>
        </article>
        <article
            class="content"
            v-if="selectedNav === 4"
            style="margin-top: 20px !important;"
        >
            <strong class="content__title">寬度</strong>
            <p>快捷預設為<span class="content__badge">Alt+Shift+D</span>，使用後該瀏覽器寬度將會變成你設定的寬度(首次登入及選單裡的寬度)。</p>
            <p><b class="content__tip">再次提醒：</b>如前面說明所說，建議<span class="content__badge">寬度設定您所有會用到螢幕的最小螢幕寬</span>，如果要跨螢幕複習的話，否則選擇當前螢幕寬度即可。</p>
        </article>
    </main>
</template>
<script>
import Header from '../components/Header'
export default {
    data() {
        return {
            navs: ['重點', '顯示', '新增', '刪除', '寬度'],
            selectedNav: 0,
        }
    },
    // props: {},
    components: { Header },
    // computed: {},
    methods: {
        goToHome() {
            this.$router.push('/')
        },
        changeNav(index) {
            return (this.selectedNav = index)
        },
    },
    // watch: {},
    // created() {},
    // mounted() {},
    // beforeDestroy() {},
}
</script>
<style lang="sass" scoped>
@import '../style/explanation'
</style>