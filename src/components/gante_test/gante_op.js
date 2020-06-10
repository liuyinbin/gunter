
import {mapState,mapMutations} from 'vuex';
export default {
    data(){
        return{
            fullScreen: false,//是否全屏模式
            today: '今天',
            buttonList: [
                {
                    value: 1,
                    text: '天'
                },
                {
                    value: 2,
                    text: '周'
                },
                {
                    value: 3,
                    text: '月'
                },
                {
                    value: 4,
                    text: '季'
                },
                {
                    value: 5,
                    text: '年'
                },
            ]
        }
    },
    mounted(){
        document.addEventListener('fullscreenchange',this.changeScreen);
    },
    methods: {
        // 回到今天
        toToday(){
            let today = document.getElementById('today-ganteview-column');
            let ganteview = document.getElementsByClassName('ganteview')[0];
            if(ganteview){
                let left = today.offsetLeft - ganteview.clientHeight/2;
                if(left<0){
                    left = 0
                }
                ganteview.scrollLeft = left;
            }
        },
        //切换模式
        trickMode(item) {
            this.init({time_mode: item}, false);
        },
        //切換模式
        op_time_mode(mode){
            this.time_mode+=mode;
            if(this.time_mode<=1){
                this.time_mode = 1;
            }
            if(this.time_mode>=5){
                this.time_mode=5
            }
            this.init({time_mode: this.time_mode}, false);
        },
        //全屏 退出全屏
        toFullScreen(){
            let element = document.documentElement;
            // 判断是否已经是全屏
            // 如果是全屏，退出
            if (this.fullScreen) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                console.log('已还原！');
            } else {    // 否则，进入全屏
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullScreen) {
                    element.webkitRequestFullScreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.msRequestFullscreen) {
                    // IE11
                    element.msRequestFullscreen();
                }
                console.log('已全屏！');
            }
            // 改变当前全屏状态
            this.fullScreen = !this.fullScreen;
        },
        changeScreen(){
            if (document.fullscreenElement) {
                this.fullScreen = true;
            } else {
                this.fullScreen = false;
            }
            setTimeout(()=>{
                this.init({}, false);
            },500)
        },
    },
    destroyed(){
        document.removeEventListener('fullscreenchange',this.changeScreen);
    }
}
